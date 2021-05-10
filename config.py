import os

rootDir = os.path.dirname(os.path.abspath(__file__))
#print rootDir

dataPath = rootDir + os.sep + "data" + os.sep
#print dataPath

SQLALCHEMY_DATABASE_URI = "mysql://root:tiger@localhost/cbc"
SQLALCHEMY_ECHO = False
SECRET_KEY = 'secret_key'
SESSION_TYPE = 'filesystem'
DEBUG = False

db = 'cbc'
password = 'tiger'
userName = 'root'
