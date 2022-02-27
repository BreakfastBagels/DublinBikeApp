#!/usr/bin/env python
from flask import Flask, jsonify

app = Flask(__name__, static_url_path='')

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/station/<int:station_id>')
def get_station(station_id):
    if (station_id == 1):
        return jsonify(
             {
                 "station_number": "1",
                 "station_name" : "O'Connell Street"
             })
    elif (station_id == 2):
        return jsonify(
             {
                 "station_number": "2",
                 "station_name" : "Grafton Street"
             })
    else:
        return jsonify(
             {
                 "station_number": "99",
                 "station_name" : "Error"
             })

if __name__ == "__main__":
    app.run(debug=True)