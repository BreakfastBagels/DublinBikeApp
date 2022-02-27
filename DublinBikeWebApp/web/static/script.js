const requestButtons = [...document.getElementsByClassName('request-button')];

requestButtons.forEach((button) => {
    button.addEventListener('click', async () => {
        const response = await fetch(`/station/${button.id}`);
        const json = await response.json()
        console.log(json)
    })
})