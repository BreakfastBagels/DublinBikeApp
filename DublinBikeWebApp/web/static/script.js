const requestButtons = [...document.getElementsByClassName('request-button')];

requestButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const stationJSON = await getJSON(button.id)
        const stationTable = createStationTable(stationJSON);
        insertTableToDom(stationTable);
    })
})

async function getJSON(id) {
    const response = await fetch(`/station/${id}`);
    const json = await response.json();
    return json
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

function insertTableToDom(table) {
    const infoDiv = document.getElementById('info-div');
    if (infoDiv.hasChildNodes()) {
        const existingNode = infoDiv.firstChild;
        infoDiv.removeChild(existingNode);
    }
    infoDiv.appendChild(table);
}