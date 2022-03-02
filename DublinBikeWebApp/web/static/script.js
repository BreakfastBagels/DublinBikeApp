const requestButtons = [...document.getElementsByClassName('request-button')];
const weatherBoxCol = document.getElementById('weather-box-col');

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