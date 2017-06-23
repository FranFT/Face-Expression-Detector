// Useful global variables.
const { ipcRenderer } = require('electron');

// Element-specific properties.
const dropImageArea = document.getElementById( 'dropImageArea' );
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
document.getElementById( 'selectImageButton' ).addEventListener( 'click', () => {
  ipcRenderer.send( 'openFile', () => {
    console.log( 'Select-image event sent.' );
  });
});

// Renderer process events.
ipcRenderer.on('faceInfo', (event, message) => {
  console.log(message);
});

ipcRenderer.on('logMsg', (event, message) =>{
  const logArea = document.getElementById( 'log' );
  logArea.innerHTML = message;
  // TODO: Add div Fade-IN / Fade-OUT animation.
});
