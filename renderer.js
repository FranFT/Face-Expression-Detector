/*---------- Useful global variables. -------*/
const { ipcRenderer } = require('electron');

/*---------- Element-specific properties ----*/
const startScreen = document.getElementById( 'startScreen' );
const analysisScreen = document.getElementById( 'analysisScreen' );
const dropImageArea = document.getElementById( 'dropImageArea' );
const logWindow = document.getElementById('logWindow');
const graphArea = document.getElementById('graphContainer');

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

startScreen.addEventListener( 'animationend', () => {
  startScreen.style.webkitAnimationPlayState = 'paused';
  startScreen.classList.remove('fadeout');
  startScreen.classList.add('hidden');

  analysisScreen.classList.remove('hidden');
  analysisScreen.classList.add('fadein');
  analysisScreen.style.webkitAnimationPlayState = 'running';
});

analysisScreen.addEventListener( 'animationend', () => {
  analysisScreen.style.webkitAnimationPlayState = 'paused';
  analysisScreen.classList.remove('fadein');
});
graphArea.addEventListener( 'animationend', () => {
  graphArea.style.webkitAnimationPlayState = 'paused';
  graphArea.classList.remove('fadein');
});

// Resets Fade-in-out log window animation.
logWindow.addEventListener( 'animationend', () => {
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
    ctx.drawImage( img,
      coords[0] - 50, coords[1] - 50, faceArea[0] + 100, faceArea[1] + 100,
      0, 0, 350, 350 // Canvas coords.
    );
    ctx.stroke();
  }
  img.src = message[0];

  // Hiding start screen.
  startScreen.classList.add('fadeout');
  startScreen.style.webkitAnimationPlayState = "running";
});

// Renderer process event that receive main process classification output.
ipcRenderer.on('results', (event, _results) => {
  // Result filtering.
  var results = _results.split( '\n' ) // Gets every line individualy.
    .map( function( item ){ // Splits every line by the character " - ".
      return item.split(' - ');
    }).map( function( pair ){ // Transforms every previously splitted line.
      if( pair[1] !== undefined ){
        // Removing quotes.
        var myWord = pair[1].replace(/["]+/g, '');
        // Capitalizing the word.
        myWord = myWord.charAt(0).toUpperCase() + myWord.slice(1);
        // Returning a percentage followed by the expression.
        return [ parseFloat(pair[0]) * 100, myWord ];
      }
    });
  // Removes first and last line. They are not necesary.
  results.shift();
  results.pop();

  // Drawing the bar graph.
  for( i = 0; i < results.length; i++ ){
    if( results[i][0] !== 0.0 ){
      graphArea.innerHTML +=
      '<div class="row"><div class="label">' + results[i][1] + '</div>' +
      '<div class="bar"><div class="filled"></div>' +
      '<div class="remain"></div></div>' +
      '<div class="value">' + results[i][0] + '%</div></div>';
    }
  }

  // Running fade in animation.
  graphArea.classList.add( 'fadein' );
  graphArea.style.webkitAnimationPlayState = "running";

  var bars = document.getElementsByClassName('filled');
  if( bars.length > 0 ){
    for( i = 0; i < bars.length; i++ )
      if( results[i][0] < 0.1 )
        bars[i].style.flex = '0 1 ' + (results[i][0] * 10) + '%';
      else
        bars[i].style.flex = '0 1 ' + results[i][0] + '%';
  }


});

ipcRenderer.on('logMsg', (event, message) => {
  const logArea = document.getElementById( 'log' );
  logArea.innerHTML = message;

  logWindow.classList.toggle('hidden');
  logWindow.style.webkitAnimationPlayState = "running";
});
