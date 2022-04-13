#!/usr/bin/env python
from flask import Flask, jsonify, redirect, url_for, render_template, send_from_directory, send_file
from flaskext.mysql import MySQL
import json
import pickle
from sklearn.preprocessing import PolynomialFeatures

# Create app name and config options that are later needed
app = Flask(__name__)
mysql = MySQL()

app.config['MYSQL_DATABASE_HOST'] = 'main-db.cd8z7cqv2c8a.us-east-1.rds.amazonaws.com'
app.config['MYSQL_DATABASE_PORT'] = 3306
app.config['MYSQL_DATABASE_USER'] = 'admin'
app.config['MYSQL_DATABASE_PASSWORD'] = 'creamcheese95'

mysql.init_app(app)


# Landing page route
@app.route("/")
@app.route("/index")
def landing_page():
    return render_template("index.html", content="trying stuff out")


# Map page route
@app.route("/map")
def map_page():
    return render_template("map.html")


# Query that returns the correct bagel image based on bike availability passed in
@app.route("/Bagel_Icon/<type>")
def bagel_icon(type):
    """Function that checks the string that is passed in and returns correct image in response"""
    if type == "Full":
        return send_file("static/icons/Bagel_Full_Small.png", mimetype='image/png')
    elif type == "Empty":
        return send_file("static/icons/Bagel_Empty_Small.png", mimetype='image/png')
    elif type == "Semi_Empty":
        return send_file("static/icons/Bagel_Semi_Empty_Small.png", mimetype='image/png')
    else:
        return send_file("static/icons/Bagel_Semi_Full_Small.png", mimetype='image/png')


# Route for statistics page
@app.route("/stats")
def stats_page():
    return render_template("stats.html")


# API that generates bike availability prediction for user based on trained models
@app.route("/model/<num>/<weekday>")
def predict3(num, weekday):
    """Function that uses associated parameters to search for appropriate pickle
    serialised file and returns it as a deserialized json object"""

    # Create initial string and add values to it to help find the correct file
    pickle_rick = "ModellingNotebooks/mean-bikes-pickle"
    pickle_rick += str(num) + "-"
    if str(weekday) == "weekday":
        pickle_rick += "weekday"
    elif str(weekday) == "weekend":
        pickle_rick += "weekend"
    with open(pickle_rick, 'rb') as file:
        model = pickle.load(file)

    # Create PolynomialFeatures object to generate polynomial predictions
    poly = PolynomialFeatures(degree=2)

    # Result to be passed into dictionary to allow it to be then returned as JSON
    result = {}
    for i in range(24):
        value = (model.predict(poly.fit_transform(([[i]]))))[0]
        result.update({i: value})
    return jsonify(result)


# API query that queries database for weather information
@app.route("/get-weather")
def get():
    """Function that gets most recent weather data from current weather table

    Returns current weather information as a JSON object"""
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.current_weather order by Time desc limit 1''')
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    json_weather = jsonify({'weather': r})
    return json_weather


# API query that queries database for hourly weather information
@app.route("/hourly-weather")
def get_hourly():
    """Function that gets recent hourly weather data from hourly weather table

    Returns an array of JSON objects for each of the 10 rows queried in the SQL query"""
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.hourly_weather order by Hour_Recorded desc, Hourly_Time asc limit 10''')
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    json_hourly = jsonify({'hourly': r})
    return json_hourly


# API query that generates daily weather information for user
@app.route("/daily-weather")
def get_daily():
    """Function that gets recent daily weather data from hourly weather table

    Returns an array of JSON objects for each of the 10 rows queried in the SQL query"""
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.daily_weather order by Hour_Recorded desc, Daily_Time asc limit 10''')
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    json_hourly = jsonify({'daily': r})
    return json_hourly


# API query that returns json object of bike stations and their locations
@app.route('/static_stations')
def static_stations():
    """Function that returns JSON object containing constant information for stations"""
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.static_table order by address''')
    r = [dict((cur.description[i][0], value)
              for i, value in enumerate(row)) for row in cur.fetchall()]
    json_stations = jsonify({'stations': r})
    return json_stations


# API query that obtains up-to-date information on bike availability for stations
@app.route('/station_info')
def get_station_info():
    """Function that returns JSON object of current station information"""

    def run_station_query():
        """Function that generates SQL query for current information for all bike stations

        Returns result of SQL query"""
        cur = mysql.connect().cursor()
        sql_query = ("SELECT dt.Station_Number, st.address, dt.Available_Stands, dt.Available_Bikes, dt.Time_Entered "
                     "FROM maindb.static_table as st, maindb.dynamic_table as dt "
                     "WHERE dt.Station_Number=st.number ORDER BY Time_Entered DESC LIMIT 110;")
        cur.execute(sql_query)
        return cur

    def create_station_data_list(cur):
        """Function that handles result of SQL query for JSONification

        Returns list containing station data for each station individually"""
        rows = cur.fetchall()
        column_list = cur.description
        station_data_list = []
        for row in rows:
            station_dict = dict()
            for i, row_value in enumerate(row):
                column_name = column_list[i][0]
                station_dict[column_name] = row_value
            station_data_list.append(station_dict)
        return station_data_list

    # Run the SQL query and return the result as JSON
    cur = run_station_query()
    station_data_list = create_station_data_list(cur)
    return jsonify({'station_info': station_data_list})


# Set host IP address to any and the port number to 5000
if __name__ == "__main__":
    app.run(debug=True, host='0.0.0.0', port=5000)
