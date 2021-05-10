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

transformation = pd.read_csv(dataPath + "Transformations_newCPM.csv")
transformation = transformation.drop(columns=['Unnamed: 0'])

##print transformation
transformation['index_col'] = transformation.index
transformation.to_sql(con=engine, name="transformations" , if_exists='replace', index = False)
