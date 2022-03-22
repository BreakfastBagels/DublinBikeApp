const requestButtons = [...document.getElementsByClassName('request-button')];
const weatherBoxCol = document.getElementById('weather-box-col');
var directionsService;
var directionsRenderer;

requestButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const stationJSON = await getStationJSON(button.id)
        const stationTable = createStationTable(stationJSON);
        insertStationTableToDom(stationTable);
    })
})

postWeatherInfoToDom()

async function getStationJSON(id) {
    const response = await fetch(`/station/${id}`);
    const json = await response.json();
    return json
}

async function getWeatherJSON() {
    const response = await fetch('/get-weather');
    const json = await response.json();
    return json
}

async function postWeatherInfoToDom() {
    const weatherJSON = await getWeatherJSON();
    const collectionArray = weatherJSON.myCollection;
    const lastEntry = collectionArray[collectionArray.length - 1];
    const weatherBox = drawWeatherBox(lastEntry);
    weatherBoxCol.appendChild(weatherBox);
}

function createStationTable(json) {
    const table = document.createElement('table');
    const attributeNames = [ 'Station Number', 'Station Name', 'Station Address', 'Latitude', 'Longitude']
    const attributeKeys = ['number', 'name', 'address', 'latitude', 'longitude']
    for (let i = 0; i < attributeNames.length; i++) {
        let row = document.createElement('tr');
        let rowAttributeCell = document.createElement('td');
        rowAttributeCell.textContent = attributeNames[i];
        row.appendChild(rowAttributeCell);
        let rowInfoCell = document.createElement('td');
        rowInfoCell.textContent = json[attributeKeys[i]];
        row.appendChild(rowInfoCell)
        table.appendChild(row)
    }
    return table
}

function insertStationTableToDom(table) {
    const infoDiv = document.getElementById('info-div');
    if (infoDiv.hasChildNodes()) {
        const existingNode = infoDiv.firstChild;
        infoDiv.removeChild(existingNode);
    }
    infoDiv.appendChild(table);
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
            directionsService = new google.maps.DirectionsService();
            directionsRenderer = new google.maps.DirectionsRenderer();
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

            directionsRenderer.setMap(map);

            fetch("/static_stations")
            .then(function(resp) {
                return resp.json();
            })
            .then(function(data) {
//                console.log(parseFloat(data['stations'][0]['latitude']), typeof(parseFloat(data['stations'][0]['latitude'])));
                for (var i = 0; i < data['stations'].length; i++) {
                    var station_position = {'latitude':data['stations'][i]['latitude'],
                    'longitude':data['stations'][i]['longitude']}
//                    console.log(station_position['latitude'], station_position['longitude']);
                    var marker = new google.maps.Marker({
                        position: {lat: parseFloat(station_position['latitude']),
                        lng: parseFloat(station_position['longitude'])},
                        map: map,
                        title: data['stations'][i]['name'],
                    });
//
//                    marker.setMap(map);
                    }
                });

        };

        document.head.appendChild(script);

//        function createRoute() {
//            var start = document.getElementById('start').value;
//            var end = document.getElementById('end').value;
//            var request = {
//                origin: start,
//                destination: end,
//                travelMode: 'BICYCLING',
//            };
//            directionsService.route(request, function(result, status) {
//                if (status == 'OK') {
//                    directionsRenderer.setDirections(result);
//                }
//            });
//        }
    })

function createRoute() {
    var startString = document.getElementById('start').value;
    var endString = document.getElementById('end').value;
    console.log(startString, typeof(start));
    console.log(endString, typeof(end));
    var startArray = startString.split(",");
    var endArray = endString.split(",");
    var request = {
        origin: {lat: parseFloat(startArray[0]), lng: parseFloat(startArray[1])},
        destination: {lat: parseFloat(endArray[0]), lng: parseFloat(endArray[1])},
        travelMode: 'BICYCLING',
    };
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setDirections(result);
             }
            });
        }


