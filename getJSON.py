import json
import requests
import errors

# API keys file opened in this module to access the necessary keys for the user
with open('keys.json', 'r') as keys_file:
    api_keys = json.load(keys_file)


class GetJson:

    def __init__(self, desired_key):
        self._key = self.set_key(desired_key)
        self.__api = api_keys[self._key]

# Explicit getter and setter methods for the API key
    def get_key(self):
        return self._key

# Exceptions raised for invalid API key will kill the program
    def set_key(self, requested_key):
        if not isinstance(requested_key, str):
            raise TypeError("The requested data must be in string format")
        elif requested_key not in api_keys:
            raise ValueError("That input is invalid. Check the api keys file for valid inputs")
        else:
            return requested_key

    def del_key(self):
        del self._key

    key = property(get_key, set_key, del_key)

# Accesses dictionary to return the actual key for the given API
    def get_api(self):
        return api_keys[self.key]

# API request handled here for the bikes data
    def get_bikes_json(self):
        bikes_data = requests.get\
            (f"https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey={self.get_api()}")

        if bikes_data.status_code == 200:
            return json.loads(bikes_data.content)
        elif bikes_data.status_code == 400:
            raise errors.Error400()
        elif bikes_data.status_code == 401:
            raise errors.Error401()
        elif bikes_data.status_code == 403:
            raise errors.Error403()
        elif bikes_data.status_code == 404:
            raise errors.Error404()
        elif bikes_data.status_code == 408:
            raise errors.Error408()
        elif bikes_data.status_code == 429:
            raise errors.Error429()
        elif bikes_data.status_code == 500:
            raise errors.Error500()
        elif bikes_data.status_code == 511:
            raise errors.Error511()

# API request handled here for the weather data
    def get_weather_data(self):
        weather_data = requests.get\
            (f"https://api.openweathermap.org/data/2.5/onecall?lat=53.3497645&lon=-6.2602732&exclude=minutely&appid={self.get_api()}")
        if weather_data.status_code == 200:
            return json.loads(weather_data.content)
        elif weather_data.status_code == 400:
            raise errors.Error400()
        elif weather_data.status_code == 401:
            raise errors.Error401()
        elif weather_data.status_code == 403:
            raise errors.Error403()
        elif weather_data.status_code == 404:
            raise errors.Error404()
        elif weather_data.status_code == 408:
            raise errors.Error408()
        elif weather_data.status_code == 429:
            raise errors.Error429()
        elif weather_data.status_code == 500:
            raise errors.Error500()
        elif weather_data.status_code == 511:
            raise errors.Error511()
