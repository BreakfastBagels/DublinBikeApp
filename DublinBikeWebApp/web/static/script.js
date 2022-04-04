// Global Calls
const weatherBoxCol = document.getElementById('weather-box-col');
postWeatherInfoToDom()

const HourBoxCol = document.getElementById('hour-box-col');
postHourInfoToDom()

const DailyBoxCol = document.getElementById('daily-box-col');
postDailyInfoToDom()

// Weather Box Code
async function getWeatherJSON() {
    const response = await fetch('/get-weather');
    const json = await response.json();
    return json
}

async function postWeatherInfoToDom() {
    const weatherJSON = await getWeatherJSON();
    const collectionArray = weatherJSON.weather;
    const lastEntry = collectionArray[collectionArray.length - 1];
    const weatherBox = drawWeatherBox(lastEntry);
    weatherBoxCol.appendChild(weatherBox);
}

function drawWeatherBox(json) {
    const weatherBox = document.createElement('div');

    let boxHeading = document.createElement('h3');
    boxHeading.textContent = "Current Weather"

    let weatherIcon = document.createElement('img')
    weatherIcon.src = `http://openweathermap.org/img/wn/${json['Picture_ID']}@2x.png`;

    let weatherDescriptionHeading = document.createElement('h4');
    weatherDescriptionHeading.textContent = capitalise(json['Current_Description']);

    let currentTempHeading = document.createElement('h4');
    // Plus sign turns string into a number
    currentTempHeading.innerHTML = `${+(json['Current_Temp']) - 273}&deg; celsius`

    let highLowHeading = document.createElement('h5');
    highLowHeading.innerHTML = `H: ${+json['Max_Temp'] - 273}&deg; L: ${+json['Min_Temp'] - 273}&deg;`

    const weatherBoxElems = [boxHeading, weatherIcon, weatherDescriptionHeading, currentTempHeading, highLowHeading]
    
    weatherBoxElems.forEach(elem => weatherBox.appendChild(elem))

    return weatherBox
}

function capitalise(str) {
    const lower = str.toLowerCase()
    return str.charAt(0).toUpperCase() + lower.slice(1)
}

//Hourly Weather Box Code
async function getHourJSON() {
    const response = await fetch('/hourly-weather');
    const json = await response.json();
    return json
}

async function postHourInfoToDom() {
    const HourJSON = await getHourJSON();
    const collectionArray = HourJSON.hourly;
    for (let i = 0; i < 7; i++) {
        const lastEntry = collectionArray[i];
        const HourBox = drawHourBox(lastEntry);
        HourBoxCol.appendChild(HourBox);
    }
}

function drawHourBox(json) {
    const HourBox = document.createElement('div.side');

    let HourHeading = document.createElement('h6');
    HourHeading.textContent = json['Hourly_Time'].slice(17);

    let HourIcon = document.createElement('img')
    HourIcon.src = `http://openweathermap.org/img/wn/${json['Hourly_Picture']}@2x.png`;

    let HourDescriptionHeading = document.createElement('h5');
    HourDescriptionHeading.textContent = capitalise(json['Hourly_Description']);

    let HourTempHeading = document.createElement('h6');
    // Plus sign turns string into a number
    HourTempHeading.innerHTML = `${+(json['Hourly_Temp']) - 273}&deg; celsius`

    let HourOTempHeading = document.createElement('h6');
    HourOTempHeading.innerHTML = `Wind: ${+json['Hourly_Wind']} mph`

    const HourBoxElems = [HourHeading, HourIcon, HourDescriptionHeading, HourTempHeading, HourOTempHeading]
    
    HourBoxElems.forEach(elem => HourBox.appendChild(elem))

    return HourBox
}

//Daily Weather Box Code

async function getDailyJSON() {
    const response = await fetch('/daily-weather');
    const json = await response.json();
    return json
}

async function postDailyInfoToDom() {
    const DailyJSON = await getDailyJSON();
    const collectionArray = DailyJSON.daily;
    for (let i = 0; i < 7; i++) {
        const lastEntry = collectionArray[i];
        const DailyBox = drawDailyBox(lastEntry);
        DailyBoxCol.appendChild(DailyBox);
    }
}

