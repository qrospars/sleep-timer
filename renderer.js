// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
const ipcRenderer = require('electron').ipcRenderer;

const submitFormButton = document.querySelector("#form");
if (submitFormButton) {
    submitFormButton.addEventListener("submit", function (event) {
        event.preventDefault();   // stop the form from submitting
        let time = document.getElementById("stacked-time").value;
        ipcRenderer.send('submitForm', time);
    });
}

const submitFormButton2 = document.querySelector("#form2");
if (submitFormButton2) {
    submitFormButton2.addEventListener("submit", function (event) {
        event.preventDefault();
        ipcRenderer.send('submitForm2');
    });
}
