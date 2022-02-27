#!/usr/bin/env python
from flask import Flask, jsonify

app = Flask(__name__, static_url_path='')

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/station/<int:station_id>')
def get_station(station_id):
    if (station_id == 2):
        return jsonify(
             {
                 "number": "2",
                 "name" : "BLESSINGTON STREET",
                 "address" : "Blessington Street",
                 "latitude" : "53.356769",
                 "longitude" : "-6.26814",
             })
    elif (station_id == 3):
        return jsonify(
             {
                 "number": "3",
                 "name" : "BOLTON STREET",
                 "address" : "Bolton Street",
                 "latitude" : "53.351182",
                 "longitude" : "-6.269859",
             })
    else:
        return jsonify(
             {
                 "number": "99",
                 "name" : "ERROR",
                 "address" : "Bolton Street",
                 "latitude" : "0.0000",
                 "longitude" : "0.0000",
             })

if __name__ == "__main__":
    app.run(debug=True)