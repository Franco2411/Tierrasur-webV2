import functools
from flask import (
    Blueprint, flash, g, render_template, request, url_for, session, redirect, jsonify
)
from werkzeug.security import check_password_hash, generate_password_hash
from tierrasur.db import get_db
from tierrasur.funciones_varias import envio_mail

bp = Blueprint('auth', __name__, url_prefix='/auth')

@bp.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        nombre = request.form['nomCompleto']

        db, c = get_db()
        error = None
        c.execute(
            'select id from usuarios where nick = %s', (username,)
        )
        if not username:
            error = 'El username es requerido'
        if not password:
            error = 'La contraseña es requerida'
        if not nombre:
            error = 'El nombre es requerido'
        elif c.fetchone() is not None:
            error = 'El usuario {} se encuentra registrado'.format(nombre)
        
        if error is None:
            
            try:
                envio_mail(username, nombre, password)
                print('Solicitud enviada')
                return redirect(url_for('auth.login'))
            except Exception as e:
                print(f'Solicitud no pudo ser enviada: {e}')
                error = f'Solicitud no pudo ser enviada: {e}'           

            

        flash(error)
    return render_template('auth/register.html')

@bp.route('/save_request', methods=['POST', 'GET'])
def save_request():
    db, c = get_db()
    data = request.get_json()
    error = None

    c.execute(
        'select id from usuarios where nick = %s', (data.get('username'),)
    )

    if not data.get('username'):
        error = 'El username es requerido'
    if not data.get('nombre'):
        error = 'El nombre es requerido'
    if data.get('password') == '':
        error = 'La contraseña es requerida'
    elif c.fetchone() is not None:
        error = 'El usuario {} ya se encuentra registrado.'.format(data['nombre'])
    
    if error is None:
        try:
            envio_mail(data['username'], data['nombre'], data['password'])
            print('Solicitud enviada')
            return jsonify({'success': True, 'message': 'Solicitud enviada con exito'})
        except Exception as e:
            print(f'Solicitud no pudo ser enviada: {e}')
            error = f'La solicitud no pudo ser enviada: {e}'
    
    return jsonify({'success': False, 'message': error})
    

    

@bp.route('/login', methods=['GET','POST'])
def login():
    if request.method == 'POST':
        password = request.form['password']
        nombre = request.form['usuario']

        db, c = get_db()
        error = None
        c.execute(
            'select * from usuarios where nick = %s', (nombre,)
        )
        user = c.fetchone()
        if user is None:
            error = 'Usuario no encontrado'
        elif password != user['pass']:
            error = 'Usuario y/o contraseña incorrectos'
        
        if error is None:
            session.clear()
            session['user_id'] = user['id']
            return redirect(url_for('home.index'))
        
        flash(error)
    return render_template('auth/login.html')


@bp.route('/logout', methods=['POST', 'GET'])
def logout():
    user = session.get('user_id')
    if user is not None:
        session.clear()
        
        return redirect(url_for('auth.login'))


@bp.before_app_request
def load_logged_in_user():
    user_id = session.get('user_id')

    if user_id is None:
        g.user = None
    else:
        db, c = get_db()
        c.execute(
            'select * from usuarios where id = %s', (user_id,)
        )
        g.user = c.fetchone()


def required_login(view):
    @functools.wraps(view)
    def wrapped_view(**kwargs):
        if g.user is None:
            return redirect(url_for('auth.login'))

        return view(**kwargs)
    return wrapped_view    