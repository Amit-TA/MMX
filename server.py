#!/usr/bin/python
import os
from simulation import app
from simulation import *
db.create_all()

#OLD
'''admin_user = User.query.filter_by(user_role = 'Admin').first()
if  admin_user is None:
    user = User('user' , 'Tiger!23', 'Admin')
    db.session.add(user)
    db.session.commit()'''

#NEW
admin_user = Users.query.filter(Users.UserType == 'Administrator').first()
if  admin_user is None:
    user = Users('admin','Administrator','t!geradmin',None,'userAdmin',None)
    db.session.add(user)
    db.session.commit()

if __name__ == '__main__':
    app.run(debug = True,host = "0.0.0.0", port = 1250)
