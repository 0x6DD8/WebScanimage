document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('scan-form');
    const imgContainer =  document.getElementById('image-container');
    let num = 1;
    const templateNode = document.getElementsByClassName('template')[0];

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
            let clonedTemplate = templateNode.cloneNode(true);
            

            clonedTemplate.classList.remove('template');

            imgEl.src = `/scans/${parsedData.fileName}.${parsedData.fileFormat}`;
            imgEl.setAttribute('data-num', num);
            
            
            imgContainer.appendChild(imgEl);
            imgContainer.appendChild(clonedTemplate);
            clonedTemplate.setAttribute('data-num', num);
            let downloadButt = clonedTemplate.getElementsByClassName('download');
            downloadButt[0].setAttribute('href', `/scans/${parsedData.fileName}.${parsedData.fileFormat}`);
            downloadButt[0].setAttribute('download', `${parsedData.fileName}.${parsedData.fileFormat}`)

            let button = clonedTemplate.getElementsByClassName('button');
            
            let currentNum = num;
            button[0].addEventListener('click', (e) => {
                console.log('aa')
                
                console.log(document.querySelectorAll(`[data-num="${currentNum}"]`), num);
                document.querySelectorAll(`[data-num="${currentNum}"]`).forEach((el) => {
                    console.log(el);
                    el.remove();
                });
            });

            scanbutton.removeAttribute('disabled');
            loadingscreen.style.visibility = 'hidden';
            num = num + 1;
            clonedTemplate.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        })
        .catch(error => console.log('error', error));

    });
})