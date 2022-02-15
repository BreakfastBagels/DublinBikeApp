import requests
import json
import time
from sqlalchemy import create_engine

with open("API_keys.json", "r") as API_file:
    API_keys_handle = json.load(API_file)


def dublin_bikes_scraper():
    """Function to return sample data from dynamic bike availability data."""
    #print("Retrieving bike data...", end=" ")
    dublin_bikes_dynamic_data = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey="
                                             + API_keys_handle['bikesApi'])

    # This print is kept since it prints response code, rest is a sample to display data to console
    #print(dublin_bikes_dynamic_data)
    dublin_bikes_dynamic_json = json.loads(dublin_bikes_dynamic_data.content)
    # print(f"Statistics for station number {dublin_bikes_dynamic_json[0]['number']}:")
    # print(f"Current bike availability: {dublin_bikes_dynamic_json[0]['available_bikes']}")
    # print(f"Current bike space availability: {dublin_bikes_dynamic_json[0]['available_bike_stands']}")
    # print(f"This information was last updated at {time.ctime(dublin_bikes_dynamic_json[0]['last_update']*10**-3)}")

    return dublin_bikes_dynamic_json

def post_json_to_table(json):
    USER = "admin"
    PASSWORD = "Comp30830!"
    HOST = "main-db.cd8z7cqv2c8a.us-east-1.rds.amazonaws.com"
    PORT = "3306"
    DB = "maindb"
    
    conn_str = f"mysql+mysqlconnector://{USER}:{PASSWORD}@{HOST}:{PORT}/{DB}"
    #leaving echo=True for console debugging - take out on deployment
    engine = create_engine(conn_str, echo=True)
    sql="""CREATE DATABASE IF NOT EXISTS testdb;"""
    engine.execute(sql)

    '''
    for row in json:
        print("Running")
        time_value = row['last_update']*10**-3
        
        print(sql_query)
        engine.execute(sql_query)
        print("executed")
    '''

if __name__ == "__main__":
    while True:
        bikes_json = dublin_bikes_scraper()
        post_json_to_table(bikes_json)
        time.sleep(300)        # Info appears to update around every 5 minutes based on tests
