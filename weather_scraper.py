import json
import time
import datetime
import getJSON as gj
from sqlalchemy import create_engine
    
with open("keys.json", "r") as keys_file:
    keys_handle = json.load(keys_file)


def weather_scraper():
    """Function to return data from weather data"""
    dublin_weather_json = gj.GetJson('Bagel_Weather')
    return dublin_weather_json


def post_weather_to_table(json):
    user = keys_handle['DB']['user']
    password = keys_handle['DB']['password']
    host = keys_handle['DB']['host']
    port = keys_handle['DB']['port']
    db = keys_handle['DB']['db']
    
    conn_weather = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}"
    weather_engine = create_engine(conn_weather, echo=True)

    timestamp_current_weather = datetime.datetime.fromtimestamp(time.time())
    timestamp_current_weather = f"\'{timestamp_current_weather}\'"
    current_temp = f"\'{json['current']['temp']}\'"
    wind_speed = f"\'{json['current']['wind_speed']}\'"
    current_ID = f"\'{json['current']['weather'][0]['main']}\'"
    current_description = f"\'{json['current']['weather'][0]['description']}\'"
    feels_like = f"\'{json['current']['feels_like']}\'"
    sql_weather = f'''INSERT INTO `current_weather` (Time, Current_Temp,
     Feels_Like, Wind_Speed, Current_ID, Current_Description) 
     VALUES ({timestamp_current_weather}, {current_temp}, {feels_like}, 
    {wind_speed}, {current_ID}, {current_description});'''
    weather_engine.execute(sql_weather)


if __name__ == "__main__":
    while True:
        weather_json = weather_scraper()
        post_weather_to_table(weather_json)
        time.sleep(3600)  # collect info hourly
