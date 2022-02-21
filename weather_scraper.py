import requests
import json
import time
import datetime
from sqlalchemy import create_engine

with open('Bagel_Weather.json', 'r') as API_weather_file:
    API_keys = json.load(API_weather_file)
    
with open("DB_keys.json", "r") as DB_file:
    DB_file_handle = json.load(DB_file)

def weather_scraper():
    """Function to return data from weather data"""
    dublin_weather_data = requests.get('https://api.openweathermap.org/data/2.5/onecall?lat=53.3497645&lon=-6.2602732&exclude=minutely&appid=' + API_keys['Bagel_Weather'])
    dublin_weather_dynamic_json = json.loads(dublin_weather_data.content)
    return dublin_weather_dynamic_json

def post_weather_to_table(json):
    user = DB_file_handle['user']
    password = DB_file_handle['password']
    host = DB_file_handle['host']
    port = DB_file_handle['port']
    db = DB_file_handle['db']
    
    conn_weather = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}"
    weather_engine = create_engine(conn_weather, echo=True)

    timestamp_current_weather = datetime.datetime.fromtimestamp(time.time())
    timestamp_current_weather = f"\'{timestamp_current_weather}\'"
    current_temp = f"\'{json['current']['temp']}\'"
    wind_speed = f"\'{json['current']['wind_speed']}\'"
    current_ID = f"\'{json['current']['weather'][0]['main']}\'"
    current_description = f"\'{json['current']['weather'][0]['description']}\'"
    feels_like = f"\'{json['current']['feels_like']}\'"
    sql_weather = f'''INSERT INTO `current_weather` (Time, Current_Temp, Feels_Like, Wind_Speed, Current_ID, Current_Description) VALUES ({timestamp_current_weather}, {current_temp}, {feels_like}, {wind_speed}, {current_ID}, {current_description});'''
    weather_engine.execute(sql_weather)

if __name__ == "__main__":
    while True:
        weather_json = weather_scraper()
        post_weather_to_table(weather_json)
        time.sleep(3600) #collect info hourly
