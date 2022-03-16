#!/usr/bin/env python
from flask import Flask, jsonify, redirect, url_for, render_template
from flaskext.mysql import MySQL
import json

app = Flask(__name__)
mysql = MySQL()

app.config['MYSQL_DATABASE_HOST'] = 'localhost'
app.config['MYSQL_DATABASE_PORT'] = 3306
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'Pepper12'

mysql.init_app(app)

@app.route("/home")
def landing_page():
    return render_template("index.html", content = "trying stuff out")

@app.route("/map")
def map_page():
    return render_template("map.html")

@app.route("/stats")
def stats_page():
    return render_template("stats.html")

@app.route("/get-weather")
def get():
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.current_weather''')
    r = [dict((cur.description[i][0], value)
                for i, value in enumerate(row)) for row in cur.fetchall()]
    json_weather = jsonify({'weather' : r})
    return json_weather

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

@app.route('/keys')
def get_keys():
    with open('DublinBikeDataCollection/keys.json', 'r') as keys_file:
        api_keys = json.load(keys_file)
        return jsonify(api_keys)

@app.route('/static_stations')
def static_stations():
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.static_table''')
    r = [dict((cur.description[i][0], value)
                for i, value in enumerate(row)) for row in cur.fetchall()]
    json_stations = jsonify({'stations' : r})
    return json_stations

if __name__ == "__main__":
    app.run(debug=True)