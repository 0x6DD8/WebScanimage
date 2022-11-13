document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('scan-form');
    const imgContainer =  document.getElementById('image-container');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = document.getElementById("fileformats");
        const scanquality = document.getElementById("scanquality");
        const scanbutton = document.getElementById('scanbutton');
        const loadingscreen = document.getElementById('loadingscreen');

        const data = {
            "format": select.value,
            "resolution": scanquality.value
        }
        loadingscreen.style.visibility = 'visible'
        scanbutton.setAttribute("disabled", "");
        
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
            scanbutton.removeAttribute('disabled');
            loadingscreen.style.visibility = 'hidden';
        })
        .catch(error => console.log('error', error));

    });
})