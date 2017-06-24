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
// Events which receive an image path and face coords and draws the face.
ipcRenderer.on('faceInfo', (event, message) => {
  // Getting (x,y) face coordinates.
  const coords = message[1].split(";")[0].split(",").map( function( item ){
    return parseInt( item, 10 );
  });
  // Getting face area width and height.
  const faceArea = message[1].split(";")[1].split(",").map( function( item ){
    return parseInt( item, 10 );
  });

  // Plotting the face into the canvas.
  const ctx = document.getElementById( 'imageArea' ).getContext( '2d' );
  var img = new Image();
  img.onload = function(){
    console.log( img );
    ctx.drawImage( img,
      coords[0] - 50, coords[1] - 50, faceArea[0] + 50, faceArea[1] + 50,
      0, 0, 500, 500 // Canvas coords.
    );
    ctx.stroke();
  }
  img.src = message[0];
});

ipcRenderer.on('logMsg', (event, message) =>{
  const logArea = document.getElementById( 'log' );
  logArea.innerHTML = message;
  // TODO: Add div Fade-IN / Fade-OUT animation.
});
