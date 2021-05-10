import pandas as pd
import json
import os
os.chdir("/home/sandeep/Desktop/cbc16novDraft/data/")
#import numpy as np
histData = pd.read_excel("/home/sandeep/Desktop/cbc16novDraft/data/Weekly-Aggregated-Historical-data.xlsx")

spendData = histData[histData['Type']=='Spend']
bookingData = histData[histData['Type']=='Booking']

spendY2015 = spendData.iloc[:,2].sum()
spendY2016 = spendData.iloc[:,3].sum()
spendY2017 = spendData.iloc[:,4].sum()

spendDict = [{"Year": 2015, "spend": spendY2015}, {"Year": 2016, "spend": spendY2016}, {"Year": 2017, "spend": spendY2017}]

#bookingY2015 = bookingData.iloc[:,2].sum()
#bookingY2016 = bookingData.iloc[:,3].sum()
#bookingY2017 = bookingData.iloc[:,4].sum()
#
bookingY2015 = bookingData.iloc[-1,2]
bookingY2016 = bookingData.iloc[-1,3]
bookingY2017 = bookingData.iloc[-1,4]

#bookingDict = [{"2015": int(bookingY2015)},{"2016": int(bookingY2016),"2017": int(bookingY2017)}
bookingDict = [{"Date": 2015, "booking": int(bookingY2015)}, {"Date": 2016, "booking": int(bookingY2016)}, {"Date": 2017, "booking": int(bookingY2017)}]


with open("spend.json" , "w") as f:
    json.dump(spendDict, f)


with open("booking.json" , "w") as f:
    json.dump(bookingDict, f)
    
 
baseyearspend = list(spendData[2016])
baseyearspend = [round(item, 2) for item in baseyearspend]
baseYearDataForSlider = dict(zip(spendData["Category"], baseyearspend))

with open("SliderData.json" , "w") as f:
    json.dump(baseYearDataForSlider, f)