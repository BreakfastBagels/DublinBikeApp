import json
import time
import datetime

import errors
import getJSON as gj
from sqlalchemy import create_engine

with open("keys.json", "r") as keys_file:
    keys_handle = json.load(keys_file)


def dublin_bikes_scraper():
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
    user = keys_handle['DB']['user']
    password = keys_handle['DB']['password']
    host = keys_handle['DB']['host']
    port = keys_handle['DB']['port']
    db = keys_handle['DB']['db']
    
    conn_str = f"mysql+mysqlconnector://{user}:{password}@{host}:{port}/{db}"
    engine = create_engine(conn_str, echo=True)
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
