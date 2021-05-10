
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
optimData = pd.read_csv(dataPath + "Optimal_Output.csv")
conn = MySQLdb.connect(host= "localhost",
                  user="root",
                  passwd="root",
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

x = conn.cursor()
try:
    x.execute("Drop table if Exists optim_data;")
    x.execute("Create table optim_data (TotalSpend float(20,2), DM float(20,2), Digital float(20,2), Email float(20,2), Ext_Email float(20,2), MAGAZINE float(20,2), OOH float(20,2), PR float(20,2), Paid_Search float(20,2), Print float(20,2),RADIO float(20,2), TRADE_COOP float(20,2), TRADE_DM float(20,2), TV float(20,2),base_year float(20,2), primary key(TotalSpend));")
    conn.commit()
except:
   print "error"
   conn.rollback()

for i in range(len(optimData)):
    Total_Spend = float(optimData.iloc[i,0])
    DM = float(optimData.iloc[i,1])
    Digital = float(optimData.iloc[i,2])
    Email = float(optimData.iloc[i,3])
    Ext_Email = float(optimData.iloc[i,4])
    MAGAZINE = float(optimData.iloc[i,5])
    OOH = float(optimData.iloc[i,6])
    PR = float(optimData.iloc[i,7])
    Paid_Search = float(optimData.iloc[i,8])
    Print = float(optimData.iloc[i,9])
    RADIO = float(optimData.iloc[i,10])
    TRADE_COOP = float(optimData.iloc[i,11])
    TRADE_DM = float(optimData.iloc[i,12])
    TV = float(optimData.iloc[i,13])
    base_year = float(optimData.iloc[i,14])
    try:
       query = "INSERT INTO optim_data (TotalSpend, DM, Digital, Email, Ext_Email, MAGAZINE, OOH, PR, Paid_Search, Print, RADIO, TRADE_COOP, TRADE_DM, TV,base_year) VALUES ( %s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)"
       x.execute(query, (Total_Spend, DM, Digital, Email, Ext_Email, MAGAZINE, OOH, PR, Paid_Search, Print, RADIO, TRADE_COOP, TRADE_DM, TV,base_year))
#       x.execute("""INSERT INTO histData VALUES (%s,%s)""",(Category, Type))
       conn.commit()
    except:
       print "errorrrrrrrrrrrrr"        
       conn.rollback()

x.close()
conn.close()
