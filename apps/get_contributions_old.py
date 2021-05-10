# -*- coding: utf-8 -*-
"""
Created on Mon Nov 06 12:00:59 2017

@author: deepak.kandasamy
"""

import os
import pandas as pd
import numpy as np
import warnings
import pickle
import json
warnings.filterwarnings('ignore')
from config import dataPath
#import configparser
#config = configparser.ConfigParser()
#config.read_file(open('contribution.cfg'))

#dataPath = dataPath
#dataPath = config['GET_CONTRIBUTION']['dataPath']
# sample user input
#user_input = {'Email':0.0, 'Digital':0, 'DM':0, 'Ext. Email':0, 'MAGAZINE':0,
#              'Print':0, 'OOH':0, 'PR':0, 'RADIO':0, 'Paid Search':0, 'TRADE.COOP':0,
#              'TRADE.DMA_OTHER':0, 'TV':0, 'base_year':2016}

def apply_transformations(ts, x, base_year):
	# Scaling the impressions for test scenario
	ts.loc[ts['Year']==2016,x.Variable] = ts.loc[ts['Year']==base_year,x.Variable]*(1+x.change)
	ts.drop('Year',1,inplace=True)
	# Applying the transformations.
	if x.Transformation == 'adstock':
		tmp_ts = []
		tmp = 0
		for index, row in ts.iterrows():
			tmp = row[x.Variable] + x.factor/100*tmp
			tmp_ts.append(tmp)
		ts[x.Variable] = tmp_ts
	elif x.Transformation == 'lag':
		ts[x.Variable] = ts[x.Variable].shift(x.factor)
	elif x.Transformation == 'lags':
		ts[x.Variable] = ts[x.Variable].rolling(int(x.factor),min_periods=1).sum()
	
	# Applying diminishing returns..
	if x.c*x.d:
		ts[x.Variable] = 1-np.exp(-x.c*((ts[x.Variable]/x.Max*1000.0)**x.d))
	return ts[x.Variable]

def split_canada_contributions(canada_dstn, idv_df, canada_model_estimate):
	canada_dstn['Date'] = pd.to_datetime(canada_dstn['Date']).dt.date
	canada_dstn = canada_dstn.loc[canada_dstn['Date'].isin(idv_df['Date']),:]
	tmp = pd.melt(canada_model_estimate.reset_index(),id_vars=['Model']).dropna()
	tmp = tmp.loc[tmp['variable'].isin(idv_df.columns),:]
	tmp['Contribution'] = tmp.apply(lambda x: (canada_dstn[x.Model]*idv_df[x.variable]).sum()*x.value,axis=1)
	return tmp.groupby(['Model','variable'])['Contribution'].sum().unstack(0)
	
