from flask import (
    Blueprint, flash, g, redirect, render_template, request, url_for, session, jsonify, send_file
)
from werkzeug.exceptions import abort
from tierrasur.auth import required_login
from tierrasur.db import get_db
from datetime import datetime, timedelta
import logging
from tierrasur.funciones_varias import anio_campania, descargaExcel, obtRegistros, filtrosUsuarios
from io import BytesIO
import pandas as pd
from xlsxwriter import Workbook

bp = Blueprint('visor_registros', __name__)

@bp.route('/get_registros', methods=['GET'])
@required_login
def get_registros():

    return render_template('visor_registros.html')

# Api para recuperar los registros hechos por un usuario
@bp.route('/api/get_registers', methods=['GET'])
def get_registers():
    
    id_usuario = request.args.get('nick_usuario')
    fecha_inicio1 = datetime.strptime(request.args.get('fecha1'), '%d/%m/%Y')
    fecha_final1 = datetime.strptime(request.args.get('fecha2'), '%d/%m/%Y')
    fecha_inicio = fecha_inicio1 - timedelta(hours=3)
    fecha_final = fecha_final1 - timedelta(hours=3)
    logging.debug(f'Los datos que manda el front son: {id_usuario}, fecha1: {fecha_inicio}, fecha2: {fecha_final}')
    

    if not id_usuario or id_usuario == 'null':
        id_usuario = g.user['nick']
        registros, error = obtRegistros(id_usuario, fecha_inicio, fecha_final)
        logging.debug(f'Los datos enviados via api son id: {id_usuario}, fecha1: {fecha_inicio}, fecha2: {fecha_final}')
        return jsonify({'success': True, 'data': registros, 'message': error})
    else:
        registros, error = obtRegistros(id_usuario, fecha_inicio, fecha_final)
        return jsonify({'success': True, 'data': registros, 'message': error})

    

    

@bp.route('/api/download_excel', methods=['GET'])
@required_login
def download_excel():
    error = None
    id_usuario = request.args.get('nick_usuario')
    fecha_inicio = datetime.strptime(request.args.get('fecha1'), '%d/%m/%Y')
    fecha_final = datetime.strptime(request.args.get('fecha2'), '%d/%m/%Y')

    if not id_usuario or id_usuario == 'null':
        id_usuario = g.user['nick']
        registros = descargaExcel(id_usuario, fecha_inicio, fecha_final)
    else:
        # Obtengo los registros        
        registros = descargaExcel(id_usuario, fecha_inicio, fecha_final)
    

    
    if error is not None:
        return jsonify({'success': True, 'message': 'No existen registros para descargar', 'data': False})
    else:
        # Creo el excel en memoria
        output = BytesIO()
        writer = pd.ExcelWriter(output, engine='xlsxwriter')

        # Escribo los datos en el excel
        registros.to_excel(writer, index=False, sheet_name='Registros del dia')

        # Guardo el archivo
        writer.close()
        output.seek(0)

        # Pongo el nombre al archivo
        filename = f"registros_{datetime.now().strftime('%Y-%m-%d')}.xlsx"

        # Retorno el archivo
        return send_file(output, 
                     mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                     download_name=filename,
                     as_attachment=True)

@bp.route('/api/get_filters', methods=['GET'])
def get_filters():

    logging.debug('La api get_filter fue llamada correctamente')

    users, error = filtrosUsuarios()

    if error is None:
        return jsonify({'success': True, 'data': users, 'message': 'Exito'})
    else:
        return jsonify({'success': False, 'data': users, 'message': error})
