import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql://root:@localhost/clinic'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
