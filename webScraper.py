import requests
import json
import time

with open("API_keys.json", "r") as API_file:
    API_keys_handle = json.load(API_file)


def dublin_bikes_scraper():
    """Function to return sample data from dynamic bike availability data."""
    print("Retrieving bike data...", end=" ")
    dublin_bikes_dynamic_data = requests.get("https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey="
                                             + API_keys_handle['bikesApi'])

    # This print is kept since it prints response code, rest is a sample to display data to console
    print(dublin_bikes_dynamic_data)
    # dublin_bikes_dynamic_json = json.loads(dublin_bikes_dynamic_data.content)
    # print(f"Statistics for station number {dublin_bikes_dynamic_json[0]['number']}:")
    # print(f"Current bike availability: {dublin_bikes_dynamic_json[0]['available_bikes']}")
    # print(f"Current bike space availability: {dublin_bikes_dynamic_json[0]['available_bike_stands']}")
    # print(f"This information was last updated at {time.ctime(dublin_bikes_dynamic_json[0]['last_update']*10**-3)}")


if __name__ == "__main__":
    while True:
        dublin_bikes_scraper()
        time.sleep(300)        # Info appears to update around every 5 minutes based on tests
