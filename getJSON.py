import json
import requests
import errors

with open('API_keys.json', 'r') as API_file:
    api_keys = json.load(API_file)


class GetJson:

    def __init__(self, desired_key):
        self._key = self._set_key(desired_key)
        self.__api = api_keys[self._key]

    @property
    def key(self):
        return self._key

    def _set_key(self, requested_key):
        if not isinstance(requested_key, str):
            raise TypeError("The requested data must be in string format")
        elif requested_key not in api_keys:
            raise ValueError("That input is invalid. Check the api keys file for valid inputs")
        else:
            return requested_key

    def get_api(self):
        return api_keys[self.key]

    def get_bikes_json(self):
        bikes_data = requests.get\
            (f"https://api.jcdecaux.com/vls/v1/stations?contract=dublin&apiKey={self.get_api()}")

        if bikes_data.status_code != 200:
            raise errors.CommunicationError("There was an error in the response: " + str(bikes_data.status_code))
        else:
            return json.loads(bikes_data.content)

    def get_weather_data(self):
        pass
