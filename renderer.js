// Useful global variables.
const { ipcRenderer } = require('electron')

// Element-specific properties.
const dropImageArea = document.getElementById('dropImageArea')
dropImageArea.ondragover = () => {
  return false;
}
dropImageArea.ondragleave = dropImageArea.ondragend = () => {
  return false;
}

// Element-specific events.
dropImageArea.ondrop = (e) => {
  e.preventDefault();

  ipcRenderer.send(
    'receiveDroppedImagePath', // Channel.
    [ e.dataTransfer.files[0].path ] // Arguments.
  );

  return false;
}


// Method which sends an 'openFile' event to the main process when the select
// image button is pressed by the user.
function selectImage () {
  ipcRenderer.send( 'openFile' , () => {
     console.log( 'Select-image event sent.' );
  });
}

// Adding events to elements.
document.getElementById( 'selectImageButton' ).addEventListener( 'click', selectImage );

// Renderer process events.
ipcRenderer.on('hello', (event, message) => {
  console.log(message);
});




/*const {ipcRenderer} = require('electron')

ipcRenderer.send('openFile', () => {
   console.log("Event sent.");
})*/

/*ipcRenderer.on('fileData', (event, data) => {
   document.write(data)
})*/
