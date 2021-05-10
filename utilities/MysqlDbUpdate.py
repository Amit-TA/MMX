
import os
import sys
sys.path.insert(0, os.path.split(os.path.dirname(os.path.abspath(__file__)))[0])

import MySQLdb
import pandas as pd
#import numpy as np
from config import dataPath
#dataPath = os.path.dirname(os.path.abspath(__file__)) + os.sep
#histData = pd.read_excel(dataPath + "Weekly-Aggregated-Historical-data.xlsx")
histData = pd.read_csv(dataPath + "Historical_tab_input_ne.csv")
conn = MySQLdb.connect(host= "localhost",
                  user="root",
                  passwd="",
                  db="cbc")
x = conn.cursor()
try:
    x.execute("Drop table if Exists histData;")
    x.execute("Create table histData (Category varchar(50), Type varchar(50), Y2015 float(20,2), Y2016 float(20,2), Y2017 float(20,2), primary key(Category, Type));")
    conn.commit()
except:
   print "error"
   conn.rollback()

for i in range(len(histData)):
    Category = str(histData.iloc[i,0])
    Type = str(histData.iloc[i,1])
    Y2015 = float(histData.iloc[i,2])
    Y2016 = float(histData.iloc[i,3])
    Y2017 = float(histData.iloc[i,4])
    try:
       query = "INSERT INTO histData (Category, Type, Y2015, Y2016, Y2017) VALUES ( %s,%s,%s,%s,%s)"
       x.execute(query, (Category, Type, Y2015, Y2016, Y2017))
#       x.execute("""INSERT INTO histData VALUES (%s,%s)""",(Category, Type))
       conn.commit()
    except:
       conn.rollback()

x.close()
conn.close()
