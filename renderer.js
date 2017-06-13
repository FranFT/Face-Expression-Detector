function selectImage () {
  const {ipcRenderer} = require('electron')

  ipcRenderer.send('openFile', () => {
     console.log("Select-image event sent.");
  })
}
/*const {ipcRenderer} = require('electron')

ipcRenderer.send('openFile', () => {
   console.log("Event sent.");
})*/

/*ipcRenderer.on('fileData', (event, data) => {
   document.write(data)
})*/