def get_contributions(user_input):
	# Loading the data required for scenario analysis
	f = open(dataPath+"Data.pickle",'rb')
	data = pickle.load(f)
	f.close()
	base_year = user_input['base_year']
	# Transforming the Impressions for test scenario
	raw_data = data['impression']
	transformations = data['transformations']
	transformations = pd.merge(transformations,pd.DataFrame.from_dict(user_input,orient='index').rename(columns={0:'change'}),left_on='Category',right_index=True)
	tmp = transformations.apply(lambda x: apply_transformations(raw_data[['Date','Year',x.Variable]].set_index('Date'),x,base_year),axis=1)
	test_data = tmp.transpose().rename(columns=transformations['Impression'].to_dict())
	# Merging Ext. data
	ext_data = data['ext.data']
	ext_data['Date'] = pd.to_datetime(ext_data['Week']).dt.date
	ext_data = ext_data.loc[(ext_data['Date'].apply(lambda x:x.year==base_year)),:]
	ext_data.drop('Week',1,inplace = True)
	test_data = pd.merge(test_data,ext_data,left_index=True, right_on='Date')
	# Model summary
	model_estimate = data['model_estimate']
	tmp_contribution = split_canada_contributions(data['canada_split'],test_data, model_estimate.loc[model_estimate.index.str.startswith('C'),:])
	model_estimate = model_estimate.append(test_data.sum(0).rename('xSum'))
	model_estimate = model_estimate.transpose()
	contributions = model_estimate.iloc[:,:-1].multiply(model_estimate['xSum'],axis='index')
	contributions = contributions.loc[:,contributions.columns.str.startswith('U')]
	contributions = contributions.merge(tmp_contribution, how='outer',left_index=True, right_index=True)
	category_map = data['category_map']
	contributions = pd.merge(contributions,category_map,left_index=True, right_on='Variable')
	contrib_df = contributions.groupby('Category').sum()
	# Converting the booking contributions to dict of dict
	df = contrib_df.transpose().reset_index().rename(columns = {'index':'Model'})
	#if transformations['change'].sum() != 0:
	df['Terror'] = np.nan
	df['Country'] = ['USA' if cntry[0] == 'U' else 'CAN' for cntry in df['Model']]
	df['Productcode'] = df['Model'].str[1]
	df['Channelcode'] = df['Model'].str[2]
	product_dict = {'A':'Alaska','B':'Bermuda','C':'Caribbean','L':'Long Caribbean','E':'Europe','O':'Others'}
	channel_dict = {'T':'Trade','O':'Trade-OTA','C':'Consumer Outreach','W':'Web'}
	df = pd.merge(df,pd.DataFrame.from_dict(product_dict,orient='index').rename(columns={0:'Product'}),left_on='Productcode',right_index=True)
	df = pd.merge(df,pd.DataFrame.from_dict(channel_dict,orient='index').rename(columns={0:'Channel'}),left_on='Channelcode',right_index=True)
	new_df = df
	df = df.set_index(['Country','Product','Channel'])
	del df['Productcode']
	del df['Channelcode']
	del df['Model']
	del new_df['Productcode']
	del new_df['Channelcode']
	del new_df['Model']
	
	out = {}
	out['Contribution'] = df.transpose().to_dict()
	
	# Finding Revenue
	revenue = data['revenue']
	revenue_df = contrib_df.transpose().reset_index()
	revenue_df['Revenuelookup'] = revenue_df['index'].str[1:]
	revenue_df = pd.merge(revenue_df,revenue.loc[:,['Model','NTR_BKNG']],left_on='Revenuelookup',right_on='Model')
	del revenue_df['Model']
	del revenue_df['Revenuelookup']
	revenue_df = revenue_df.set_index('index')
	revenue_df = revenue_df.iloc[:,:-1].multiply(revenue_df['NTR_BKNG'],axis='index')
	cost_data = raw_data.loc[raw_data['Year']==base_year,:].sum(0)
	cost_data = transformations.loc[:,['Category','Impression','Variable','Cost/Impression','change']].set_index('Variable').transpose().append(cost_data.rename('baseSum')).transpose()
	cost_data.loc[cost_data['Category'] == 'Email', 'baseSum'] = cost_data.loc['EM', 'baseSum'] / len(cost_data.loc[cost_data['Category'] == 'Email'].index)
	cost_data['Cost'] = cost_data.apply(lambda x:x['Cost/Impression']*x['baseSum']*(1+x['change']), axis=1)
	cost_df = cost_data.groupby('Category')['Cost'].sum()
	cost_df = pd.concat([cost_df,revenue_df.sum(0).rename('Revenue')],axis=1)
	out['ROI'] = (cost_df['Revenue']/cost_df['Cost']).to_dict()
	roi_df = cost_df['Revenue']/cost_df['Cost']
	roi_df = roi_df.to_frame()
	roi_df.columns = ['ROI']
	roi_df['index'] = roi_df.index
	return out, new_df, roi_df,cost_df.reset_index()

def pieDatafilter(df, country, product, channel):
	
	if country == "All":
		country = list(df["Country"].unique())
	else:
		country = [country]
	
	if product == "All":
		product = list(df["Product"].unique())
	else:
		product = [product]
	
	if channel == "All":
		channel = list(df["Channel"].unique())
	else:
		channel = [channel]
		
	df = df[((df["Country"].isin(country)) & (df["Product"].isin(product)) & (df["Channel"].isin(channel)))]

	BPT = np.nansum([df["Base"].sum(), df["Price"].sum(), df['Terror'].sum()])
	INCR = 0
	incrDict = []
	colList = [u'DM', u'Digital', u'Email', u'Ext. Email', u'MAGAZINE',
	   u'OOH', u'PR', u'Paid Search', u'Print', u'RADIO',
	   u'TRADE.COOP', u'TRADE.DMA_OTHER', u'TV']

	for i in df.sum()[colList].sort_values(ascending=False).index:
		temp = {}
		temp["Value"] = df[i].sum()
		INCR = np.nansum([INCR, df[i].sum()])
		if (i == "MAGAZINE"):
			i = "Magazine"
		elif(i == "RADIO"):
			i = "Radio"
		elif(i == "Digital"):
			i = "Display"
		temp["Label"] = i
		incrDict.append(temp)
		
	total = INCR
	
	incrPercentDict = []
	for i in df.sum()[colList].sort_values(ascending=False).index:
		temp = {}
		temp["Percent"] = (df[i].sum()/total) * 100
		if (i == "MAGAZINE"):
			i = "Magazine"
		elif(i == "RADIO"):
			i = "Radio"
		elif(i == "Digital"):
			i = "Display"	
		temp["Label"] = i
		incrPercentDict.append(temp)

	pieDict = [{"BookingCat" : "Incremental, %.1f" %(INCR/(BPT+INCR)*100)+"%", "Value" : INCR},{"BookingCat" : "Base+Price"+("+Terrorism" if df['Terror'].sum() < 0  else "")+", %.1f" %(BPT/(BPT+INCR)*100)+"%", "Value" : BPT}]
	return BPT+INCR, pieDict, incrPercentDict, incrDict
		
