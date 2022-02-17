import requests
import json
import time
import datetime
from sqlalchemy import create_engine

with open("API_keys.json", "r") as API_file:
    API_keys_handle = json.load(API_file)

with open("DB_keys.json", "r") as DB_file:
    DB_file_handle = json.load(DB_file)


def dublin_bikes_scraper():
    """Function to return sample data from dynamic bike availability data."""
    dublin_bikes_dynamic_data = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey="
                                             + API_keys_handle['bikesApi'])
    dublin_bikes_dynamic_json = json.loads(dublin_bikes_dynamic_data.content)
    return dublin_bikes_dynamic_json


def post_json_to_table(json):
    user = DB_file_handle['user']
    password = DB_file_handle['password']
    host = DB_file_handle['host']
    port = DB_file_handle['port']
    db = DB_file_handle['db']
    
    conn_str = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}"
    engine = create_engine(conn_str, echo=True)
    for row in json:
        timestamp_updated = datetime.datetime.fromtimestamp((row['last_update']*10**-3))
        timestamp_updated = f"\'{timestamp_updated}\'"
        timestamp_entered = datetime.datetime.fromtimestamp(time.time())
        timestamp_entered = f"\'{timestamp_entered}\'"
        status = f"\'{row['status']}\'"
        sql_query = f'''INSERT INTO `dynamic_table` (Station_Number, Available_Stands, Available_Bikes, Status, Station_Updated, Time_Entered) VALUES ({row['number']}, {row['available_bike_stands']}, {row['available_bikes']}, {status}, {timestamp_updated}, {timestamp_entered});'''
        engine.execute(sql_query)


if __name__ == "__main__":
    while True:
        bikes_json = dublin_bikes_scraper()
        post_json_to_table(bikes_json)
        time.sleep(300)        # Info appears to update around every 5 minutes based on tests