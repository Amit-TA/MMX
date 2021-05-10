import sys
activate_this = '/home/ubuntu/demodata/RevampMMX/revampenv/bin/activate_this.py'
execfile(activate_this, dict(__file__=activate_this))
sys.path.insert(0, "/home/ubuntu/demodata/RevampMMX/")

from simulation import *
from server import app as application
