/*---------- Useful global variables. -------*/
const { ipcRenderer } = require('electron');

/*---------- Element-specific properties ----*/
const startScreen = document.getElementById( 'startScreen' );
const analysisScreen = document.getElementById( 'analysisScreen' );
const dropImageArea = document.getElementById( 'dropImageArea' );
const logWindow = document.getElementById('logWindow');
const graphArea = document.getElementById('graphContainer');
const previousResult = document.getElementById('previousResult');
const nextResult = document.getElementById('nextResult');

/*---------- Global Variables ----*/
var showing = 0;
var faceCoords;

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

function showNextResult(){
  // Increase showing counter.
  showing++;

  // Updating UI showing message.
  document.getElementById('showingMessage').innerHTML = 'Result: '+ (showing + 1).toString() + '/' + faceCoords.length.toString();

  // Hide next button if there arent next result.
  if( showing == faceCoords.length - 1 ){
    nextResult.classList.toggle('hidden');
  }
  // Show previous button if there are previous results.
  if( showing == 1){
    previousResult.classList.toggle('hidden');
  }

  console.log(showing);
}
function showPreviousResult(){
  // Decrease showing counter.
  showing--;

  // Updating UI showing message.
  document.getElementById('showingMessage').innerHTML = 'Result: '+ (showing + 1).toString() + '/' + faceCoords.length.toString();

  // Hide previous button if there aren't previous results.
  if( showing == 0 ){
    previousResult.classList.toggle('hidden');
  }
  if( showing == faceCoords.length - 2 ){
    nextResult.classList.toggle('hidden');
  }
  console.log(showing);
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

nextResult.addEventListener( 'click', showNextResult, false );
previousResult.addEventListener( 'click', showPreviousResult, false );

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

// Method that restart the UI when the element is clicked.
document.getElementById( 'restartButton' ).addEventListener( 'click', () => {
  location.reload(true);
});

// Renderer process events.
// Events which receive an image path and face coords and draws the face.
ipcRenderer.on('faceInfo', (event, message) => {
  // Getting face coordinates.
  faceCoords = message[1].split("\n");
  showing = 0;
  document.getElementById('showingMessage').innerHTML = 'Result: 1/'+faceCoords.length.toString();
  console.log(faceCoords);

  // Getting (x,y) face coordinates.
  const coords = faceCoords[0].split(";")[0].split(",").map( function( item ){
    return parseInt( item, 10 );
  });
  // Getting face area width and height.
  const faceArea = faceCoords[0].split(";")[1].split(",").map( function( item ){
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

  if( faceCoords.length > 1 )
    nextResult.classList.toggle('hidden');
  // Hiding start screen.
  startScreen.classList.add('fadeout');
  startScreen.style.webkitAnimationPlayState = "running";

});

/*ipcRenderer.on('faceInfo', (event, message) => {
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
});*/

// Renderer process event that receive main process classification output.
ipcRenderer.on('results', (event, _results) => {
  // Needed variables.
  var initialValues = [];
  var targetValues = [];
  var valueIsComplete = [];
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
    if( results[i][0] > 1.0 ){
      graphArea.innerHTML +=
      '<div class="row"><div class="label">' + results[i][1] + '</div>' +
      '<div class="bar"><div class="filled"></div>' +
      '<div class="remain"></div></div>' +
      '<div class="value">0%</div></div>';
      //'<div class="value">' + results[i][0] + '%</div></div>';
      targetValues.push(Math.floor(results[i][0]));
      initialValues.push(0);
      valueIsComplete.push(false);
    }
  }

  // Running fade in animation.
  graphArea.classList.add( 'fadein' );
  graphArea.style.webkitAnimationPlayState = "running";

  // Getting graph necesary elements.
  var bars = document.getElementsByClassName('filled');
  var values = document.getElementsByClassName('value');

  // Graph animation.
  var interval = setInterval( function(){
    var finalStatus = true;
    // Updating values which havent reached its target value.
    for( i = 0; i < values.length; i++ ){
      if( !valueIsComplete[i] ){
        values[i].innerHTML = initialValues[i] + '%';
        bars[i].style.flex = '0 1 ' + initialValues[i] + '%';
        if( initialValues[i] >= targetValues[i] )
          valueIsComplete[i] = true;
        initialValues[i] += 1;
      }
    }
    // Checking if all bars have reached the target value to finish the loop.
    for( i = 0; i < valueIsComplete.length; i++ )
      finalStatus = finalStatus && valueIsComplete[i];
    if( finalStatus ) clearInterval(interval);
  }, 50);
});

ipcRenderer.on('logMsg', (event, message) => {
  const logArea = document.getElementById( 'log' );
  logArea.innerHTML = message;

  logWindow.classList.toggle('hidden');
  logWindow.style.webkitAnimationPlayState = "running";
});
