# -*- coding: utf-8 -*-
"""
Created on Mon Jan  8 13:55:31 2018

@author: sandeep
"""

import os
import sys
sys.path.insert(0, os.path.split(os.path.dirname(os.path.abspath(__file__)))[0])
import pandas as pd
import numpy as np
import pickle
from config import dataPath, userName, db, password
from pandas.io import sql
from sqlalchemy import create_engine

engine = create_engine("mysql://{user}:{pw}@localhost/{db}"
                       .format(user=userName,
                               pw=password,
                               db=db))
                               
                               
f = open(dataPath+"Data.pickle",'rb')
data = pickle.load(f)
f.close()

for k,v in data.iteritems():
    out = v
    out['index_col'] = out.index
#    out = out.set_index([0])    
    out.to_sql(con=engine, name=k , if_exists='replace', index = False)



#to retrive data    
booking_data = pd.read_sql("select * from booking_data;", con=engine)
booking_data.index = booking_data['index_col']
booking_data.drop("index_col", axis = 1, inplace = True)

impression = pd.read_sql("select * from impression;", con=engine)
impression.index = impression['index_col']
impression.drop("index_col", axis = 1, inplace = True)

transformations = pd.read_sql("select * from transformations;", con=engine)
transformations.index = transformations['index_col']
transformations.drop("index_col", axis = 1, inplace = True)

model_estimate = pd.read_sql("select * from model_estimate;", con=engine)
model_estimate.index = model_estimate['index_col']
model_estimate.drop("index_col", axis = 1, inplace = True)

revenue = pd.read_sql("select * from revenue;", con=engine)
revenue.index = revenue['index_col']
revenue.drop("index_col", axis = 1, inplace = True)

canada_split = pd.read_sql("select * from canada_split;", con=engine)
canada_split.index = canada_split['index_col']
canada_split.drop("index_col", axis = 1, inplace = True)

category_map = pd.read_sql("select * from category_map;", con=engine)
category_map.index = category_map['index_col']
category_map.drop("index_col", axis = 1, inplace = True)

ext_data = pd.read_sql("select * from `ext.data`;", con=engine)
ext_data.index = ext_data['index_col']
ext_data.drop("index_col", axis = 1, inplace = True)



