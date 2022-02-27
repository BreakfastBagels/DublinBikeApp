const requestButtons = [...document.getElementsByClassName('request-button')];

requestButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const stationJSON = await getJSON(button.id)
        console.log(stationJSON)
    })
})

async function getJSON(id) {
    const response = await fetch(`/station/${id}`);
    const json = await response.json();
    return json
}