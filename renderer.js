/*---------- Useful global variables. -------*/
const { ipcRenderer } = require('electron');

/*---------- Element-specific properties ----*/
const dropImageArea = document.getElementById( 'dropImageArea' );
const logWindow = document.getElementById('logWindow');


// Body.
document.ondragover = () => {
  return false;
}
document.ondragleave = document.ondragend = () => {
  return false;
}

// Drop area.
dropImageArea.ondragover = () => {
  return false;
}
dropImageArea.ondragleave = dropImageArea.ondragend = () => {
  return false;
}

/*---------- Element-specific events. -----*/
// Body.
document.ondrop = (e) => {
  e.preventDefault();
  return false;
}

// Drop area.
dropImageArea.ondrop = (e) => {
  e.preventDefault();

  ipcRenderer.send(
    'receiveDroppedImagePath', // Channel.
    [ e.dataTransfer.files[0].path ] // Arguments.
  );

  return false;
}

logWindow.addEventListener( 'animationend', () => {
  console.log("Ventana log cerrada");
  logWindow.style.webkitAnimationPlayState = 'paused';
  logWindow.classList.toggle('hidden');
});

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
//https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
// Apply padding if possible.
// EJ: (coords[0] - 50 > 0 ) ? coords[0] - 50 : coords[0];
    ctx.drawImage( img,
      coords[0], coords[1], faceArea[0], faceArea[1],
      0, 0, 400, 400 // Canvas coords.
    );
    ctx.stroke();
  }
  img.src = message[0];


});

ipcRenderer.on('results', (event, results) => {
  var resultArea = document.getElementById('resultsArea');
  var results = results.split( '\n' );
  results.shift();
  results.pop();

  // Writing results.
  resultArea.innerHTML = '<ul>';
  for( i = 0; i < results.length; i++ ) {
    resultArea.innerHTML += '<li>' + results[i] + '</li>';
  }
  resultArea.innerHTML += '</ul>';
});

ipcRenderer.on('logMsg', (event, message) => {
  const logArea = document.getElementById( 'log' );
  logArea.innerHTML = message;

  logWindow.classList.toggle('hidden');
  logWindow.style.webkitAnimationPlayState = "running";
});