function drawDailyBox(json) {
    const DailyBox = document.createElement('div.side');

    let DailyHeading = document.createElement('h6');
    DailyHeading.textContent = json['Daily_Time'].slice(0,11)

    let DailyIcon = document.createElement('img')
    DailyIcon.src = `http://openweathermap.org/img/wn/${json['Daily_Picture']}@2x.png`;

    let DailyDescriptionHeading = document.createElement('h5');
    DailyDescriptionHeading.textContent = capitalise(json['Daily_Description']);

    let DailyTempHeading = document.createElement('h6');
    // Plus sign turns string into a number
    DailyTempHeading.innerHTML = `${+(json['Daily_Temp']) - 273}&deg; celsius`

    let DailyWind = document.createElement('h6');
    DailyWind.innerHTML = `Wind: ${+json['Daily_Wind']} mph`

    let DailyOTempHeading = document.createElement('h6');
    DailyOTempHeading.innerHTML = `H: ${+json['Daily_Max'] - 273}&deg; L: ${+json['Daily_Min'] - 273}&deg;`

    let DailySunrise = document.createElement('h6');
    DailySunrise.textContent = `Sunrise: ${json['Daily_Sunrise'].slice(17,22)}`

    let DailySunset = document.createElement('h6');
    DailySunset.textContent = `Sunset: ${json['Daily_Sunset'].slice(17,22)}`

    const DailyBoxElems = [DailyHeading, DailyIcon, DailyDescriptionHeading, DailyTempHeading, DailyOTempHeading, DailySunrise, DailySunset, DailyWind]
    
    DailyBoxElems.forEach(elem => DailyBox.appendChild(elem))

    return DailyBox
}

// Google Maps Code
async function getLiveStationJSON (stationNumber) {
    const response = await fetch('/station_info');
    const json = await response.json();
    const stationInfoArr = json["station_info"]
    for (let i = 0; i < stationInfoArr.length; i++) {
        if (stationInfoArr[i]["Station_Number"] == stationNumber) return stationInfoArr[i]
    }
}

function getInfoWindowContent(stationJSON) {
    const cleanedStationName = stationJSON['address'].replace(/\"/g, "");
    const stationCapacity = stationJSON['Available_Stands'] + stationJSON['Available_Bikes'];
    return [
        `Station Name: ${cleanedStationName}`, 
        `Station Number: ${stationJSON['Station_Number']}`,
        `Available Stands: ${stationJSON['Available_Stands']}`, 
        `Available Bikes: ${stationJSON['Available_Bikes']}`,
        `Station Capacity: ${stationCapacity}`,
        `Last Updated: ${stationJSON['Time_Entered']}`,  
    ].join("<br>");
}

fetch("/keys")
    .then(function(resp) {
        return resp.json();
    })
    .then(function(data) {
        let mapkey = data['mapsApi'];
        var script = document.createElement('script');
        var api_url = 'https://maps.googleapis.com/maps/api/js?key='+mapkey+'&callback=initMap';
        script.src = api_url;
        script.async = true;

        window.initMap = function() {
            let map;

            map = new google.maps.Map(document.getElementById("map"), {
                center: { lat:53.34228, lng:-6.27455},
                zoom: 14,
                styles: [
                {featureType: "administrative",
                elementType: "all",
                stylers: [{visibility: "off"}],},
                {featureType: "poi.government",
                elementType: "all",
                stylers: [{visibility: "off"}],},
                {featureType: "poi.medical",
                elementType: "all",
                stylers: [{visibility: "off"}],},
                {featureType: "poi.school",
                elementType: "all",
                stylers: [{visibility: "off"}],},
                {featureType: "poi.place_of_worship",
                elementType: "all",
                stylers: [{visibility: "off"}],},
                {featureType: "poi.sports_complex",
                elementType: "all",
                stylers: [{visibility: "off"}],},
                ]
                });

            fetch("/static_stations")
            .then(function(resp) {
                return resp.json();
            })
            .then(function(data) {
                for (let i = 0; i < data['stations'].length; i++) {
                    const station_position = {'latitude':data['stations'][i]['latitude'],
                    'longitude':data['stations'][i]['longitude']}
                    const marker = new google.maps.Marker({
                        position: {lat: parseFloat(station_position['latitude']),
                        lng: parseFloat(station_position['longitude'])},
                        map: map,
                        title: data['stations'][i]['name'],
                    });
                    const stationNumber =  data['stations'][i]['number'];
                    marker.addListener("click", async () => {
                        const liveStationJSON = await getLiveStationJSON(stationNumber)
                        const infoWindowContent = getInfoWindowContent(liveStationJSON);
                        const infoWindow = new google.maps.InfoWindow({
                            content: infoWindowContent,
                        })
                        infoWindow.open({
                            anchor: marker,
                            map,
                            shouldFocus: false,
                        })
                    })                                                
                    marker.setMap(map);
                }
            });
        };

        document.head.appendChild(script);
    })