def roiData(user_input):
	base_user_input = {'Email':0, 'Digital':0, 'DM':0, 'Ext. Email':0, 'MAGAZINE':0,
			  'Print':0, 'OOH':0, 'PR':0, 'RADIO':0, 'Paid Search':0, 'TRADE.COOP':0,
			  'TRADE.DMA_OTHER':0, 'TV':0, 'base_year':2016}
	[base_out, base_df, base_roi_df] = get_contributions(base_user_input)
	[new_out, new_df, new_roi_df] = get_contributions(user_input)
	base_roi_df = base_roi_df.dropna()
	new_roi_df = new_roi_df.dropna()
	
	base_roi_dict = []
	for i in list(base_roi_df.index):
		temp = {}
		temp['Value'] = base_roi_df[i]
		if (i == "MAGAZINE"):
			i = "Magazine"
		elif(i == "RADIO"):
			i = "Radio"
		elif(i == "Digital"):
			i = "Display"
		temp['Label'] = i
		base_roi_dict.append(temp)
	
	new_roi_dict = []
	for i in list(new_roi_df.index):
		temp = {}
		temp['Value'] = new_roi_df[i]
		if (i == "MAGAZINE"):
			i = "Magazine"
		elif(i == "RADIO"):
			i = "Radio"
		elif(i == "Digital"):
			i = "Display"
		temp['Label'] = i
		new_roi_dict.append(temp)
		
	return new_roi_dict, base_roi_dict

def BookingsCount(df, country, product, channel):
	if country == "All":
		country = list(df["Country"].unique())
	else:
		country = [country]
	
	if product == "All":
		product = list(df["Product"].unique())
	else:
		product = [product]
	
	if channel == "All":
		channel = list(df["Channel"].unique())
	else:
		channel = [channel]
		
	df = df[((df["Country"].isin(country)) & (df["Product"].isin(product)) & (df["Channel"].isin(channel)))]

	BPT = np.nansum([df["Base"].sum(), df["Price"].sum(), df['Terror'].sum()])
	INCR = 0
	incrDict = []
	colList = [u'DM', u'Digital', u'Email', u'Ext. Email', u'MAGAZINE',
	   u'OOH', u'PR', u'Paid Search', u'Print', u'RADIO',
	   u'TRADE.COOP', u'TRADE.DMA_OTHER', u'TV']

	for i in df.sum()[colList].sort_values(ascending=False).index:
		temp = {}
		temp["Value"] = df[i].sum()
		INCR = np.nansum([INCR, df[i].sum()])
		if (i == "MAGAZINE"):
			i = "Magazine"
		elif(i == "RADIO"):
			i = "Radio"
		elif(i == "Digital"):
			i = "Display"
		temp["Label"] = i
		incrDict.append(temp)
		
	incrPercentDict = []
	for i in df.sum()[colList].sort_values(ascending=False).index:
		temp = {}
		temp["Percent"] = (df[i].sum()/total) * 100
		if (i == "MAGAZINE"):
			i = "Magazine"
		elif(i == "RADIO"):
			i = "Radio"
		elif(i == "Digital"):
			i = "Display"
		temp["Label"] = i
		incrPercentDict.append(temp)

	pieDict = [{"BookingCat" : "Incremental, %.1f" %(INCR/(BPT+INCR)*100)+"%", "Value" : INCR},{"BookingCat" : "Base+Price"+("+Terrorism" if df['Terror'].sum() < 0  else "")+", %.1f" %(BPT/(BPT+INCR)*100)+"%", "Value" : BPT}]
	return BPT+INCR, incrDict 
