const button = document.getElementById('get-button');

button.addEventListener('click', getJSON);

async function getJSON() {
    const response = await fetch('/station');
    const json = await response.json()
    console.log(json)
}