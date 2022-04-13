// Global Vaars
var stationInfoArray = [];
var stationMarkerCoordinates = [];
var stationMarkers = [];
var directionsService;
var directionsRenderer;
var distanceService;
var marker;
var userMarker;
let map;

// Constant values for map bounds
const DUBLIN_BOUNDS = {
    north: 53.383584,
    south: 53.30752,
    east: -6.203132,
    west: -6.348253,
    };

// Uninitialised geocoding service object
let geocoder;

// Global fns
storeLiveStationInfo()
appendMapsScriptToPage()

// Google Maps Code

// Function that gets current information for a given station from locally sourced station information
function getLiveStationJSON (stationNumber) {
    const stationInfoArr = JSON.parse(localStorage.getItem('station_info'))
    for (let i = 0; i < stationInfoArr.length; i++) {
        if (stationInfoArr[i]["Station_Number"] == stationNumber) return stationInfoArr[i]
    }
}

// Function that runs fetch request on flask app API to get current station information store
// the result locally for later use
async function storeLiveStationInfo() {
    const response = await fetch('/station_info');
    const json = await response.json();
    const stationInfoArr = json["station_info"]
    localStorage.setItem('station_info', JSON.stringify(stationInfoArr));
}

// Function that takes input station JSON information and formats it for display on map
// marker click event
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

// Function that calculates current bike availability to determine the correct bagel icon
// for display
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

