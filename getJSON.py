import json
import requests
import errors

with open('API_keys.json', 'r') as API_file:
    api_keys = json.load(API_file)


class CommunicationError(Exception):
    pass


class GetJson:

    def __init__(self, data):
        self._data = self._setdata(data)

    def _setdata(self, requested_data):
        if not isinstance(requested_data, str):
            raise TypeError("The requested data must be in string format")
        elif requested_data not in api_keys:
            raise ValueError("That input is invalid. Check the api keys file for valid inputs")
        else:
            return requested_data

    def get_api(self):
        return api_keys[self._data]

    def get_bike_data(self):
        bikes_data = requests.get(f"https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey={self.get_bike_data()}")

        if bikes_data.status_code != 200:
            raise CommunicationError("There was an error in the response: " + str(bikes_data.status_code))
        else:
            return bikes_data.content

    def get_weather_data(self):
        pass
