# Import necessary classes and modules

import json
import time
import datetime

import errors
import getJson as gj
from sqlalchemy import create_engine

# Open API keys file to use API keys as necessary
with open("keys.json", "r") as keys_file:
    keys_handle = json.load(keys_file)


# Use try and except block to handle any status code errors in server response when trying
# to access JSON data
def dublin_bikes_scraper():
    """Function that queries DublinBikes API for current JSON data

    Returns a json object of current bike information"""
    dublin_bikes = gj.GetJson('bikesApi')
    try:
        dublin_bikes_json = dublin_bikes.get_bikes_json()
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
        return dublin_bikes_json


def post_json_to_table(json):
    """Function that puts input json data into remote database

    No return value."""

    # Handles established for accessing remote database
    user = keys_handle['DB']['user']
    password = keys_handle['DB']['password']
    host = keys_handle['DB']['host']
    port = keys_handle['DB']['port']
    db = keys_handle['DB']['db']

    # Connection string for accessing database and function that creates database engine for queries
    conn_str = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}"
    engine = create_engine(conn_str, echo=True)

    # Iteratively create sql queries to put bike station info into database by station at any given time
    for row in json:
        timestamp_entered = datetime.datetime.fromtimestamp(time.time())
        timestamp_entered = f"\'{timestamp_entered}\'"
        status = f"\'{row['status']}\'"
        sql_query = (
            f"INSERT INTO `dynamic_table` (Station_Number, Available_Stands, Available_Bikes, Status, Time_Entered) "\
            f"VALUES ({row['number']}, {row['available_bike_stands']}, {row['available_bikes']},{status}, {timestamp_entered});"\
        )
        engine.execute(sql_query)


if __name__ == "__main__":
    while True:
        bikes_json = dublin_bikes_scraper()
        post_json_to_table(bikes_json)
        time.sleep(600)        # Info appears to update around every 5 minutes based on tests
