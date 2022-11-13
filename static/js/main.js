document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('scan-form');
    const imgContainer =  document.getElementById('image-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = document.getElementById("fileformats");
        const scanquality = document.getElementById("scanquality");

        const data = {
            "format": select.value,
            "resolution": scanquality.value
        }

        await fetch('/api/scanimage', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        }).then(response => response.text())
        .then(result => {
            const parsedData = JSON.parse(result);
            console.log(parsedData);
            let imgEl = document.createElement('img');
            imgEl.src = `/scans/${parsedData.fileName}.${parsedData.fileFormat}`;
            imgContainer.appendChild(imgEl);
        })
        .catch(error => console.log('error', error));

    });
})