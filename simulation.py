from datetime import datetime
import math, datetime
from flask import Flask,session, request, flash, url_for, redirect, render_template, abort ,g, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager
from flask_login import login_user , logout_user , current_user , login_required
from werkzeug.security import generate_password_hash, check_password_hash
import pdb
import json
from apps.get_contributions import *
import pandas as pd
import numpy as np
import redis
from flask_session import Session
from math import isnan
import simplejson
from numpy import nan
from flask_marshmallow import Marshmallow
from marshmallow import fields
from flask_googlelogin import GoogleLogin

app = Flask(__name__)
app.config.from_pyfile('config.py')
app.config.update(
    GOOGLE_LOGIN_CLIENT_ID='1032369186610-2mmgludb4pc0ttl2pjbkglk85ttf3go0.apps.googleusercontent.com',
    GOOGLE_LOGIN_CLIENT_SECRET='zxh3lttMfI6qTnQPMoP0OK8A',
    GOOGLE_LOGIN_REDIRECT_URI='http:///accelerators.tigeranalytics.com/MarketMixPlanner/oauth2callback',
    GOOGLE_LOGIN_SCOPES='https://www.googleapis.com/auth/userinfo.email')

db = SQLAlchemy(app)
ma = Marshmallow(app)

login_manager = LoginManager()
login_manager.init_app(app)
googlelogin = GoogleLogin(app, login_manager)
login_manager.login_view = 'login'
app.config['SESSION_TYPE'] = 'redis'
Session(app)


optimal_Data_spend=list()
optimal_out = dict()
optimal_new_df=pd.DataFrame()
optimal_roi_df=pd.DataFrame()
optimal_cost_df=pd.DataFrame()
optimal_base_out = dict()
optimal_base_df = pd.DataFrame()
optimal_base_roi_df = pd.DataFrame()
optimal_base_cost_df = pd.DataFrame()

#Old user
'''class User(db.Model):
	__tablename__ = "users"
	id = db.Column('user_id',db.Integer , primary_key=True)
	username = db.Column('username', db.String(20), unique=True , index=True)
	password = db.Column('password' , db.String(250))
	# email = db.Column('email',db.String(50),unique=True , index=True)
	registered_on = db.Column('registered_on' , db.DateTime)
	user_role  = db.Column('user_role', db.String(20))

	def __init__(self , username ,password, userrole = 'User'):
		self.username = username
		self.set_password(password)
		# self.email = email
		self.registered_on = datetime.utcnow()
		self.user_role = userrole

	def set_password(self , password):
		self.password = generate_password_hash(password)

	def check_password(self , password):
		return check_password_hash(self.password , password)

	def is_authenticated(self):
		return True

	def userRole(self):
		return self.user_role

	def is_active(self):
		return True

	def is_anonymous(self):
		return False

	def get_id(self):
		return unicode(self.id)

	def __repr__(self):
		return '<User %r>' % (self.username)'''

#New User

#New User Class

class Users(db.Model):
    __tablename__ = "newusers"

    Id = db.Column("Id",db.Integer,primary_key=True)
    UserName = db.Column('UserName',db.String(200),unique=True,nullable=False)
    UserType = db.Column('UserType',db.String(200),nullable=False)
    UserPassword = db.Column('UserPassword',db.String(200),nullable=False)
    ExpiryDate = db.Column('ExpiryDate',db.DateTime)
    LastLogin =  db.Column('LastLogin',db.DateTime)
    DisplayName = db.Column('DisplayName',db.String(200))
    DisplayPicture = db.Column('DisplayPicture',db.String(200))

    def __init__(self,UserName,UserType,UserPassword,ExpiryDate,DisplayName,DisplayPicture):
        self.UserName = UserName
        self.UserType = UserType
        self.set_password(UserPassword)
        self.ExpiryDate = ExpiryDate
        self.DisplayName = DisplayName
        self.DisplayPicture = DisplayPicture

    def set_password(self , UserPassword):
		self.UserPassword = generate_password_hash(UserPassword)

    def check_password(self , UserPassword):
        return check_password_hash(self.UserPassword , UserPassword)

    def check_validity(self , IpDate, UType):
        if UType == "External":
            current = datetime.date.today()
            if IpDate >= current:
                return True
            else:
                return False
        else:
            return True

    def is_authenticated(self):
		return True

    def userType(self):
		return self.UserType

    def userName(self):
		return self.DisplayName

    def userPicture(self):
		return self.DisplayPicture

    def is_active(self):
		return True

    def is_anonymous(self):
		return False

    def get_id(self):
		return unicode(self.Id)

    def __repr__(self):
		return '<User %r>' % (self.UserName)

class UsersSchema(ma.ModelSchema):
    class Meta:
        model = Users
    ExpDate = fields.String(attribute = "ExpiryDate")


class Hist(db.Model):
	__tablename__ = "histData"
	Category = db.Column('Category',db.String(50) , primary_key=True)
	Type = db.Column('Type',db.String(50) , primary_key=True)
	Y2015 = db.Column('Y2015',db.Float)
	Y2016 = db.Column('Y2016',db.Float)
	Y2017 = db.Column('Y2017',db.Float)

class optimData(db.Model):
    _tablename_ = "optimData"
    Total_Spend = db.Column('TotalSpend',db.Float, primary_key=True)
    DM = db.Column('DM',db.Float, primary_key=True)
    Digital = db.Column('Digital',db.Float, primary_key=True)
    Email = db.Column('Email',db.Float)
    Ext_Email = db.Column('Ext_Email',db.Float)
    MAGAZINE = db.Column('MAGAZINE',db.Float)
    OOH = db.Column('OOH',db.Float)
    PR = db.Column('PR',db.Float)
    Paid_Search = db.Column('Paid_Search',db.Float)
    Print = db.Column('Print',db.Float)
    RADIO = db.Column('RADIO',db.Float)
    TRADE_COOP = db.Column('TRADE_COOP',db.Float)
    TRADE_DM = db.Column('TRADE_DM',db.Float)
    TV = db.Column('TV',db.Float)
    base_year = db.Column('base_year',db.Float)


def filterNAN(y):
	temp = []
	for x in y:
		if math.isnan(x["Percent"]):
			x["Percent"] = 0
		temp.append(x)
	return temp

@app.route('/')
@login_required
def index():
	return render_template('index.html')

@app.route("/histplot")
@login_required
def histplot():
	spendData = Hist.query.filter_by(Type = 'Spend').all()
	spend2015 = 0
	spend2016 = 0
	spend2017 = 0
	for i in range(len(spendData)):
		spend2015 = spend2015 + spendData[i].Y2015
		spend2016 = spend2016 + spendData[i].Y2016
		spend2017 = spend2017 + spendData[i].Y2017
	spendData = [{"Year": 2015, "spend" : spend2015}, {"Year": 2016, "spend" : spend2016}, {"Year": 2017, "spend" : spend2017}]
	return jsonify(spendData)

@app.route("/bookingplot")
@login_required
def bookingplot():
	bookData = Hist.query.filter_by(Type = 'Booking').all()
	bookData = [{"Year": 2015, "booking" : bookData[0].Y2015}, {"Year": 2016, "booking" : bookData[0].Y2016}, {"Year": 2017, "booking" : bookData[0].Y2017}]
	return jsonify(bookData)

@app.route('/hist', methods = ['GET', 'POST'])
@login_required
def hist():
	histData_spend = Hist.query.filter_by(Type = 'Spend').all()
	histData_booking = Hist.query.filter_by(Type = 'Booking').all()
	histData = [histData_spend, histData_booking[1:]]
	#histData = [histData_spend, histData_booking]
        #print len(histData_spend)
        #print len(histData_booking)
	#pdb.set_trace()
	return render_template('histperform.html', histData = histData)

