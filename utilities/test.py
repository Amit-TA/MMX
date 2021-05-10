import os
print os.path.abspath(__file__)
print os.path.split(os.path.dirname(os.path.abspath(__file__)))[0]
