import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import *
from flask import current_app, g
from tierrasur.db import get_db
from datetime import datetime
import pandas as pd
from io import BytesIO
import logging

logging.basicConfig(level=logging.DEBUG)

def envio_mail(usuario, nombre, contrasenia):
    # Cargo las variables de entorno
    sg_key = current_app.config['SG_KEY']
    to_emm = consulta_emails()

    message = Mail(
        from_email='tierrasur.sa2020@gmail.com',
        to_emails=to_emm,
        subject='El usuario {} solicita acceso a Tierrasur-Web'.format(usuario),
        html_content='<h2>Solicitud de acceso a la plataforma</h2><div><p>Datos del usuario solicitante:</p><ul><li>Usuario: {} </li><li>Nombre: {} </li><li>Contraseña: {} </li></ul></div>'.format(usuario, nombre, contrasenia)
    )

    try:
        sg = SendGridAPIClient(sg_key)
        response = sg.send(message)
        print(response.status_code)
        print(response.body)
        print(response.headers)
        print('Mail enviado con exito')
    except Exception as e:
        print('Ha ocurrido un error.')
        print(e.message)


def consulta_emails():
    lista_emails = []

    db, c = get_db()
    c.execute(
        'select email from mails'
    )
    cc = c.fetchall()
    if cc is None:
        #lista_emails.append('hda54software@gmail.com')
        print(f'La lista esta vacia parece ser: {cc}')
    else:    
        for item in cc:
            lista_emails.append(item['email'])
    return lista_emails


def anio_campania():
    hoy = datetime.now()
    dia = hoy.day
    mes = hoy.month
    anio = hoy.year

    campania = None

    if (dia <= 31 and mes <= 5):
        anio_anterior = hoy.strftime("%y")  # Año anterior en formato de dos dígitos
        anio_actual = (hoy.year - 1) % 100  # Restando 1 al año actual y formateando
        campania = f'{anio_actual:02}/{anio % 100:02}'  # Ambos años con dos dígitos
    else:
        anio_siguiente = (anio + 1) % 100  # Año siguiente en formato de dos dígitos
        campania = f'{anio % 100:02}/{anio_siguiente:02}'

    return campania

# Funcion de obtención de registros
def obtRegistros(id_usuario, fecha_inicio, fecha_final):
    """
    Función que se utiliza para obtener los registros que cargaron los empleados.
    """
    db, c = get_db()
    registros = []
    error = None
    # Obtengo el rol que tiene el usuario
    c.execute(
        'select * from usuarios where nick = %s', (id_usuario,)
    )    
    respuesta = c.fetchone()
    rol_id = respuesta['rol_id']
    logging.debug(f'El rol del usuario es el: {rol_id}')

    if not id_usuario or not fecha_inicio or not fecha_final:
        error = 'Faltan completar las fechas.'
        return registros, error
    elif rol_id != 5:
        c.execute(
        'select * from ordenes where creado_por = %s and fecha between %s and %s', (id_usuario, fecha_inicio, fecha_final)
        )
        ordenes = c.fetchall()
        logging.debug(ordenes)

        if not ordenes:
            error = 'No existen registros para el rango de fechas especificado.'
            logging.debug('Entre al if donde no hay ordenes')
            return registros, error
        else:
            for orden in ordenes:
                nro_c = orden['id']
                usuario = orden['creado_por']
                logging.debug(f'El nro_c es: {nro_c}')
                c.execute(
                    'select * from hoja_tareas where nro_c = %s order by fecha desc', (nro_c,)
                )
                reg = c.fetchall()
                for r in reg:
                    reg_dic = {
                        'id': r['id'],
                        'up': r['up'],
                        'lote': r['lote'],
                        'actividad': r['actividad'],
                        'fecha': r['fecha'].isoformat(),
                        'cantidad': r['cant'],
                        'detalle': r['detalle'],
                        'codigo': r['codigo'],
                        'uta': r['uta'],
                        'restar': r['restar'],
                        'campania': r['campa'],
                        'pc': r['pc'],
                        'fechata': r['fechata'],
                        'nro_c': r['nro_c'],
                        'cplan': r['cplan'],
                        'borrador': r['borrador'],
                        'precio': r['precio'],
                        'usuario': usuario
                    }
                    registros.append(reg_dic)
            return registros, error
    else:
        c.execute(
        'select * from ordenes where fecha between %s and %s', (fecha_inicio, fecha_final)
        )
        ordenes = c.fetchall()
        logging.debug(ordenes)

        if not ordenes:
            error = 'No existen registros para el rango de fechas especificado.'
            logging.debug('Entre al if donde no hay ordenes')
            return registros, error
        else:
            for orden in ordenes:
                usuario = orden['creado_por']
                nro_c = orden['id']
                logging.debug(f'El nro_c es: {nro_c} y el usuario es {usuario}')
                c.execute(
                    'select * from hoja_tareas where nro_c = %s order by fecha desc', (nro_c,)
                )
                reg = c.fetchall()
                for r in reg:
                    reg_dic = {
                        'id': r['id'],
                        'up': r['up'],
                        'lote': r['lote'],
                        'actividad': r['actividad'],
                        'fecha': r['fecha'].isoformat(),
                        'cantidad': r['cant'],
                        'detalle': r['detalle'],
                        'codigo': r['codigo'],
                        'uta': r['uta'],
                        'restar': r['restar'],
                        'campania': r['campa'],
                        'pc': r['pc'],
                        'fechata': r['fechata'],
                        'nro_c': r['nro_c'],
                        'cplan': r['cplan'],
                        'borrador': r['borrador'],
                        'precio': r['precio'],
                        'usuario': usuario
                    }
                    registros.append(reg_dic)
            return registros, error

# Funcion para descargar un archivo .xlsx
def descargaExcel(nick_usuario, fecha_inicio, fecha_final):
    """
    Funcion que devuelve un dataframe para su posterior conversion en excel con los registros del dia.
    """
    registros, error = obtRegistros(nick_usuario, fecha_inicio, fecha_final)
            
    if len(registros) == 0:
        error = 'No hay registros para mostrar'
    else:
        df = pd.DataFrame(registros)
        return df
    
# Filtro de usuarios
def filtrosUsuarios():
    """
    Funcion que se utiliza para filtrar por usuario los registros cargados
    """
    print('Entre a la funcion')
    db, c = get_db()
    error = None
    usuarios = []
    
    try:
        c.execute(
            'select * from usuarios where rol_id <> 5'
        )
        cursor = c.fetchall()
        for i in cursor:
            usu = {
                'id': i['id'],
                'nick': i['nick'],
                'rol_id': i['rol_id']
            }
            usuarios.append(usu)
        return usuarios, error
    except Exception as e:
        error = f'No se pudo recuperar a los usuarios, error: {e}'
        return usuarios, error

    