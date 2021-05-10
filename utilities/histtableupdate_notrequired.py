# -*- coding: utf-8 -*-
"""
Created on Thu Dec 14 14:35:12 2017

@author: sandeep.sharma
"""

import pandas as pd
import numpy as np
import warnings
import pickle
import os
from config import dataPath
from pandas.io import sql
from sqlalchemy import create_engine
engine = create_engine("mysql://{user}:{pw}@localhost/{db}"
                       .format(user="root",
                               pw="1312",
                               db="cbc"))
#df.to_sql(con=engine, name='table_name', if_exists='replace')
#dataPath = os.path.dirname(os.path.abspath(__file__)) + os.sep
warnings.filterwarnings('ignore')
# sample user input
user_input = {'Email':0.0, 'Digital':0, 'DM':0, 'Ext. Email':0, 'MAGAZINE':0,
              'Print':0, 'OOH':0, 'PR':0, 'RADIO':0, 'Paid Search':0, 'TRADE.COOP':0,
              'TRADE.DMA_OTHER':0, 'TV':0, 'base_year':2016}

def apply_transformations(ts, x, base_year=np.nan):
    # Scaling the impressions for test scenario
    if ~np.isnan(base_year):
        ts.loc[ts['Year']==base_year,x.Variable] = ts.loc[ts['Year']==base_year,x.Variable]*(1+x.change)
    
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
    # To make Terror flag zero in the new scenario
    #if transformations['change'].sum() != 0:
    df['Terror'] = np.nan
    df['Country'] = ['USA' if cntry[0] == 'U' else 'CAN' for cntry in df['Model']]
    df['Productcode'] = df['Model'].str[1]
    df['Channelcode'] = df['Model'].str[2]
    product_dict = {'A':'Alaska','B':'Bermuda','C':'Caribbean','L':'Long Caribbean','E':'Europe','O':'Others'}
    channel_dict = {'T':'Trade','O':'Trade-OTA','C':'Consumer Outreach','W':'Web'}
    df = pd.merge(df,pd.DataFrame.from_dict(product_dict,orient='index').rename(columns={0:'Product'}),left_on='Productcode',right_index=True)
    df = pd.merge(df,pd.DataFrame.from_dict(channel_dict,orient='index').rename(columns={0:'Channel'}),left_on='Channelcode',right_index=True)
    df = df.set_index(['Country','Product','Channel'])
    del df['Productcode']
    del df['Channelcode']
    del df['Model']
    
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
    cost_data['Cost'] = cost_data.apply(lambda x:x['Cost/Impression']*x['baseSum']*(1+x['change']), axis=1)
    cost_df = cost_data.groupby('Category')['Cost'].sum()
    cost_df = pd.concat([cost_df,revenue_df.sum(0).rename('Revenue')],axis=1)
    out['ROI'] = (cost_df['Revenue']/cost_df['Cost']).to_dict()
    return out 

def get_historical_performance():
    user_input = {'Email':0.0, 'Digital':0, 'DM':0, 'Ext. Email':0, 'MAGAZINE':0,
              'Print':0, 'OOH':0, 'PR':0, 'RADIO':0, 'Paid Search':0, 'TRADE.COOP':0,
              'TRADE.DMA_OTHER':0, 'TV':0}
    
    # Loading the data required for scenario analysis
    f = open(datapath+"Data.pickle",'rb')
    data = pickle.load(f)
    f.close()
    # Transforming the Impressions for test scenario
    raw_data = data['impression']
    df = raw_data.groupby('Year').sum().transpose()
    transformations = data['transformations']
    df = pd.merge(df, transformations.loc[:,['Variable','Category']], how='outer',left_index=True, right_on = 'Variable')
    df.loc[df['Category']=='Email','Category'] = np.nan
    df.loc[df['Variable']=='EM','Category'] = 'Email'
    df = df.set_index('Variable').dropna().groupby('Category').sum()
    df['Type'] = 'Impression'
    cost_data = raw_data.groupby('Year').sum().transpose()
    cost_data.loc[['STRG_Delivered','WAVE_Delivered','Tact_Delivered']] = cost_data.loc['EM'].values/3
    cost_data = pd.merge(cost_data,transformations.loc[:,['Category','Impression','Variable','Cost/Impression']].set_index('Variable'),left_index = True, right_index = True)
    cost_data[raw_data['Year'].unique()] = cost_data[raw_data['Year'].unique()].multiply(cost_data['Cost/Impression'],axis='index')
    del cost_data['Cost/Impression']    
    cost_df = cost_data.groupby('Category').sum()
    cost_df['Type'] = 'Cost'
    transformations = pd.merge(transformations,pd.DataFrame.from_dict(user_input,orient='index').rename(columns={0:'change'}),left_on='Category',right_index=True)
    tmp = transformations.apply(lambda x: apply_transformations(raw_data[['Date','Year',x.Variable]].set_index('Date'),x),axis=1)
    test_data = tmp.transpose().rename(columns=transformations['Impression'].to_dict())
    # Model estimate    
    model_estimate = data['model_estimate']
    model_estimate = model_estimate.loc[model_estimate.index.str.startswith('U'),:].sum(0)+model_estimate.loc[model_estimate.index.str.startswith('C'),:].sum(0)/3
    #contrib_df = test_data.append(model_estimate.rename('Estimate')).dropna(1)
    contrib_df = test_data.mul(model_estimate,axis=1).dropna(1).transpose()
    contrib_df = pd.merge(contrib_df, transformations.loc[:,['Category','Impression']].set_index('Impression'), left_index = True, right_index = True)
    contrib_df = contrib_df.groupby('Category').sum().transpose()
    contrib_df = contrib_df.groupby(contrib_df.index.map(lambda x:x.year)).sum().transpose()
    contrib_df['Type'] = 'Bookings'
    out = pd.concat([df.reset_index(),cost_df.reset_index(), contrib_df.reset_index()])
    tmp = out.groupby('Type').sum().reset_index()
    tmp['Category'] = 'Actual'
    tmp = tmp.loc[~tmp['Type'].isin(['Bookings']),:]
    out = pd.concat([out,tmp])
    booking_data = data['booking_data']
    tmp = booking_data.groupby(booking_data['Date'].map(lambda x:x.year)).sum().transpose()
    tmp['Category'] = 'Actual'
    tmp['Type'] = 'Bookings'
    out = pd.concat([out,tmp])
    return out

#==============================================================================

out = get_historical_performance()
out = out.reset_index(drop=True)
out.to_sql(con=engine, name='newtable', if_exists='replace')
