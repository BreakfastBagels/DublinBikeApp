// Global Vaars
const weatherBoxCol = document.getElementById('weather-box-col');

// Global fns
postWeatherInfoToDom()
storeLiveStationInfo()
appendMapsScriptToPage()

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

// Google Maps Code
function getLiveStationJSON (stationNumber) {
    const stationInfoArr = JSON.parse(localStorage.getItem('station_info'))
    for (let i = 0; i < stationInfoArr.length; i++) {
        if (stationInfoArr[i]["Station_Number"] == stationNumber) return stationInfoArr[i]
    }
}

async function storeLiveStationInfo() {
    const response = await fetch('/station_info');
    const json = await response.json();
    const stationInfoArr = json["station_info"]
    localStorage.setItem('station_info', JSON.stringify(stationInfoArr));
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

function calc_availability(data) {
    const currentStationInfo = getLiveStationJSON(data['number']);
    const stationCapacity = currentStationInfo['Available_Stands'] + currentStationInfo['Available_Bikes'];
    if (stationCapacity == currentStationInfo['Available_Bikes']) {
        return "Full";
    } else if (currentStationInfo['Available_Bikes'] == 0) {
        return "Empty"
    } else if (((currentStationInfo['Available_Bikes']/stationCapacity)*100) < 50){
        return "Semi_Empty"
    } else {
        return "Semi_Full"}
    }

function appendMapsScriptToPage() {
    let script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAn2fKpMTzQRBw-YNEf-FrmJtztXVkLt_8&callback=initMap';
    script.async = true;

    window.initMap = function() {
        let map = new google.maps.Map(document.getElementById("map"), {
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
        .then(async function(data) {
            for (let i = 0; i < data['stations'].length; i++) {
                const station_position = {
                    'latitude':data['stations'][i]['latitude'],
                    'longitude':data['stations'][i]['longitude']}
                
                station_availability = calc_availability(data['stations'][i]);
                
                const marker = new google.maps.Marker({
                    position: {lat: parseFloat(station_position['latitude']),
                    lng: parseFloat(station_position['longitude'])},
                    map: map,
                    title: data['stations'][i]['name'],
                    icon: "/Bagel_Icon/" + station_availability
                });
                
                const stationNumber = data['stations'][i]['number'];
                
                marker.addListener("click", () => {
                    const liveStationJSON = getLiveStationJSON(stationNumber)
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
}