#This part stores user input data and result in session storage on
#click of run scenario button
@app.route('/storeformdata', methods = ['GET','POST'])
@login_required
def storeformdata():
	#pdb.set_trace()
	data = request.get_json()
	session['formdata'] = data
	formdata = session['formdata']
	#pdb.set_trace()
	user_input = {}
	for i in range(len(formdata)):
		user_input[formdata[i]['name']] = int(formdata[i]['value'])*0.01
	user_input['base_year'] = 2016
	mapping = {'Email': 'Email', 'Display':'Digital', 'DM':'DM', 'Ext__Email':'Ext. Email', 'Magazine':'MAGAZINE',
				'Print':'Print', 'OOH':'OOH', 'PR':'PR', 'Radio':'RADIO', 'Paid_Search':'Paid Search', 'TRADE_COOP':'TRADE.COOP',
				'TRADE_DMA_OTHER':'TRADE.DMA_OTHER', 'TV':'TV', 'base_year':'base_year'}
	inputdict = {}
	for k, v in user_input.iteritems():
		temp = mapping[k]
		inputdict[temp] = v
	[out, new_df, roi_df, cost_df] = get_contributions(inputdict)
	base_user_input = {'Email': 0, 'Digital': 0, 'DM': 0, 'Ext. Email': 0, 'MAGAZINE': 0,
				'Print': 0, 'OOH': 0, 'PR': 0, 'RADIO': 0, 'Paid Search': 0, 'TRADE.COOP': 0,
				'TRADE.DMA_OTHER': 0, 'TV': 0, 'base_year': 2016}
	[base_out, base_df, base_roi_df, base_cost_df] = get_contributions(base_user_input)
	#pdb.set_trace()
	session['df'] = json.loads(new_df.to_json(orient='records'))
   	session['base_df'] = json.loads(base_df.to_json(orient='records'))
   	session['roi_df'] = json.loads(roi_df.to_json(orient='records'))
   	session['base_roi_df'] = json.loads(base_roi_df.to_json(orient='records'))
   	session['cost_df'] = json.loads(cost_df.to_json(orient='records'))
   	session['base_cost_df'] = json.loads(base_cost_df.to_json(orient='records'))
	#pdb.set_trace()
	return jsonify("success")

#This part stores user input data and result in session storage on
#click of run scenario comparison button
@app.route('/storecompformdata', methods = ['GET','POST'])
@login_required
def storecompformdata():
	# pdb.set_trace()
	try:
		for i in range(3):
			res_name = "comp_scene_"+str(i+1)+"_"
			session[res_name+"new_df"] = ''
			session[res_name+"roi_df"] = ''
			session[res_name+"cost_df"] = ''
	except:
		pass
	data = request.get_json()
	session['compformdata'] = data
	formdata = session['compformdata']
	#pdb.set_trace()
	scenario_input_1 = {}
	scenario_input_2 = {}
	scenario_input_3 = {}
	for i in range(len(formdata)):
		if formdata[i]['name'][-1] == '1':
			scenario_input_1[formdata[i]['name'][:-10]] = int(formdata[i]['value'])*0.01
		elif formdata[i]['name'][-1] == '2':
			scenario_input_2[formdata[i]['name'][:-10]] = int(formdata[i]['value'])*0.01
		elif formdata[i]['name'][-1] == '3':
			scenario_input_3[formdata[i]['name'][:-10]] = int(formdata[i]['value'])*0.01
	# session["scenario_input_1"] = scenario_input_1
	# session["scenario_input_2"] = scenario_input_2
	# session["scenario_input_3"] = scenario_input_3
	comp_input_list = [scenario_input_1, scenario_input_2, scenario_input_3]
	session["comp_input_list"] = comp_input_list
	# pdb.set_trace()
	for i in range(len(comp_input_list)):
		if comp_input_list[i]:
			user_input = comp_input_list[i]
			user_input['base_year'] = 2016
			mapping = {'Email': 'Email', 'Display':'Digital', 'DM':'DM', 'ExtEmail':'Ext. Email', 'Magazine':'MAGAZINE',
						'Print':'Print', 'OOH':'OOH', 'PR':'PR', 'Radio':'RADIO', 'PaidSearch':'Paid Search', 'TRADECOOP':'TRADE.COOP',
						'TRADEDMAOTHER':'TRADE.DMA_OTHER', 'TV':'TV', 'base_year':'base_year'}
			inputdict = {}
			for k, v in user_input.iteritems():
				temp = mapping[k]
				inputdict[temp] = v
			# pdb.set_trace()
			session["scenario_input_"+str(i+1)] = inputdict
			[out, new_df, roi_df, cost_df] = get_contributions(inputdict)
			res_name = "comp_scene_"+str(i+1)+"_"
			session[res_name+"new_df"] = json.loads(new_df.to_json(orient='records'))
			session[res_name+"roi_df"] = json.loads(roi_df.to_json(orient='records'))
			session[res_name+"cost_df"] = json.loads(cost_df.to_json(orient='records'))
	#pdb.set_trace()
	base_user_input = {'Email': 0, 'Digital': 0, 'DM': 0, 'Ext. Email': 0, 'MAGAZINE': 0,
				'Print': 0, 'OOH': 0, 'PR': 0, 'RADIO': 0, 'Paid Search': 0, 'TRADE.COOP': 0,
				'TRADE.DMA_OTHER': 0, 'TV': 0, 'base_year': 2016}
	[base_out, base_df, base_roi_df, base_cost_df] = get_contributions(base_user_input)
	session['base_df'] = json.loads(base_df.to_json(orient='records'))
	session['base_roi_df'] = json.loads(base_roi_df.to_json(orient='records'))
   	session['base_cost_df'] = json.loads(base_cost_df.to_json(orient='records'))
	return jsonify("success")

