from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    db.init_app(app)
    CORS(app)

    from app.routes.appointments import appointments_bp
    from app.routes.general import general_bp

    app.register_blueprint(appointments_bp)
    app.register_blueprint(general_bp)

    return app
