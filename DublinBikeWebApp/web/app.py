#!/usr/bin/env python
from flask import Flask, jsonify
# import os

app = Flask(__name__, static_url_path='')

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/station')
def get_station():
    return jsonify(
        {
        "station_number": "4",
        "station_name" : "Grafton Street"
        })

if __name__ == "__main__":
    app.run(debug=True)