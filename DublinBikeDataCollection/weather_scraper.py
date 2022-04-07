import json
import time
import datetime
import getJson as gj
import errors
from sqlalchemy import create_engine

with open("keys.json", "r") as keys_file:
    keys_handle = json.load(keys_file)


def weather_scraper():
    """Function to return data from weather data"""
    dublin_weather = gj.GetJson('Bagel_Weather')
    try:
        dublin_weather_json = dublin_weather.get_weather_data()
    except errors.Error400:
        print(errors.Error400())
    except errors.Error401:
        print(errors.Error401())
    except errors.Error403:
        print(errors.Error403())
    except errors.Error404:
        print(errors.Error404)
    except errors.Error408:
        print(errors.Error408())
    except errors.Error429:
        print(errors.Error429())
    except errors.Error500:
        print(errors.Error500())
    except errors.Error511:
        print(errors.Error511())
    else:
        return dublin_weather_json


def post_weather_to_table(json):
    user = keys_handle['DB']['user']
    password = keys_handle['DB']['password']
    host = keys_handle['DB']['host']
    port = keys_handle['DB']['port']
    db = keys_handle['DB']['db']

    #current weather
    conn_weather = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}"
    weather_engine = create_engine(conn_weather, echo=True)
    timestamp_current_weather = datetime.datetime.fromtimestamp(time.time())
    timestamp_current_weather = f"\'{timestamp_current_weather}\'"
    current_temp = f"\'{json['current']['temp']}\'"
    wind_speed = f"\'{json['current']['wind_speed']}\'"
    current_ID = f"\'{json['current']['weather'][0]['main']}\'"
    current_description = f"\'{json['current']['weather'][0]['description']}\'"
    feels_like = f"\'{json['current']['feels_like']}\'"
    max_weather = f"\'{json['daily'][0]['temp']['max']}\'"
    min_weather = f"\'{json['daily'][0]['temp']['min']}\'"
    sunrise = f"\'{json['current']['sunrise']}\'"
    sunset = f"\'{json['current']['sunset']}\'"
    sql_weather = f'''INSERT INTO `current_weather` (Time, Current_Temp,
     Feels_Like, Wind_Speed, Current_ID, Current_Description, Sunrise, Sunset, Max_Temp, Min_Temp) 
     VALUES ({timestamp_current_weather}, {current_temp}, {feels_like}, 
    {wind_speed}, {current_ID}, {current_description}, {sunrise}, {sunset}, {max_weather}, {min_weather});'''
    weather_engine.execute(sql_weather)

    #hourly weather
    for i in range(len(json)):
        hour_temp = f"\'{json['hourly'][i]['temp']}\'"
        hour_time = f"\'{datetime.datetime.fromtimestamp(json['hourly'][i]['dt'])}\'"
        hour_feels = f"\'{json['hourly'][i]['feels_like']}\'"
        hour_wind = f"\'{json['hourly'][i]['wind_speed']}\'"
        hour_ID = f"\'{json['hourly'][i]['weather'][0]['id']}\'"
        hour_des = f"\'{json['hourly'][i]['weather'][0]['description']}\'"
        hour_pic = f"\'{json['hourly'][i]['weather'][0]['icon']}\'"
        hour_recorded = f"\'{datetime.datetime.fromtimestamp(time.time())}\'"
        sql_hourly = f'''INSERT INTO `hourly_weather` (Hourly_Time, Hourly_Temp, Hourly_Feels_Like,
         Hourly_Wind, Hourly_ID, Hourly_Description, Hourly_Picture, Hour_Recorded) 
         VALUES ({hour_time}, {hour_temp}, {hour_feels}, {hour_wind}, {hour_ID}, {hour_des}, {hour_pic}, {hour_recorded});'''
        weather_engine.execute(sql_hourly)

    #daily_weather
    for j in range(len(json)):
        day_time = f"\'{datetime.datetime.fromtimestamp(json['daily'][j]['dt'])}\'"
        day_sunrise = f"\'{datetime.datetime.fromtimestamp(json['daily'][j]['sunrise'])}\'"
        day_sunset = f"\'{datetime.datetime.fromtimestamp(json['daily'][j]['sunset'])}\'"
        day_temp = f"\'{json['daily'][j]['temp']['day']}\'"
        day_max = f"\'{json['daily'][j]['temp']['max']}\'"
        day_min = f"\'{json['daily'][j]['temp']['min']}\'"
        day_feels = f"\'{json['daily'][j]['feels_like']['day']}\'"
        day_wind = f"\'{json['daily'][j]['wind_speed']}\'"
        night_temp = f"\'{json['daily'][j]['temp']['night']}\'"
        night_feels = f"\'{json['daily'][j]['feels_like']['night']}\'"
        day_ID = f"\'{json['daily'][j]['weather'][0]['id']}\'"
        day_des = f"\'{json['daily'][j]['weather'][0]['description']}\'"
        day_pic = f"\'{json['daily'][j]['weather'][0]['icon']}\'"
        hour_recorded = f"\'{datetime.datetime.fromtimestamp(time.time())}\'"
        sql_daily = f'''INSERT INTO `daily_weather` (Daily_Time, Daily_Sunrise, Daily_Sunset, Daily_Temp, Daily_Max,
        Daily_Min, Daily_Feels, Daily_Wind, Daily_Temp_Night, Daily_Feels_Night, Daily_ID, Daily_Description, Daily_Picture, Hour_Recorded) 
         VALUES ({day_time}, {day_sunrise}, {day_sunset}, {day_temp}, {day_max}, {day_min}, {day_feels}, {day_wind},
         {night_temp}, {night_feels},{day_ID}, {day_des}, {day_pic}, {hour_recorded});'''
        weather_engine.execute(sql_daily)


if __name__ == "__main__":
    while True:
        weather_json = weather_scraper()
        post_weather_to_table(weather_json)
        time.sleep(3600)  # collect info hourly
