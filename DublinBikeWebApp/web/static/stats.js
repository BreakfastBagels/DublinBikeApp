// Global calls
fillStationsOptions();
fillHourOptions()

// Global values
const statsFormButton = document.getElementById('stats-form-button');

// Event listener added to button on stats page for generating predictions
statsFormButton.addEventListener('click', e => {
    e.preventDefault();
    const stationSelected = document.getElementById('station-name-options').value;
    const timeframeSelected = document.getElementById('timeframe-options').value;
    showStationPrediction(stationSelected, timeframeSelected);
})

// Function to create the station options to fill the element for dropdown options
// for generating predictions
function fillStationsOptions() {
    const stationNameSelect = document.getElementById('station-name-options');

    // Fetch request for static station information provides information for filling out
    // html elements
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

// Function to create hour selection options for dropdown menu
function fillHourOptions() {
    function getTransformedHour(hour) {
        let transformedHour;
        if (hour >= 0 && hour < 12) {
            transformedHour = `${hour}am`;
        }
        else if (hour == 12) {
            transformedHour = `${hour}pm`;
        }
        else if (hour >= 12 && hour < 24) {
            hour -= 12;
            transformedHour = `${hour}pm`;
        }
        return transformedHour
    }
    const hoursSelect = document.getElementById('hours-options');
    for (let i = 0; i <= 23; i++) {
        let optionElem = document.createElement('option');
        optionElem.textContent = getTransformedHour(i);
        optionElem.value = i;
        hoursSelect.appendChild(optionElem);
    }
}

// Function that generates bike availability prediction for a given station at a given time
function showStationPrediction(station, timeframe) {
    const requestString = `model/${station}/${timeframe}`;

    // Fetch request on flask API to find correct model pickle file for generating availability
    // prediction for a given time
    fetch(requestString)
    .then(response => response.json())
    .then(data => {
        // Prepping values for card
        let predictionCardCol = document.getElementById('prediction-card-col');
        const selectedHour = document.getElementById('hours-options').value;
        const predictionValue = Math.round(data[selectedHour]);
        const stationsOptions = document.getElementById('station-name-options').options;
        const hoursOptions = document.getElementById('hours-options').options;
        let stationName;
        let hourText;
        for (let i = 0; i < stationsOptions.length; i++) {
            if (stationsOptions[i].value === station) stationName = stationsOptions[i].textContent;
        }

        for (let i = 0; i < hoursOptions.length; i++) {
            if (hoursOptions[i].value === selectedHour) hourText = hoursOptions[i].textContent;
        }
        //Generating card + appending
        const predictionCard = getAvailabilityCard(hourText, stationName, predictionValue, timeframe);
        const cardColChildren = predictionCardCol.childNodes;
        const lastNode = cardColChildren[cardColChildren.length - 1]
        if (lastNode.className === 'card') predictionCardCol.removeChild(lastNode);
        predictionCardCol.appendChild(predictionCard);
    })
}

// Function that dynamically creates element and bootstrap styling classes
// for bootstrap card displaying availability prediction
function getAvailabilityCard(selectedHour, stationName, predictionValue, timeframe) {
    let headerDiv = document.createElement('div');
    headerDiv.classList.add('card-header', 'bg-info', 'text-light');
    headerDiv.textContent = `${stationName} [${selectedHour} – W${timeframe.slice(1,)}]`;

    let subtitleDiv = document.createElement('div');
    subtitleDiv.classList.add('card-subtitle', 'text-muted', 'mb-2');
    subtitleDiv.textContent = `Predicted Bikes Available`;

    let textDiv = document.createElement('div');
    textDiv.classList.add('card-text', 'display-4', 'text-center');
    textDiv.textContent = `${predictionValue}`;

    let bodyDiv = document.createElement('div');
    bodyDiv.classList.add('card-body');
    [subtitleDiv, textDiv].forEach(div => bodyDiv.appendChild(div));

    let cardDiv = document.createElement('div');
    cardDiv.classList.add('card');
    cardDiv.appendChild(headerDiv);
    cardDiv.appendChild(bodyDiv);

    return cardDiv
}
