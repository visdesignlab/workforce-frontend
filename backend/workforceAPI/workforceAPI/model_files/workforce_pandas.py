
# This module extracts all the csv files found in a specified directory and loads them into a dictionary of pandas dataframes
# Each dataframe is truncated at the *end* position as specified in the first column of each imported CSV file.
# The provided functions allow the list of dataframes to be retrieved and access to the dataframes themselves
# Designed to be maintained in Jupyter Notebook to assist learning, it is converted to standard Python via : 
## jupyter nbconvert --to script workforce_pandas.ipynb
# In[10]:


import pandas as pd
import json
import sys
import os
import re
from workforceAPI.settings import MEDIA_ROOT


# The dataframes dictionary is used to create a indexed home for all the pandas data frames.  Their CSV file names, which were automatically generated from their sheet names by the Excel import service will then used as their panda names.
# The sheets array will be used to store a full list of the names of all the panda dataframes created
# This section has two main functions.  First, it will scan the prescribed directory for all the files with .csv as their suffix.  For each file found, a loop begins.  
# The name of the csv file (minus the suffix) is asigned to the sheet variable.  This is appended to the sheets array.  
# The csv file is then read into a pandas dataframe.  This dataframe is stored in the frames dictionary under the name of the sheet.  The dataframe is then scanned looking for the value <<end>> in the first column.  This is deemed to be the end of the dataframe and the dataframe is truncated to the row above this.
# The loop continues until all the .csv files have been read and processed.
# Trimming the length first (according to an easy to use human clip point) then makes trimming the columns much more reliable...
# In[13]:

def get_dataframes_sheets(model_id):
    dataframes = {}
    sheets = []
    for f in os.listdir(MEDIA_ROOT):
        if f.endswith(".csv") and f.startswith(model_id):
            sheet = os.path.splitext(f)[0]
            sheets.append(sheet)
            dataframes[sheet] = pd.read_csv(MEDIA_ROOT / f)
            for j in range(len(dataframes[sheet])):
                if dataframes[sheet].iloc[j,0] =="<<end>>":
                    break
            dataframes[sheet] = dataframes[sheet].head(j)
            dataframes[sheet]=dataframes[sheet].dropna(axis=1,how='all')
    return dataframes, sheets
