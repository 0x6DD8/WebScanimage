document.addEventListener("DOMContentLoaded", () => {
    loadBuildVer();

    const form = document.getElementById('scan-form');
    const imgContainer =  document.getElementById('image-container');
    let num = 1;
    const templateNode = document.getElementsByClassName('template')[0];

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const select = document.getElementById("fileformats");
        const scanquality = document.getElementById("scanquality");
        const scanbutton = document.getElementById('scanbutton');
        const printbutton = document.getElementById('printimage');
        const loadingscreen = document.getElementById('loadingscreen');


        const data = {
            "format": select.value,
            "resolution": scanquality.value
        }
        loadingscreen.style.visibility = 'visible'
        scanbutton.setAttribute("disabled", "");
        printbutton.setAttribute("disabled", "");

        await fetch('./api/scanimage', {
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
            const imgPath =`./scans/${parsedData.fileName}.${parsedData.fileFormat}`;

            clonedTemplate.classList.remove('template');

            imgEl.src = imgPath;
            imgEl.setAttribute('data-num', num);
            
            
            if (e.submitter.id == "printimage") {
                printImage(parsedData.fileName, parsedData.fileFormat);
            }

            imgContainer.appendChild(imgEl);
            imgContainer.appendChild(clonedTemplate);
            clonedTemplate.setAttribute('data-num', num);
            let downloadButt = clonedTemplate.getElementsByClassName('download');
            downloadButt[0].setAttribute('href', imgPath);
            downloadButt[0].setAttribute('download', `${parsedData.fileName}.${parsedData.fileFormat}`)

            let button = clonedTemplate.getElementsByClassName('button');
            let pdfbutton = clonedTemplate.getElementsByClassName('pdfbutton');
            let currentNum = num;


            pdfbutton[0].addEventListener('click', (e) => {
                let img = new Image();
                img.src = imgPath;
                console.log(img.width, img.height);
                let doc = new jspdf.jsPDF("p", "mm", "a4");
                let width = doc.internal.pageSize.getWidth();
                let height = doc.internal.pageSize.getHeight();
                
                doc.addImage(img, parsedData.fileFormat, 0, 0, width, height);
                doc.save("export.pdf");
            });

            button[0].addEventListener('click', (e) => {

                document.querySelectorAll(`[data-num="${currentNum}"]`).forEach((el) => {
                    console.log(el);
                    el.remove();
                });
            });
            
            scanbutton.removeAttribute('disabled');
            printbutton.removeAttribute('disabled');
        
            loadingscreen.style.visibility = 'hidden';
            num = num + 1;
            clonedTemplate.scrollIntoView({behavior: "smooth", block: "end", inline: "nearest"});
        })
        .catch(error => console.log('error', error));

    });
})

const printImage = async function(filename, fileformat) {
    const data = {
        "filename": filename,
        "format": fileformat
    }
    await fetch('./api/printimage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).catch(error => console.log('error', error));
}

const loadBuildVer = async function() {
    await fetch('./buildver.json', {
        method: 'GET'
    }).then(response => response.text())
    .then(result => {
        document.getElementById("footer").innerText = `buildver: ${JSON.parse(result).buildver}`;
    }).catch(error => console.log('error', error))
}
