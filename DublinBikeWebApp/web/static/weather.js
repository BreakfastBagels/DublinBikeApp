//weather js

// Global Vaars/fns
const weatherBoxCol = document.getElementById('weather-box-col');
postWeatherInfoToDom()

const HourBoxCol = document.getElementById('hour-box-col');
postHourInfoToDom()

const DailyBoxCol = document.getElementById('daily-box-col');
postDailyInfoToDom()

// Weather Box Code

// Function to make API call for getting weather information from database and
// returning JSON representation
async function getWeatherJSON() {
    const response = await fetch('/get-weather');
    const json = await response.json();
    return json
}

// Function to place weather information within HTML document
async function postWeatherInfoToDom() {
    const weatherJSON = await getWeatherJSON();
    const collectionArray = weatherJSON.weather;
    const lastEntry = collectionArray[collectionArray.length - 1];
    const weatherBox = drawWeatherBox(lastEntry);
    weatherBoxCol.appendChild(weatherBox);
}

// Function to dynamically create the html element for displaying weather information
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

// Function for manipulating string
function capitalise(str) {
    const lower = str.toLowerCase()
    return str.charAt(0).toUpperCase() + lower.slice(1)
}

//Hourly Weather Box Code

// Function that makes API call to flask API for hourly weather and returns
// response as JSON object
async function getHourJSON() {
    const response = await fetch('/hourly-weather');
    const json = await response.json();
    return json
}

// Function to place the array of hourly information boxes on page
async function postHourInfoToDom() {
    const HourJSON = await getHourJSON();
    const collectionArray = HourJSON.hourly;
    for (let i = 0; i < 7; i++) {
        const lastEntry = collectionArray[i];
        const HourBox = drawHourBox(lastEntry);
        HourBoxCol.appendChild(HourBox);
    }
}

// Function for drawing html box for information on hourly weather with the provided json
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

// Function that makes API call to get daily weather information from the flask API and
// return a JSON object representation
async function getDailyJSON() {
    const response = await fetch('/daily-weather');
    const json = await response.json();
    return json
}

// Function that posts array of daily information to html page
async function postDailyInfoToDom() {
    const DailyJSON = await getDailyJSON();
    const collectionArray = DailyJSON.daily;
    for (let i = 0; i < 7; i++) {
        const lastEntry = collectionArray[i];
        const DailyBox = drawDailyBox(lastEntry);
        DailyBoxCol.appendChild(DailyBox);
    }
}

// Function to draw box with daily weather information using passed in JSON
// and create appropriate html element for the page
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
