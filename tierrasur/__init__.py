import os
from flask import Flask
from flask_cors import CORS

def create_app():
    app = Flask(__name__)

    CORS(app)

    app.config.from_mapping(
        SECRET_KEY='mikey',
        DATABASE_HOST=os.environ.get('FLASK_DATABASE_HOST'),
        DATABASE_PASSWORD=os.environ.get('FLASK_DATABASE_PASSWORD'),
        DATABASE_USER=os.environ.get('FLASK_DATABASE_USER'),
        DATABASE=os.environ.get('FLASK_DATABASE'),
        SG_KEY = os.environ.get('SG_KEY')

    )

    from . import db
    from . import funciones_varias

    db.init_app(app)

    from . import auth
    from . import home
    from . import visor_registros

    app.register_blueprint(auth.bp)
    app.register_blueprint(home.bp)
    app.register_blueprint(visor_registros.bp)
    
    @app.route('/prueba')
    def prueba():
        return 'Esta funcando'
    
    return app

app = create_app()


