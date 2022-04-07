// Global calls
fillStationsOptions();
fillHourOptions()

// Global values
const statsFormButton = document.getElementById('stats-form-button');

statsFormButton.addEventListener('click', e => {
    e.preventDefault();
    const stationSelected = document.getElementById('station-name-options').value;
    const timeframeSelected = document.getElementById('timeframe-options').value;
    showStationPrediction(stationSelected, timeframeSelected);
})

function fillStationsOptions() {
    const stationNameSelect = document.getElementById('station-name-options');
    fetch('/static_stations')
    .then(response => response.json())
    .then(data => {
        data.stations.forEach(station => {
            let optionElem = document.createElement('option');
            optionElem.textContent = station['address'].replace(/"/g, "");
            optionElem.value = station['number'];
            stationNameSelect.appendChild(optionElem);
        })
    })
}

function fillHourOptions() {
    const hoursSelect = document.getElementById('hours-options');
    for (let i = 0; i <= 23; i++) {
        let optionElem = document.createElement('option');
        optionElem.textContent = i;
        optionElem.value = i;
        hoursSelect.appendChild(optionElem);
    }
}

function showStationPrediction(station, timeframe) {
    let predictionHeader = document.getElementById('prediction-output');
    const selectedHour = document.getElementById('hours-options').value;
    const requestString = `model/${station}/${timeframe}`;
    fetch(requestString)
    .then(response => response.json())
    .then(data => {
        const predictionValue = data[selectedHour];
        predictionHeader.textContent = Math.round(predictionValue);
    })
}