@app.route('/sceneanalysis', methods = ['GET','POST'])
@login_required
def sceneanalysis():
	data = request.get_json()
	if data['callname']=="piedata":
		filtervalues = data['filtervalues']
		product = filtervalues[0]["value1"]
		channel = filtervalues[0]["value2"]
		country = filtervalues[0]["value3"]
		#pdb.set_trace()
		print(session['df'])
		new_df = pd.io.json.read_json(json.dumps(session['df']))
		print(new_df)
		[tmp ,x, y, z] = pieDatafilter(new_df,country, product, channel)
		return jsonify(x)
	elif data['callname']=="incrbarchart":
		filtervalues = data['filtervalues']
		product = filtervalues[0]["value1"]
		channel = filtervalues[0]["value2"]
		country = filtervalues[0]["value3"]
		#print new_df.loc[new_df['Product'] == 'Alaska', :].iloc[:, 0:-3].sum()#.sum()
		new_df = pd.io.json.read_json(json.dumps(session['df']))
		[tmp, x, y, z] = pieDatafilter(new_df,country, product, channel)
		y = filterNAN(y)
		return jsonify(y)
	elif data['callname']=="basepiedata":
		filtervalues = data['filtervalues']
		product = filtervalues[0]["value1"]
		channel = filtervalues[0]["value2"]
		country = filtervalues[0]["value3"]
		base_df = pd.io.json.read_json(json.dumps(session['base_df']))
		[tmp ,x, y, z] = pieDatafilter(base_df,country, product, channel)
		return jsonify(x)
	elif data['callname']=="baseincrbarchart":
		filtervalues = data['filtervalues']
		product = filtervalues[0]["value1"]
		channel = filtervalues[0]["value2"]
		country = filtervalues[0]["value3"]
		base_df = pd.io.json.read_json(json.dumps(session['base_df']))
		[tmp, x, y, z] = pieDatafilter(base_df,country, product, channel)
		y = filterNAN(y)
		return jsonify(y)
	elif data['callname']=="boxdata":
		filtervalues = data['filtervalues']
		product = filtervalues[0]["value1"]
		channel = filtervalues[0]["value2"]
		country = filtervalues[0]["value3"]
		new_df = pd.io.json.read_json(json.dumps(session['df']))
		[new_booking_count, x, y, z] = pieDatafilter(new_df, country, product, channel)
		base_df = pd.io.json.read_json(json.dumps(session['base_df']))
		[base_booking_count, x, y, z] = pieDatafilter(base_df, country, product, channel)
		# session['Base_Year_Total_Booking'] = base_booking_count
		return jsonify({'Base_Scenario_Booking_Count':base_booking_count,'New_scenario_Booking_Count':new_booking_count,'Change_in_count':(new_booking_count-base_booking_count)})
	elif data['callname'] == "roiboxdata":
		cost_df = pd.io.json.read_json(json.dumps(session['cost_df']))
		cost_df = cost_df.dropna().sum()
		base_cost_df = pd.io.json.read_json(json.dumps(session['base_cost_df']))
		base_cost_df = base_cost_df.dropna().sum()
		return jsonify(
			{'Base_Scenario_Overall_ROI': base_cost_df['Revenue']/base_cost_df['Cost'], 'New_scenario_Overall_ROI': cost_df['Revenue']/cost_df['Cost'],
			 'Change_in_percentage': (cost_df['Revenue']/cost_df['Cost'] - base_cost_df['Revenue']/base_cost_df['Cost']) / (base_cost_df['Revenue']/base_cost_df['Cost'] * 100)})

	elif data['callname'] == "baseroidata":
		base_roi_df = pd.io.json.read_json(json.dumps(session['base_roi_df']))
		base_roi_df.index = base_roi_df['index']
		base_roi_df = base_roi_df.dropna()
		roi_dict = []
		#pdb.set_trace()
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			temp['Value'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
				i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			roi_dict.append(temp)
		# print roi_dict
		return jsonify(roi_dict)
	elif data['callname'] == "groupedroibarchart":
		base_roi_df = pd.io.json.read_json(json.dumps(session['base_roi_df']))
		base_roi_df.index = base_roi_df['index']
		base_roi_df = base_roi_df.dropna()
		roi_df = pd.io.json.read_json(json.dumps(session['roi_df']))
		roi_df.index = roi_df['index']
		roi_df = roi_df.dropna()
		roi_dict = []
		#pdb.set_trace()
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			temp['New_Scenario'] = roi_df.loc[i,'ROI']
			temp['Base_Scenario'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
				i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			roi_dict.append(temp)
		# print roi_dict
		return jsonify(roi_dict)

	elif data['callname'] == "groupedbarchart":
		filtervalues = data['filtervalues']
		product = filtervalues[0]["value1"]
		channel = filtervalues[0]["value2"]
		country = filtervalues[0]["value3"]
		base_df = pd.io.json.read_json(json.dumps(session['base_df']))
		[tmp_base, x_base, y_base, z_base] = pieDatafilter(base_df,country, product, channel)
		new_df = pd.io.json.read_json(json.dumps(session['df']))
		[tmp_new, x_new, y_new, z_new] = pieDatafilter(new_df,country, product, channel)
		y_base = filterNAN(y_base)
		y_new = filterNAN(y_new)
		# pdb.set_trace()
		new = []
		for i in range(len(y_base)):
			temp = {}
			temp['Label'] = y_base[i]['Label']
			temp['New_Scenario'] = y_new[i]['Percent']
			temp['Base_Scenario'] = y_base[i]['Percent']
			new.append(temp)
		# print new
		return jsonify(new)

	elif data['callname'] == "newroidata":
		roi_df = pd.io.json.read_json(json.dumps(session['roi_df']))
		roi_df.index = roi_df['index']
		roi_df = roi_df.dropna()
		roi_dict = []
		for i in roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			temp['Value'] = roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
				i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			roi_dict.append(temp)
		return jsonify(roi_dict)

	elif data['callname'] == "groupedcomparebarchart":
		# filtervalues = data['filtervalues']
		# product = filtervalues[0]["value1"]
		# channel = filtervalues[0]["value2"]
		# country = filtervalues[0]["value3"]
		#pdb.set_trace()
		try:
			scene_1_df = pd.io.json.read_json(json.dumps(session['comp_scene_1_roi_df']))
			scene_1_df.index = scene_1_df['index']
			scene_1_df = scene_1_df.dropna()
		except:
			pass
		try:
			scene_2_df = pd.io.json.read_json(json.dumps(session['comp_scene_2_roi_df']))
			scene_2_df.index = scene_2_df['index']
			scene_2_df = scene_2_df.dropna()
		except:
			pass
		try:
			scene_3_df = pd.io.json.read_json(json.dumps(session['comp_scene_3_roi_df']))
			scene_3_df.index = scene_3_df['index']
			scene_3_df = scene_3_df.dropna()
		except:
			pass
		# pdb.set_trace()
		roi_dict = []
		try:
			for i in scene_1_df['ROI'].sort_values(ascending=False).index:
				temp = {}
				try:
					temp['New_Scenario_1'] = scene_1_df.loc[i,'ROI']
				except:
					pass
				try:
					temp['New_Scenario_2'] = scene_2_df.loc[i,'ROI']
				except:
					pass
				try:
					temp['New_Scenario_3'] = scene_3_df.loc[i,'ROI']
				except:
					pass
				if (i == "MAGAZINE"):
					i = "Magazine"
				elif(i == "RADIO"):
					i = "Radio"
				elif(i == "Digital"):
					i = "Display"
				temp['Label'] = i
				roi_dict.append(temp)
		except:
			for i in scene_2_df['ROI'].sort_values(ascending=False).index:
				temp = {}
				# temp['Label'] = i
				try:
					temp['New_Scenario_1'] = scene_1_df.loc[i,'ROI']
				except:
					pass
				try:
					temp['New_Scenario_2'] = scene_2_df.loc[i,'ROI']
				except:
					pass
				try:
					temp['New_Scenario_3'] = scene_3_df.loc[i,'ROI']
				except:
					pass
				if (i == "MAGAZINE"):
					i = "Magazine"
				elif(i == "RADIO"):
					i = "Radio"
				elif(i == "Digital"):
					i = "Display"
				temp['Label'] = i
				roi_dict.append(temp)
		session["roicompdata"] = roi_dict
		return jsonify(roi_dict)

	# elif data['callname'] == "groupedcomparebarchart":
	# 		filtervalues = data['filtervalues']
	# 	product = filtervalues[0]["value1"]
	# 	channel = filtervalues[0]["value2"]
	# 	country = filtervalues[0]["value3"]
	# 	#pdb.set_trace()
	# 	scene_1_df = pd.io.json.read_json(json.dumps(session['comp_scene_1_new_df']))
	# 	scene_2_df = pd.io.json.read_json(json.dumps(session['comp_scene_2_new_df']))
	# 	scene_3_df = pd.io.json.read_json(json.dumps(session['comp_scene_3_new_df']))
	# 	[tmp_new, x_new, y_new_1] = pieDatafilter(scene_1_df,country, product, channel)
	# 	[tmp_new, x_new, y_new_2] = pieDatafilter(scene_2_df,country, product, channel)
	# 	[tmp_new, x_new, y_new_3] = pieDatafilter(scene_3_df,country, product, channel)
	# 	y_new_1 = filterNAN(y_new_1)
	# 	y_new_2 = filterNAN(y_new_2)
	# 	y_new_3 = filterNAN(y_new_3)
	# 	new = []
	# 	for i in range(len(y_new_1)):
	# 		temp = {}
	# 		temp['Label'] = y_new_1[i]['Label']
	# 		temp['Scene_1'] = y_new_1[i]['Percent']
	# 		temp['Scene_2'] = y_new_2[i]['Percent']
	# 		temp['Scene_3'] = y_new_3[i]['Percent']
	# 		new.append(temp)
	# 	return jsonify(new)


@app.route('/comppagedata', methods = ['GET', 'POST'])
@login_required
def comppagedata():
	base_df =  pd.io.json.read_json(json.dumps(session['base_df']))
	base_cost_df = pd.io.json.read_json(json.dumps(session['base_cost_df']))
	base_cost_df = base_cost_df.dropna().sum()
	baseROI = round((base_cost_df['Revenue']/base_cost_df['Cost']),2)
	country = "All"
	product = "All"
	channel = "All"
	[new_booking_count_1, x1, y1, z1] = [0,0,0,0]
	[new_booking_count_2, x2, y2, z2] = [0,0,0,0]
	[new_booking_count_3, x3, y3, z3] = [0,0,0,0]
	scene1row = []
	scene2row = []
	scene3row = []
	newROI_1 = 0
	changeROI_1 = 0
	changeROIPercent_1 = 0
	newROI_2 = 0
	changeROI_2 = 0
	changeROIPercent_2 = 0
	newROI_3 = 0
	changeROI_3 = 0
	changeROIPercent_3 = 0
	try:
		scene_1_newdf = pd.io.json.read_json(json.dumps(session['comp_scene_1_new_df']))
		new_cost_df_1 = pd.io.json.read_json(json.dumps(session['comp_scene_1_cost_df']))
		new_cost_df_1 = new_cost_df_1.dropna().sum()
		[new_booking_count_1, x1, y1, z1] = pieDatafilter(scene_1_newdf, country, product, channel)
		z1  = simplejson.loads(simplejson.dumps(z1, ignore_nan=True))
		scene1row = z1
		newROI_1 = round((new_cost_df_1['Revenue']/new_cost_df_1['Cost']),2)
		changeROI_1 = newROI_1 - baseROI
		changeROIPercent_1 = (changeROI_1/baseROI)*100
	except:
		pass
	try:
		scene_2_newdf = pd.io.json.read_json(json.dumps(session['comp_scene_2_new_df']))
		new_cost_df_2 = pd.io.json.read_json(json.dumps(session['comp_scene_2_cost_df']))
		new_cost_df_2 = new_cost_df_2.dropna().sum()
		[new_booking_count_2, x2, y2, z2] = pieDatafilter(scene_2_newdf, country, product, channel)
		z2  = simplejson.loads(simplejson.dumps(z2, ignore_nan=True))
		scene2row = z2
		newROI_2 = round((new_cost_df_2['Revenue']/new_cost_df_2['Cost']),2)
		changeROI_2 = newROI_2 - baseROI
		changeROIPercent_2 = (changeROI_2/baseROI)*100
	except:
		pass
	try:
		scene_3_newdf = pd.io.json.read_json(json.dumps(session['comp_scene_3_new_df']))
		new_cost_df_3 = pd.io.json.read_json(json.dumps(session['comp_scene_3_cost_df']))
		new_cost_df_3 = new_cost_df_3.dropna().sum()
		[new_booking_count_3, x3, y3, z3] = pieDatafilter(scene_3_newdf, country, product, channel)
		z3  = simplejson.loads(simplejson.dumps(z3, ignore_nan=True))
		scene3row = z3
		newROI_3 = round((new_cost_df_3['Revenue']/new_cost_df_3['Cost']),2)
		changeROI_3 = newROI_3 - baseROI
		changeROIPercent_3 = (changeROI_3/baseROI)*100
	except:
		pass
	[base_booking_count, x, y, z] = pieDatafilter(base_df, country, product, channel)
	z  = simplejson.loads(simplejson.dumps(z, ignore_nan=True))
	baserow = z
	# pdb.set_trace()
	basespend = Hist.query.filter_by(Type = 'Spend').all()
	temp = {}
	for i in range(len(basespend)):
		if 	basespend[i].Category == "Display":
			temp["Digital"] = basespend[i].Y2016
		else:
			temp[basespend[i].Category] = basespend[i].Y2016
	basespend = temp
	# pdb.set_trace()
	sumspend = 0
	for k,v in basespend.iteritems():
			sumspend = sumspend + v
	# pdb.set_trace()
	# sumspend = 0
	# for i in range(len(basespend)):
	# 	sumspend = sumspend + basespend[i].Y2016
	# pdb.set_trace()
	base_spend = sumspend
	newscenespend = []
	# pdb.set_trace()
	# comp_input_list = session['comp_input_list']
	for i in range(len(session['comp_input_list'])):
		# pdb.set_trace()
		if session['comp_input_list'][i]:
			# pdb.set_trace()
			temp1 = session["scenario_input_"+str(i+1)]
			tempsum = 0
			for k,v in basespend.iteritems():
                                if k == 'OOH':
                                    continue
				tempsum = tempsum + (v + v * temp1[k])
				# pdb.set_trace()
			newscenespend.append(tempsum)
		else:
			newscenespend.append(0)
	# pdb.set_trace()
	# base_booking = basebooking[0].Y2016
	base_booking = base_booking_count
	new_scene_1_spend = newscenespend[0]
	new_scene_1_booking = new_booking_count_1
	new_scene_2_spend = newscenespend[1]
	new_scene_2_booking = new_booking_count_2
	new_scene_3_spend = newscenespend[2]
	new_scene_3_booking = new_booking_count_3
	compboxesdata = {"BaseSpend":base_spend,"BaseBookings":base_booking,"NewScene1Spend":new_scene_1_spend,
				"NewScene2Spend":new_scene_2_spend, "NewScene3Spend":new_scene_3_spend, "NewScene1Bookings":new_scene_1_booking,
				"NewScene2Bookings":new_scene_2_booking,"NewScene3Bookings":new_scene_3_booking,"Change1Spend":(new_scene_1_spend-base_spend),
				"Change2Spend":(new_scene_2_spend-base_spend),"Change3Spend":(new_scene_3_spend-base_spend),"Change1Bookings":(new_scene_1_booking-base_booking),
				"Change2Bookings":(new_scene_2_booking-base_booking),"Change3Bookings":(new_scene_3_booking-base_booking),
				"baseROI":baseROI, "newROI_1":newROI_1, "changeROI_1":changeROI_1, "changeROIPercent_1":changeROIPercent_1,
				"newROI_2":newROI_2, "changeROI_2":changeROI_2, "changeROIPercent_2":changeROIPercent_2,
				"newROI_3":newROI_3, "changeROI_3":changeROI_3, "changeROIPercent_3":changeROIPercent_3}
	# scene1row = z1
	# scene2row = z2
	# scene3row = z3
	comptabledata = {"Base_Scenario":baserow, "Scenario_1":scene1row,"Scenario_2":scene2row,"Scenario_3":scene3row}
	roi = session["roicompdata"]
	# pdb.set_trace()
	final_tdata = {}
	for k,v in comptabledata.iteritems():
		bs = comptabledata[k]
		temp = []
		indices = []
		for i in roi:
			for j in bs:
				if j["Label"] == i["Label"]:
					temp.append(j)
					indices.append(bs.index(j))
		for i in range(len(bs)):
			if i not in indices:
				temp.append(bs[i])
		final_tdata[k] = temp

	comptabledata = final_tdata
	#print comptabledata
	# pdb.set_trace()
	return jsonify({"bdata":compboxesdata,"tdata":comptabledata})

@app.route('/scene', methods = ['GET', 'POST'])
@login_required
def scene():
	return render_template('scenarioanalysis.html')

@app.route('/detailedanalysis', methods = ['GET', 'POST'])
@login_required
def detailedanalysis():
	data = request.get_json()
	# pdb.set_trace()
	whichScenario = int(data["scenarioNumber"][-1])
	filtervalues = data['filtervalues']
	product = filtervalues[0]["value1"]
	channel = filtervalues[0]["value2"]
	country = filtervalues[0]["value3"]
	if whichScenario == 1:
		#retrive Calulated data
		scenarioInput = session["scenario_input_"+str(whichScenario)]
		new_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_new_df']))
		base_df = pd.io.json.read_json(json.dumps(session["base_df"]))
		new_cost_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_cost_df']))
		base_cost_df = pd.io.json.read_json(json.dumps(session['base_cost_df']))

		#get these data from filtervalues from request
		# country = "All"
		# product = "All"
		# channel = "All"

		#Contribution Tab
		#Contribution Tab Box Data
		[baseBookings, basePieData, baseIncrBookingsPercent, baseIncrBookings] = pieDatafilter(base_df, country, product, channel)
		[newBookings, newPieData, newIncrBookingsPercent, newIncrBookings] = pieDatafilter(new_df, country, product, channel)

		baseIncrBookings = simplejson.loads(simplejson.dumps(baseIncrBookings, ignore_nan=True))
		# baseIncrBookings = filterNAN(baseIncrBookings)
		newIncrBookings = simplejson.loads(simplejson.dumps(newIncrBookings, ignore_nan=True))
		# newIncrBookings = filterNAN(newIncrBookings)

		baseIncrBookingsPercent = simplejson.loads(simplejson.dumps(baseIncrBookingsPercent, ignore_nan=True))
		# baseIncrBookingsPercent = filterNAN(baseIncrBookingsPercent)
		newIncrBookingsPercent = simplejson.loads(simplejson.dumps(newIncrBookingsPercent, ignore_nan=True))
		# newIncrBookingsPercent = filterNAN(newIncrBookingsPercent)

		new = []
		for i in range(len(baseIncrBookingsPercent)):
			temp = {}
			temp['Label'] = baseIncrBookingsPercent[i]['Label']
			temp['New_Scenario_'+str(whichScenario)] = newIncrBookingsPercent[i]['Percent']
			temp['Base_Scenario'] = baseIncrBookingsPercent[i]['Percent']
			new.append(temp)

		changeInBooings = newBookings - baseBookings
		changeInBooingsPercent = (changeInBooings/baseBookings) * 100
		contributionTabBoxData = {"newBookings":newBookings, "baseBookings":baseBookings,"changeInBooings":changeInBooings, "changeInBooingsPercent":changeInBooingsPercent}
		#Contribution tab Charts Data
		basePieChart = basePieData
		newPieChart = newPieData
		groupedContributionChart = new
		contributionTabChartData = {"basePieChart":basePieChart, "newPieChart":newPieChart, "groupedContributionChart":groupedContributionChart}
		#complete contribution tab data
		contributionTabData = {"contributionTabChartData":contributionTabChartData, "contributionTabBoxData":contributionTabBoxData}

		#roi tab Box data
		base_cost_df = base_cost_df.dropna().sum()
		new_cost_df = new_cost_df.dropna().sum()
		baseROI = round((base_cost_df['Revenue']/base_cost_df['Cost']),2)
		newROI = round((new_cost_df['Revenue']/new_cost_df['Cost']),2)
		changeROI = newROI - baseROI
		changeROIPercent = (changeROI/baseROI)*100
		roiTabBoxData = {"baseROI":baseROI,"newROI":newROI,"changeROI":changeROI,"changeROIPercent":changeROIPercent}

		#roi tab chart data
		new_roi_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_roi_df']))
		new_roi_df.index = new_roi_df['index']
		new_roi_df = new_roi_df.dropna()

		base_roi_df = pd.io.json.read_json(json.dumps(session['base_roi_df']))
		base_roi_df.index = base_roi_df['index']
		base_roi_df = base_roi_df.dropna()

		new_roi_dict = []
		for i in new_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['Value'] = new_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
				i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			new_roi_dict.append(temp)

		base_roi_dict = []
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['Value'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			base_roi_dict.append(temp)
		grouped_roi_dict = []
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['New_Scenario_'+str(whichScenario)] = new_roi_df.loc[i,'ROI']
			temp['Base_Scenario'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			grouped_roi_dict.append(temp)

		roiTabChartData = {"new_roi_dict":new_roi_dict,"base_roi_dict":base_roi_dict, "grouped_roi_dict":grouped_roi_dict}
		roiTabData = {"roiTabChartData":roiTabChartData,"roiTabBoxData":roiTabBoxData}
		return jsonify({"roiTabData":roiTabData, "contributionTabData":contributionTabData})
	elif whichScenario == 2:
		scenarioInput = session["scenario_input_"+str(whichScenario)]
		new_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_new_df']))
		base_df = pd.io.json.read_json(json.dumps(session["base_df"]))
		new_cost_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_cost_df']))
		base_cost_df = pd.io.json.read_json(json.dumps(session['base_cost_df']))

		#get these data from filtervalues from request
		# country = "All"
		# product = "All"
		# channel = "All"

		#Contribution Tab
		#Contribution Tab Box Data
		[baseBookings, basePieData, baseIncrBookingsPercent, baseIncrBookings] = pieDatafilter(base_df, country, product, channel)
		[newBookings, newPieData, newIncrBookingsPercent, newIncrBookings] = pieDatafilter(new_df, country, product, channel)

		baseIncrBookings = simplejson.loads(simplejson.dumps(baseIncrBookings, ignore_nan=True))
		# baseIncrBookings = filterNAN(baseIncrBookings)
		newIncrBookings = simplejson.loads(simplejson.dumps(newIncrBookings, ignore_nan=True))
		# newIncrBookings = filterNAN(newIncrBookings)

		baseIncrBookingsPercent = simplejson.loads(simplejson.dumps(baseIncrBookingsPercent, ignore_nan=True))
		# baseIncrBookingsPercent = filterNAN(baseIncrBookingsPercent)
		newIncrBookingsPercent = simplejson.loads(simplejson.dumps(newIncrBookingsPercent, ignore_nan=True))
		# newIncrBookingsPercent = filterNAN(newIncrBookingsPercent)

		new = []
		for i in range(len(baseIncrBookingsPercent)):
			temp = {}
			temp['Label'] = baseIncrBookingsPercent[i]['Label']
			temp['Base_Scenario'] = baseIncrBookingsPercent[i]['Percent']
			temp['New_Scenario_'+str(whichScenario)] = newIncrBookingsPercent[i]['Percent']
			new.append(temp)

		changeInBooings = newBookings - baseBookings
		changeInBooingsPercent = (changeInBooings/baseBookings) * 100
		contributionTabBoxData = {"newBookings":newBookings, "baseBookings":baseBookings,"changeInBooings":changeInBooings, "changeInBooingsPercent":changeInBooingsPercent}
		#Contribution tab Charts Data
		basePieChart = basePieData
		newPieChart = newPieData
		groupedContributionChart = new
		contributionTabChartData = {"basePieChart":basePieChart, "newPieChart":newPieChart, "groupedContributionChart":groupedContributionChart}
		#complete contribution tab data
		contributionTabData = {"contributionTabChartData":contributionTabChartData, "contributionTabBoxData":contributionTabBoxData}

		#roi tab Box data
		base_cost_df = base_cost_df.dropna().sum()
		new_cost_df = new_cost_df.dropna().sum()
		baseROI = round((base_cost_df['Revenue']/base_cost_df['Cost']),2)
		newROI = round((new_cost_df['Revenue']/new_cost_df['Cost']),2)
		changeROI = newROI - baseROI
		changeROIPercent = (changeROI/baseROI)*100
		roiTabBoxData = {"baseROI":baseROI,"newROI":newROI,"changeROI":changeROI,"changeROIPercent":changeROIPercent}

		#roi tab chart data
		new_roi_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_roi_df']))
		new_roi_df.index = new_roi_df['index']
		new_roi_df = new_roi_df.dropna()

		base_roi_df = pd.io.json.read_json(json.dumps(session['base_roi_df']))
		base_roi_df.index = base_roi_df['index']
		base_roi_df = base_roi_df.dropna()

		new_roi_dict = []
		for i in new_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['Value'] = new_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			new_roi_dict.append(temp)

		base_roi_dict = []
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['Value'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			base_roi_dict.append(temp)

		grouped_roi_dict = []
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['New_Scenario_'+str(whichScenario)] = new_roi_df.loc[i,'ROI']
			temp['Base_Scenario'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			grouped_roi_dict.append(temp)

		roiTabChartData = {"new_roi_dict":new_roi_dict,"base_roi_dict":base_roi_dict, "grouped_roi_dict":grouped_roi_dict}
		roiTabData = {"roiTabChartData":roiTabChartData,"roiTabBoxData":roiTabBoxData}
		return jsonify({"roiTabData":roiTabData, "contributionTabData":contributionTabData})
	elif whichScenario == 3:
		scenarioInput = session["scenario_input_"+str(whichScenario)]
		new_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_new_df']))
		base_df = pd.io.json.read_json(json.dumps(session["base_df"]))
		new_cost_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_cost_df']))
		base_cost_df = pd.io.json.read_json(json.dumps(session['base_cost_df']))

		#get these data from filtervalues from request
		# country = "All"
		# product = "All"
		# channel = "All"

		#Contribution Tab
		#Contribution Tab Box Data
		[baseBookings, basePieData, baseIncrBookingsPercent, baseIncrBookings] = pieDatafilter(base_df, country, product, channel)
		[newBookings, newPieData, newIncrBookingsPercent, newIncrBookings] = pieDatafilter(new_df, country, product, channel)

		baseIncrBookings = simplejson.loads(simplejson.dumps(baseIncrBookings, ignore_nan=True))
		# baseIncrBookings = filterNAN(baseIncrBookings)
		newIncrBookings = simplejson.loads(simplejson.dumps(newIncrBookings, ignore_nan=True))
		# newIncrBookings = filterNAN(newIncrBookings)

		baseIncrBookingsPercent = simplejson.loads(simplejson.dumps(baseIncrBookingsPercent, ignore_nan=True))
		# baseIncrBookingsPercent = filterNAN(baseIncrBookingsPercent)
		newIncrBookingsPercent = simplejson.loads(simplejson.dumps(newIncrBookingsPercent, ignore_nan=True))
		# newIncrBookingsPercent = filterNAN(newIncrBookingsPercent)

		new = []
		for i in range(len(baseIncrBookingsPercent)):
			temp = {}
			temp['Label'] = baseIncrBookingsPercent[i]['Label']
			temp['New_Scenario_'+str(whichScenario)] = newIncrBookingsPercent[i]['Percent']
			temp['Base_Scenario'] = baseIncrBookingsPercent[i]['Percent']
			new.append(temp)

		changeInBooings = newBookings - baseBookings
		changeInBooingsPercent = (changeInBooings/baseBookings) * 100
		contributionTabBoxData = {"newBookings":newBookings, "baseBookings":baseBookings,"changeInBooings":changeInBooings, "changeInBooingsPercent":changeInBooingsPercent}
		#Contribution tab Charts Data
		basePieChart = basePieData
		newPieChart = newPieData
		groupedContributionChart = new
		contributionTabChartData = {"basePieChart":basePieChart, "newPieChart":newPieChart, "groupedContributionChart":groupedContributionChart}
		#complete contribution tab data
		contributionTabData = {"contributionTabChartData":contributionTabChartData, "contributionTabBoxData":contributionTabBoxData}

		#roi tab Box data
		base_cost_df = base_cost_df.dropna().sum()
		new_cost_df = new_cost_df.dropna().sum()
		baseROI = round((base_cost_df['Revenue']/base_cost_df['Cost']),2)
		newROI = round((new_cost_df['Revenue']/new_cost_df['Cost']),2)
		changeROI = newROI - baseROI
		changeROIPercent = (changeROI/baseROI)*100
		roiTabBoxData = {"baseROI":baseROI,"newROI":newROI,"changeROI":changeROI,"changeROIPercent":changeROIPercent}

		#roi tab chart data
		new_roi_df = pd.io.json.read_json(json.dumps(session['comp_scene_'+str(whichScenario)+'_roi_df']))
		new_roi_df.index = new_roi_df['index']
		new_roi_df = new_roi_df.dropna()

		base_roi_df = pd.io.json.read_json(json.dumps(session['base_roi_df']))
		base_roi_df.index = base_roi_df['index']
		base_roi_df = base_roi_df.dropna()

		new_roi_dict = []
		for i in new_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['Value'] = new_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			new_roi_dict.append(temp)

		base_roi_dict = []
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['Value'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
					i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			base_roi_dict.append(temp)

		grouped_roi_dict = []
		for i in base_roi_df['ROI'].sort_values(ascending=False).index:
			temp = {}
			# temp['Label'] = i
			temp['New_Scenario_'+str(whichScenario)] = new_roi_df.loc[i,'ROI']
			temp['Base_Scenario'] = base_roi_df.loc[i,'ROI']
			if (i == "MAGAZINE"):
				i = "Magazine"
			elif(i == "RADIO"):
				i = "Radio"
			elif(i == "Digital"):
				i = "Display"
			temp['Label'] = i
			grouped_roi_dict.append(temp)

		roiTabChartData = {"new_roi_dict":new_roi_dict,"base_roi_dict":base_roi_dict, "grouped_roi_dict":grouped_roi_dict}
		roiTabData = {"roiTabChartData":roiTabChartData,"roiTabBoxData":roiTabBoxData}
		return jsonify({"roiTabData":roiTabData, "contributionTabData":contributionTabData})

@app.route('/compare', methods = ['GET', 'POST'])
@login_required
def compare():
	return render_template('scenariocomp.html')

# @app.route('/modalresult', methods = ['GET', 'POST'])
# @login_required
# def modalresult():
# 	return render_template('modalresult.html')

'''@app.route('/register' , methods=['GET','POST'])
@login_required
def register():
	if request.method == 'GET':
		return render_template('register.html')

	user = User(request.form['username'] , request.form['password'], request.form['radio'])
	db.session.add(user)
	db.session.commit()
	flash('User successfully registered')
	return redirect(url_for('login'))

@app.route('/login',methods=['GET','POST'])
def login():
	error = None
	if request.method == 'GET':
		return render_template('login.html', error=error)
	username = request.form['username']
	password = request.form['password']
	remember_me = False
	if 'remember_me' in request.form:
		remember_me = True
	registered_user = User.query.filter_by(username=username).first()
	if registered_user is None:
		error = 'Invalid Username.'
		flash('Username is invalid' , 'error')
		return render_template('login.html', error=error)

	if not registered_user.check_password(password):
		error = 'Password is invalid.'
		flash('Password is invalid','error')
		return render_template('login.html', error=error)

	login_user(registered_user, remember = remember_me)
	flash('Logged in successfully')
	return redirect(request.args.get('next') or url_for('index'))'''

@app.route('/optimize', methods = ['GET', 'POST'])
@login_required
def optimize():

   return render_template('optimizeranalysis.html')


@app.route('/storeformdata_optimal', methods = ['GET','POST'])
@login_required
def storeformdata_optimal():
	#pdb.set_trace()
	data = request.get_json()
	print data
	global optimal_Data_spend,optimal_out, optimal_new_df, optimal_roi_df, optimal_cost_df,optimal_base_out, optimal_base_df, optimal_base_roi_df, optimal_base_cost_df
	optimal_Data_spend = optimData.query.filter_by(Total_Spend=data).all()
	user_input = {'Email':optimal_Data_spend[0].Email, 'Digital':optimal_Data_spend[0].Digital,'DM':optimal_Data_spend[0].DM, 'Ext. Email':optimal_Data_spend[0].Ext_Email, 'MAGAZINE':optimal_Data_spend[0].MAGAZINE,
    'Print':optimal_Data_spend[0].Print, 'OOH':optimal_Data_spend[0].OOH, 'PR':optimal_Data_spend[0].PR, 'RADIO':optimal_Data_spend[0].RADIO, 'Paid Search':optimal_Data_spend[0].Paid_Search, 'TRADE.COOP':optimal_Data_spend[0].TRADE_COOP,
    'TRADE.DMA_OTHER':optimal_Data_spend[0].TRADE_DM, 'TV':optimal_Data_spend[0].TV, 'base_year':optimal_Data_spend[0].base_year}
	[optimal_out, optimal_new_df, optimal_roi_df, optimal_cost_df] = get_contributions(user_input)
	[out, new_df, roi_df, cost_df] = [optimal_out, optimal_new_df, optimal_roi_df, optimal_cost_df]
	base_user_input = {'Email': 0, 'Digital': 0, 'DM': 0, 'Ext. Email': 0, 'MAGAZINE': 0,
				'Print': 0, 'OOH': 0, 'PR': 0, 'RADIO': 0, 'Paid Search': 0, 'TRADE.COOP': 0,
				'TRADE.DMA_OTHER': 0, 'TV': 0, 'base_year': 2016}
	[optimal_base_out, optimal_base_df, optimal_base_roi_df, optimal_base_cost_df] = get_contributions(base_user_input)
	[base_out, base_df, base_roi_df, base_cost_df] = [optimal_base_out, optimal_base_df, optimal_base_roi_df, optimal_base_cost_df]
	#session['new_df'] = json.loads(new_df.to_json(orient='records'))
   	#session['base_df'] = json.loads(base_df.to_json(orient='records'))
   	#session['base_roi_df'] = json.loads(base_roi_df.to_json(orient='records'))
   	#session['base_cost_df'] = json.loads(base_cost_df.to_json(orient='records'))

	country = "All"
	product = "All"
	channel = "All"
	[baseBookings, basePieData, baseIncrBookingsPercent, baseIncrBookings] = pieDatafilter(base_df, country, product, channel)
	[newBookings, newPieData, newIncrBookingsPercent, newIncrBookings] = pieDatafilter(new_df, country, product, channel)
	baseIncrBookings = simplejson.loads(simplejson.dumps(baseIncrBookings, ignore_nan=True))
	newIncrBookings = simplejson.loads(simplejson.dumps(newIncrBookings, ignore_nan=True))
	baseIncrBookingsPercent = simplejson.loads(simplejson.dumps(baseIncrBookingsPercent, ignore_nan=True))
	newIncrBookingsPercent = simplejson.loads(simplejson.dumps(newIncrBookingsPercent, ignore_nan=True))
	new = []
	for i in range(len(baseIncrBookingsPercent)):
		temp = {}
		temp['Label'] = baseIncrBookingsPercent[i]['Label']
		temp['Optimized_Scenario'] = newIncrBookingsPercent[i]['Percent']
		temp['Base_Scenario'] = baseIncrBookingsPercent[i]['Percent']
		new.append(temp)
	basePieChart = basePieData
	newPieChart = newPieData
	groupedContributionChart = new
	contributionTabChartData = {"basePieChart":basePieChart, "newPieChart":newPieChart, "groupedContributionChart":groupedContributionChart}
	changeInBooings = newBookings - baseBookings
	changeInBooingsPercent = (changeInBooings/baseBookings) * 100
	contributionTabBoxData = {"optimnewBookings":newBookings, "optimbaseBookings":baseBookings,"optimchangeInBooings":changeInBooings, "optimchangeInBooingsPercent":changeInBooingsPercent}
	contributionTabData = {"contributionTabBoxData":contributionTabBoxData, "contributionTabChartData":contributionTabChartData}
	base_cost_df = base_cost_df.dropna().sum()
	new_cost_df = cost_df.dropna().sum()
	baseROI = round((base_cost_df['Revenue']/base_cost_df['Cost']),2)
	newROI = round((new_cost_df['Revenue']/new_cost_df['Cost']),2)
	changeROI = newROI - baseROI
	changeROIPercent = (changeROI/baseROI)*100
	roiTabBoxData = {"optimbaseROI":baseROI,"optimnewROI":newROI,"optimchangeROI":changeROI,"optimchangeROIPercent":changeROIPercent}
	print(base_roi_df)
	roi_df = roi_df.dropna()
	base_roi_df = base_roi_df.dropna()
	new_roi_dict = []
	base_roi_dict = []
	grouped_roi_dict = []
	for i in base_roi_df['ROI'].sort_values(ascending=False).index:
		temp = {}
		temp['Optimized_Scenario'] = roi_df.loc[i,'ROI']
		temp['Base_Scenario'] = base_roi_df.loc[i,'ROI']
		temp['Label'] = i
		grouped_roi_dict.append(temp)
	roiTabChartData = {"groupedContributionChart":grouped_roi_dict}
	roiTabData = {"roiTabChartData":roiTabChartData,"roiTabBoxData":roiTabBoxData}
	base_spend = base_cost_df['Cost']
	new_spend = new_cost_df['Cost']
	changeSpend = new_spend - base_spend
	changeSpendPercent = (changeSpend/base_spend)*100
	spendTabBoxData = {"optimmarketbaseSpend":base_spend,"optimmarketnewSpend":new_spend,"optimmarketchangeSpend":changeSpend,"optimmarketchangeSpendPercent":changeSpendPercent}
	#pdb.set_trace()
   #pdb.set_trace()
	Tab_Data={"roiTabData":roiTabData, "contributionTabData":contributionTabData,"spendTabData":spendTabBoxData}
	Email = new_df["Email"].dropna().sum()
	Digital = new_df["Digital"].dropna().sum()
	DM = new_df["DM"].dropna().sum()
	Ext_Email = new_df["Ext. Email"].dropna().sum()
	MAGAZINE = new_df["MAGAZINE"].dropna().sum()
	Print = new_df["Print"].dropna().sum()
	OOH = new_df["OOH"].dropna().sum()
	PR = new_df["PR"].dropna().sum()
	RADIO = new_df["RADIO"].dropna().sum()
	Paid_Search = new_df["Paid Search"].dropna().sum()
	TRADE_COOP = new_df["TRADE.COOP"].dropna().sum()
	TRADE_DM = new_df["TRADE.DMA_OTHER"].dropna().sum()
	TV = new_df["TV"].dropna().sum()
	optimdata = {'Email':Email, 'Display':Digital,'DM':DM, 'Ext. Email':Ext_Email, 'Magazine':MAGAZINE,
     'Print':Print, 'OOH':OOH, 'PR':PR, 'Radio':RADIO, 'Paid Search':Paid_Search, 'TRADE.COOP':TRADE_COOP,
     'TRADE.DMA_OTHER':TRADE_DM, 'TV':TV}
	# All_data ={"TabData":Tab_Data}
	# print All_data
	optimdata = {'Email':optimal_Data_spend[0].Email*100, 'Display':optimal_Data_spend[0].Digital*100,'DM':optimal_Data_spend[0].DM*100, 'Ext. Email':optimal_Data_spend[0].Ext_Email*100, 'Magazine':optimal_Data_spend[0].MAGAZINE*100,
    'Print':optimal_Data_spend[0].Print*100,'PR':optimal_Data_spend[0].PR*100, 'Radio':optimal_Data_spend[0].RADIO*100, 'Paid Search':optimal_Data_spend[0].Paid_Search*100, 'TRADE.COOP':optimal_Data_spend[0].TRADE_COOP*100,
    'TRADE.DMA_OTHER':optimal_Data_spend[0].TRADE_DM*100, 'TV':optimal_Data_spend[0].TV*100}
	return jsonify({"TabData":Tab_Data,"optimdata":optimdata} )



@app.route('/optimaldatafunc_2', methods = ['GET','POST'])
@login_required
def storeformdata_optml_2():
	#pdb.set_trace()
	data = request.get_json()
	print data
	user_input = {'Email':optimal_Data_spend[0].Email, 'Digital':optimal_Data_spend[0].Digital,'DM':optimal_Data_spend[0].DM, 'Ext. Email':optimal_Data_spend[0].Ext_Email, 'MAGAZINE':optimal_Data_spend[0].MAGAZINE,
     'Print':optimal_Data_spend[0].Print, 'OOH':optimal_Data_spend[0].OOH, 'PR':optimal_Data_spend[0].PR, 'RADIO':optimal_Data_spend[0].RADIO, 'Paid Search':optimal_Data_spend[0].Paid_Search, 'TRADE.COOP':optimal_Data_spend[0].TRADE_COOP,
     'TRADE.DMA_OTHER':optimal_Data_spend[0].TRADE_DM, 'TV':optimal_Data_spend[0].TV, 'base_year':optimal_Data_spend[0].base_year}
	[out, new_df, roi_df, cost_df] = [optimal_out, optimal_new_df, optimal_roi_df, optimal_cost_df]
	base_user_input = {'Email': 0, 'Digital': 0, 'DM': 0, 'Ext. Email': 0, 'MAGAZINE': 0,
				'Print': 0, 'OOH': 0, 'PR': 0, 'RADIO': 0, 'Paid Search': 0, 'TRADE.COOP': 0,
				'TRADE.DMA_OTHER': 0, 'TV': 0, 'base_year': 2016}
	[base_out, base_df, base_roi_df, base_cost_df] = [optimal_base_out, optimal_base_df, optimal_base_roi_df, optimal_base_cost_df]
	#new_df = pd.io.json.read_json(json.dumps(session["new_df"]))
   	#base_df = pd.io.json.read_json(json.dumps(session["base_df"]))
   	#base_roi_df = pd.io.json.read_json(json.dumps(session["base_roi_df"]))
   	#base_cost_df = pd.io.json.read_json(json.dumps(session["base_cost_df"]))
	country = data["value3"]
	product = data["value1"]
	channel = data["value2"]
	[baseBookings, basePieData, baseIncrBookingsPercent, baseIncrBookings] = pieDatafilter(base_df, country, product, channel)
	[newBookings, newPieData, newIncrBookingsPercent, newIncrBookings] = pieDatafilter(new_df, country, product, channel)
	baseIncrBookings = simplejson.loads(simplejson.dumps(baseIncrBookings, ignore_nan=True))
	newIncrBookings = simplejson.loads(simplejson.dumps(newIncrBookings, ignore_nan=True))
	baseIncrBookingsPercent = simplejson.loads(simplejson.dumps(baseIncrBookingsPercent, ignore_nan=True))
	newIncrBookingsPercent = simplejson.loads(simplejson.dumps(newIncrBookingsPercent, ignore_nan=True))
	new = []
	for i in range(len(baseIncrBookingsPercent)):
		temp = {}
		temp['Label'] = baseIncrBookingsPercent[i]['Label']
		temp['Optimized_Scenario'] = newIncrBookingsPercent[i]['Percent']
		temp['Base_Scenario'] = baseIncrBookingsPercent[i]['Percent']
		new.append(temp)
	basePieChart = basePieData
	newPieChart = newPieData
	groupedContributionChart = new
	contributionTabChartData = {"basePieChart":basePieChart, "newPieChart":newPieChart, "groupedContributionChart":groupedContributionChart}
	changeInBooings = newBookings - baseBookings
	changeInBooingsPercent = (changeInBooings/baseBookings) * 100
	contributionTabBoxData = {"optimnewBookings":newBookings, "optimbaseBookings":baseBookings,"optimchangeInBooings":changeInBooings, "optimchangeInBooingsPercent":changeInBooingsPercent}
	contributionTabData = {"contributionTabBoxData":contributionTabBoxData, "contributionTabChartData":contributionTabChartData}
	base_cost_df = base_cost_df.dropna().sum()
	new_cost_df = cost_df.dropna().sum()
	baseROI = round((base_cost_df['Revenue']/base_cost_df['Cost']),2)
	newROI = round((new_cost_df['Revenue']/new_cost_df['Cost']),2)
	changeROI = newROI - baseROI
	changeROIPercent = (changeROI/baseROI)*100
	roiTabBoxData = {"optimbaseROI":baseROI,"optimnewROI":newROI,"optimchangeROI":changeROI,"optimchangeROIPercent":changeROIPercent}
	base_spend = base_cost_df['Cost']
	new_spend = new_cost_df['Cost']
	changeSpend = new_spend - base_spend
	changeSpendPercent = (changeSpend/base_spend)*100
	spendTabBoxData = {"optimmarketbaseSpend":base_spend,"optimmarketnewSpend":new_spend,"optimmarketchangeSpend":changeSpend,"optimmarketchangeSpendPercent":changeSpendPercent}
	#pdb.set_trace()
   #pdb.set_trace()
	Tab_Data={"roiTabData":roiTabBoxData, "contributionTabData":contributionTabData,"spendTabData":spendTabBoxData}
	print type(out)
	print type(new_df)
	print type(roi_df)
	print type(cost_df)
	return jsonify({"TabData":Tab_Data} )


'''@app.route('/logout')
def logout():
	session.clear()
	logout_user()
	return redirect(url_for('index'))

@login_manager.user_loader
def load_user(id):
	return User.query.get(int(id))

@app.before_request
def before_request():
	g.user = current_user'''

#NEW CODE

@app.route('/manageusers')
@login_required
def manageusers():
	return render_template('manageusers.html')


@app.route('/manageusershtml', methods=['POST'])
#@login_required
def manageusershtml():
    AllUsers = Users.query.filter(Users.UserType != "GoogleInternal").all()
    #print(AllUsers)
    user_schema = UsersSchema(many=True)
    output = user_schema.dump(AllUsers).data
    #print(user_schema.dump(AllUsers))
    return jsonify({'results' : output})

@app.route('/deleteusers', methods=['POST'])
#@login_required
def deleteusers():
    itemId = request.form['id']
    #print(itemId)
    Users.query.filter(Users.Id == itemId).delete()
    db.session.commit()

    return "Successfully Deleted"

@app.route('/updateexpirydate', methods=['POST'])
#@login_required
def updateexpirydate():
    itemId = request.form['id']
    NewDate = request.form['ExpiryDate']
    year = int(NewDate.split("-")[0])
    month = int(NewDate.split("-")[1])
    date = int(NewDate.split("-")[2])
    Newexpirydate = datetime.date(year,month,date)

    UpUser = Users.query.filter(Users.Id == itemId).first()
    UpUser.ExpiryDate = Newexpirydate
    db.session.commit()

    return "Successfully Updated"

@app.route('/register')
@login_required
def register():
	return render_template('register.html')


@app.route('/registerform' , methods=['POST'])
#@login_required
def registerform():
    username = request.form['username']
    password = request.form['password']
    usertype = request.form['usertype']
    expirydate = request.form['expirydateip']

    if not expirydate:
        expirydate = None
    else:
        year = int(expirydate.split("-")[0])
        month = int(expirydate.split("-")[1])
        date = int(expirydate.split("-")[2])
        expirydate = datetime.date(year,month,date)

    ExistingUserNames = Users.query.filter_by(UserName=username).first()

    if ExistingUserNames:
        return "Username already taken,danger"
    else:
        userobj = Users(username,usertype,password,expirydate,username,None)
        db.session.add(userobj)
        db.session.commit()
        return "User added Successfully,success"

@app.route('/oauth2callback')
@googlelogin.oauth2callback
def loginGoogle(token, userinfo, **params):
    useremail = userinfo['email']
    a,userdomain = useremail.split("@")
    print(userinfo)
    if userdomain.lower() == "tigeranalytics.com":

        user = Users.query.filter_by(UserName=userinfo['email']).first()

        if not user:
            user = Users(userinfo['email'],"GoogleInternal",userinfo['name'],None,userinfo['name'],userinfo['picture'])

        db.session.add(user)
        db.session.commit()
        login_user(user)
        return redirect("")

    else:
        logout_user()
        session.clear()
        return redirect("")


@app.route('/login',methods=['GET','POST'])
def login():
    error = None
    if request.method == 'GET':
        return render_template('login.html', error=error)
    username = request.form['username']
    password = request.form['password']
    remember_me = False
    if 'remember_me' in request.form:
        remember_me = True
    registered_user = Users.query.filter_by(UserName=username).first()

    if not registered_user is None:
        ExpDate = registered_user.ExpiryDate
        UType = registered_user.UserType

    if registered_user is None:
        error = 'Invalid Username.'
        flash('Username is invalid' , 'error')
        return render_template('login.html', error=error)

    if not registered_user.check_password(password):
        error = 'Password is invalid.'
        flash('Password is invalid','error')
        return render_template('login.html', error=error)

    if not registered_user.check_validity(ExpDate, UType):
        error = 'Your credentials expired, please contact Administrator'
        flash('Your credentials expired, please contact Administrator','error')
        return render_template('login.html', error=error)

    login_user(registered_user, remember = remember_me)
    flash('Logged in successfully')
    registered_user.LastLogin = datetime.datetime.now()
    db.session.commit()
    return redirect("")#request.args.get('next') or url_for('index')

@app.route('/logout')
def logout():
	session.clear()
	logout_user()
	return redirect("")

@login_manager.user_loader
def load_user(id):
    return Users.query.get((id))

@googlelogin.user_loader
def get_user(userid):
    return users.get(userid)

@app.before_request
def before_request():
    g.user = current_user