// Function that appends the Map script to the web page
function appendMapsScriptToPage() {
    let script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAn2fKpMTzQRBw-YNEf-FrmJtztXVkLt_8&callback=initMap';
    script.async = true;

    // Function that initialises map on page as well as service API objects for later use
    window.initMap = function() {
        directionsService = new google.maps.DirectionsService();
        directionsRenderer = new google.maps.DirectionsRenderer({
            suppressBicyclingLayer: true});
        distanceService = new google.maps.DistanceMatrixService();
        geocoder = new google.maps.Geocoder();

        // Center map on Dublin using the predesignated map bounds
        map = new google.maps.Map(document.getElementById("map"), {
            center: { lat:53.34228, lng:-6.27455},
            restriction: {
                latLngBounds: DUBLIN_BOUNDS,
                strictBounds: false,
            },
            // Remove some icons from display to improve UI of Map with additional bike station markers
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
        // Designate map part of page as the area where direction routes should be rendered
        directionsRenderer.setMap(map);
        directionsRenderer.setPanel(document.getElementById('directions'));
        // Function that places marker on page
        initAllMarkers();

    };

    document.head.appendChild(script);
}

// Function that initialises station markers
function initAllMarkers() {

    // Initialises empty arrays for different parts of station information
    stationMarkers = [];
    stationInfoArray = [];
    stationMarkerCoordinates = [];

    // Run fetch request on static information to begin populating markers
    fetch("/static_stations")
        .then(function(resp) {
            return resp.json();
        })
        // Async callback fills empty arrays and creates markers
        .then(async function(data) {
            for (var i = 0; i < data['stations'].length; i++) {
                fillStationInfoArray(stationInfoArray, data['stations'][i]);

                // Create variables for station position geographically
                const station_position = {
                    'latitude':data['stations'][i]['latitude'],
                    'longitude':data['stations'][i]['longitude']}

                // Calculate the appropriate marker icon for display
                station_availability = calc_availability(data['stations'][i]);

                // Create bike station marker with constants for position, the map
                // as the created map on page, title for information on hover and the icon
                // with the correct associated bagel marker
                const marker = new google.maps.Marker({
                    position: {lat: parseFloat(station_position['latitude']),
                    lng: parseFloat(station_position['longitude'])},
                    map: map,
                    title: data['stations'][i]['name'],
                    icon: "/Bagel_Icon/" + station_availability
                });

                const stationNumber =  data['stations'][i]['number'];

                // Create event listener for generating information window to user on click
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

                // Fill additional marker information arrays for later use
                fillStationCoordinatesArray(stationMarkerCoordinates, station_position);
                fillStationMarkersArray(stationMarkers, marker);
            }
            createMarkerRouteOptions();
        });
    }

// Function that fills array with station coordinates
function fillStationCoordinatesArray(infoArray, coordinates) {
    if(infoArray.length < 110) {
        infoArray.push(coordinates);
    }
}

// Function that fills array with marker objects
function fillStationMarkersArray(markersArray, marker) {
    if(markersArray.length < 110) {
        markersArray.push(marker);
    }
}

// Function that fills stationInfo array with associated data for a given station
function fillStationInfoArray(infoArray, data) {
    if (infoArray.length < 110) {
        infoArray.push(data);
    }
}

// Function that renders markers invisible when routes are generated on the map
function hideNonRouteMarkers() {
    for (var i = 0; i < stationMarkers.length; i++) {
            stationMarkers[i].setMap(null);
    }
}

// Function that uses directions service to create a bike route from one station to another
function createBikeRoute() {

    // Take in values from html as strings and format to match addresses
    var startString = document.getElementById('start').value;
    var endString = document.getElementById('end').value;
    var startArray = startString.split(",");
    var endArray = endString.split(",");

    // Create request object to hold directions request information
    var request = {
        origin: {lat: parseFloat(startArray[0]), lng: parseFloat(startArray[1])},
        destination: {lat: parseFloat(endArray[0]), lng: parseFloat(endArray[1])},
        travelMode: 'BICYCLING',
    };

    // Callback function renders route and step-by-step directions if the status is returned as
    // OK from the Google API
    directionsService.route(request, function(result, status) {
        if (status == 'OK') {
            directionsRenderer.setMap(map);
            directionsRenderer.setDirections(result);
        }
    });

    // Station markers are hidden to improve route visibility
    hideNonRouteMarkers();
}

// Function that removes route from map and step-by-step directions
function hideRoute() {
    directionsRenderer.setMap(null);
    document.getElementById('directions').innerHTML = "";
}

// Function that fills dropdown menus with options for generating routes
function createMarkerRouteOptions() {

    // Start by creating strings from station addresses, removing commas and putting
    // resulting strings in an array to be sorted alphabetically
    var stationMarkersString = "";
    var stationNames = [];
    for (var i = 0; i < stationInfoArray.length; i++) {
        var thisName = stationInfoArray[i]['address'];
        var stationName = thisName.replace(/\"/g, "");
        stationNames.push(stationName);
    }
    stationNames.sort();

    // Iterate through the modified station names and create html for each that contains
    // the position value of the marker to pass through for creating the route
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

    // Add plain text to html for display on page
    document.getElementById('start').innerHTML += stationMarkersString;
    document.getElementById('end').innerHTML += stationMarkersString;
}


/* Nearest map marker distance functionality removed from active code but retained here
*  for use in future releases of application
*/


//function find_station() {
//    var search_val = document.getElementById('find_station').value;
//    geocoder.geocode( {'address': search_val}, function(results, status) {
//        if(status == "OK") {
//            userMarker = new google.maps.Marker({
//                map: map,
//                position: results[0].geometry.location,
//                icon: {url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png"},
//            });
//            map.panTo(results[0].geometry.location);
//            nearestStation(userMarker.position);
//        }
//    });
//    document.getElementById('find_station_reset').disabled = false;
//    document.getElementById('find_station_search').disabled = true;
//}
//
//function removeUserMarker() {
//    userMarker.setMap(null);
//    document.getElementById('find_station_search').disabled = false;
//    document.getElementById('find_station_reset').disabled = true;
//}

//function nearestStation(origin) {
//
//    console.log("Origin station:");
//    console.log(origin, typeof(origin));
//    var destinationArray1 = [];
//    var destinationArray2 = [];
//    var destinationArray3 = [];
//    var destinationArray4 = [];
//    var destinationArray5 = [];
//    var minDistance;
//    var nearestStation;
//
//    for (var i = 0; i < stationMarkers.length; i++) {
//        if (i < 25) {
//            destinationArray1.push(stationMarkers[i].position);
//        }
//        else if (i < 50) {
//            destinationArray2.push(stationMarkers[i].position);
//        }
//        else if (i < 75) {
//            destinationArray3.push(stationMarkers[i].position);
//        }
//        else if (i < 100) {
//            destinationArray4.push(stationMarkers[i].position);
//        }
//        else {
//            destinationArray5.push(stationMarkers[i].position);
//        }
//    }
//
//    distanceService.getDistanceMatrix({
//        origins: [origin],
//        destinations: destinationArray1,
//        travelMode: 'WALKING'}, function(response, status) {
//            if (status == 'OK') {
//            minDistance = response.rows[0].elements[0].distance.value;
//
//            console.log("Initial Nearest Station:");
//            nearestStation = stationMarkers[0].position;
//            for (var i = 1; i < response.rows[0].elements.length; i++) {
//                if (response.rows[0].elements[i].distance.value < minDistance) {
//                    minDistance = response.rows[0].elements[i].distance.value;
//                    nearestStation = stationMarkers[i].position;
//                }
//            }
//
//
//            var request = {
//                origin: origin,
//                destination: nearestStation,
//                travelMode: 'WALKING',
//            };
//            directionsService.route(request, function(result, status) {
//                if (status == 'OK') {
//                    directionsRenderer.setMap(map);
//                    directionsRenderer.setDirections(result);
//                }
//            });
//            hideNonRouteMarkers();
//
//            }
//        });
//
//
//}
// Distance functions to be saved for later releases


//function getDistance(originArray, destinationArray) {
//
//
//    console.log("getDistance function called");
//    console.log(originArray);
//    console.log(destinationArray);
//
//
//    distanceService.getDistanceMatrix({
//        origins: originArray,
//        destinations: destinationArray,
//        travelMode: 'WALKING', function(response, status) {
//            console.log(status);
//            if (status == 'OK') {
//                var distanceOutput = response.rows[0].elements[0].distance.value;
//                var stationOutput = 0;
//
//                for (var i = 1; i < response.rows[0].elements.length; i++) {
//                if (response.rows[0].elements[i].distance.value < distanceOutput) {
//                    distanceOutput = response.rows[0].elements[i].distance.value;
//                    stationOutput = i;
//                    }
//                }
//            }
//
//            console.log(distanceOutput);
//            console.log(stationOutput);
//        }
//    });
//
////    console.log("Distance output is now: " + distanceOutput);
////    console.log("Station index is now: " + stationOutput);
//
//    var output = [distanceOutput, stationOutput];
//    return output
//}

//        function distanceCallback(response, status) {
//            if (status == 'OK') {
//            minDistance = response.rows[0].elements[0].distance.value;
//
//            console.log("Initial Nearest Station:");
//            nearestStation = stationMarkers[0].position;
//            for (var i = 1; i < response.rows[0].elements.length; i++) {
//                if (response.rows[0].elements[i].distance.value < minDistance) {
//                    minDistance = response.rows[0].elements[i].distance.value;
//                    nearestStation = stationMarkers[i].position;
//                }
//            }
//
//            if (minDistance < 500) {
//                var request = {
//                    origin: origin,
//                    destination: nearestStation,
//                    travelMode: 'WALKING',
//                };
//                directionsService.route(request, function(result, status) {
//                    if (status == 'OK') {
//                        directionsRenderer.setMap(map);
//                        directionsRenderer.setDirections(result);
//                    }
//                });
//                hideNonRouteMarkers();
//                    }
//            }
//        }
