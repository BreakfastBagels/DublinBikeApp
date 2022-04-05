#!/usr/bin/env python
from flask import Flask, jsonify, redirect, url_for, render_template
from flaskext.mysql import MySQL
import json
import pickle
from sklearn.preprocessing import PolynomialFeatures

app = Flask(__name__)
mysql = MySQL()

app.config['MYSQL_DATABASE_HOST'] = '127.0.0.1'
app.config['MYSQL_DATABASE_PORT'] = 3306
app.config['MYSQL_DATABASE_USER'] = 'root'
app.config['MYSQL_DATABASE_PASSWORD'] = 'jackjack'

mysql.init_app(app)

@app.route("/")
def landing_page():
    return render_template("index.html", content = "trying stuff out")

@app.route("/map")
def map_page():
    return render_template("map.html")

@app.route("/stats")
def stats_page():
    return render_template("stats.html")

@app.route("/model/<num>/<weekday>")
def predict3(num, weekday):
    pickle_rick = "ModellingNotebooks/mean-bikes-pickle"
    pickle_rick += str(num) + "-"
    if str(weekday) == "weekday":
        pickle_rick += "weekday"
    elif str(weekday) == "weekend":
        pickle_rick += "weekend"
    poly = PolynomialFeatures(degree=2)
    with open(pickle_rick, 'rb') as file:
        model = pickle.load(file)
    result = {}
    for i in range(24):
        value = (model.predict(poly.fit_transform(([ [i] ]))))[0]
        result.update({i: (value)})
    return jsonify(result)

@app.route("/get-weather")
def get():
    cur = mysql.connect().cursor()
    cur.execute('''select * from maindb.current_weather''')
    r = [dict((cur.description[i][0], value)
                for i, value in enumerate(row)) for row in cur.fetchall()]
    json_weather = jsonify({'weather' : r})
    return json_weather

@app.route('/keys')
def get_keys():
    with open('keys.json', 'r') as keys_file:
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

@app.route('/station_info')
def get_station_info():
    def run_station_query():
        cur = mysql.connect().cursor()
        sql_query = ("SELECT dt.Station_Number, st.address, dt.Available_Stands, dt.Available_Bikes, dt.Time_Entered "
        "FROM maindb.static_table as st, maindb.dynamic_table as dt "
        "WHERE dt.Station_Number=st.number ORDER BY Time_Entered DESC LIMIT 110;")
        cur.execute(sql_query)
        return cur

    def create_station_data_list(cur):
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

    cur = run_station_query()
    station_data_list = create_station_data_list(cur) 
    return jsonify({'station_info': station_data_list})

if __name__ == "__main__":
    app.run(debug=True)
