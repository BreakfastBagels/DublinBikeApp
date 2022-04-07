//Nothing here yet

// Global Vaars
const weatherBoxCol = document.getElementById('weather-box-col');
const stationInfoArray = [];
const stationMarkerCoordinates = [];
const stationMarkers = [];
var directionsService;
var directionsRenderer;
var marker;
var userMarker;
let map;

const DUBLIN_BOUNDS = {
    north: 53.383584,
    south: 53.30752,
    east: -6.203132,
    west: -6.348253,
    };
let geocoder;

// Global fns
postWeatherInfoToDom()
storeLiveStationInfo()
appendMapsScriptToPage()

const HourBoxCol = document.getElementById('hour-box-col');
postHourInfoToDom()

const DailyBoxCol = document.getElementById('daily-box-col');
postDailyInfoToDom()

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
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            suppressBicyclingLayer: true});


        geocoder = new google.maps.Geocoder();
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat:53.34228, lng:-6.27455},
            restriction: {
                latLngBounds: DUBLIN_BOUNDS,
                strictBounds: false,
            },
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
        directionsRenderer.setPanel(document.getElementById('directions'));
        initAllMarkers();

    };

    document.head.appendChild(script);
}

function initAllMarkers() {
    fetch("/static_stations")
        .then(function(resp) {
            return resp.json();
        })
        .then(async function(data) {
            for (var i = 0; i < data['stations'].length; i++) {
                fillStationInfoArray(stationInfoArray, data['stations'][i]);

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

                const stationNumber =  data['stations'][i]['number'];

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
                fillStationCoordinatesArray(stationMarkerCoordinates, station_position);
                stationMarkers.push(marker);
            }
            createMarkerRouteOptions();
        });
    }

function fillStationCoordinatesArray(infoArray, coordinates) {
    if(infoArray.length < 110) {
        infoArray.push(coordinates);
    }
}

function fillStationMarkersArray(markersArray, marker) {
    if(markersArray.length < 110) {
        markersArray.push(marker);
    }
}

function fillStationInfoArray(infoArray, data) {
    if (infoArray.length < 110) {
        infoArray.push(data);
    }
}

function hideNonRouteMarkers(markerA, markerB) {
    for (var i = 0; i < stationMarkers.length; i++) {
        if (stationMarkers[i] != markerA || stationMarkers[i] != markerB)
            stationMarkers[i].setMap(null);
    }
}

function createRoute() {
    var startString = document.getElementById('start').value;
    var endString = document.getElementById('end').value;
    var startArray = startString.split(",");
    var endArray = endString.split(",");
    var request = {
        origin: {lat: parseFloat(startArray[0]), lng: parseFloat(startArray[1])},
        destination: {lat: parseFloat(endArray[0]), lng: parseFloat(endArray[1])},
        travelMode: 'BICYCLING',
    };
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(result);
        }
    });
    hideNonRouteMarkers();
}

function hideRoute() {
    directionsRenderer.setMap(null);
    document.getElementById('directions').innerHTML = "";
}

function createMarkerRouteOptions() {
    var stationMarkersString = "";
    var stationNames = [];
    for (var i = 0; i < stationInfoArray.length; i++) {
        var thisName = stationInfoArray[i]['address'];
        var stationName = thisName.replace(/\"/g, "");
        stationNames.push(stationName);
    }
    stationNames.sort();

    for (var i = 0; i < stationNames.length; i++) {
        for (var j = 0; j < stationInfoArray.length; j++) {
            if (stationInfoArray[j]['address'] == '"' + stationNames[i] + '"') {
                var stationAddress = stationNames[i];
                var stationLat = stationInfoArray[j]['latitude'];
                var stationLng = stationInfoArray[j]['longitude'];
                stationMarkersString += "<option value = " +  parseFloat(stationLat) +
                    "," + parseFloat(stationLng) + ">" + stationAddress + "</li>";
            }
        }
    };
    document.getElementById('start').innerHTML += stationMarkersString;
    document.getElementById('end').innerHTML += stationMarkersString;
}

function find_station() {
    var search_val = document.getElementById('find_station').value;
    geocoder.geocode( {'address': search_val}, function(results, status) {
        if(status == "OK") {
            console.log(results[0]);
            userMarker = new google.maps.Marker({
                map: map,
                position: results[0].geometry.location,
                icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"},
            });
            map.panTo(results[0].geometry.location);
        }
    });
    document.getElementById('find_station_reset').disabled = false;
    document.getElementById('find_station_search').disabled = true;
}

function removeUserMarker() {
    userMarker.setMap(null);
    document.getElementById('find_station_search').disabled = false;
    document.getElementById('find_station_reset').disabled = true;
}