/* Create windows and handle system events. */

const { app, BrowserWindow, ipcMain } = require( 'electron' )
const path = require( 'path' )
const url = require( 'url' )
const execFile = require( 'child_process' ).execFile //https://nodejs.org/api/child_process.html

// Window object global reference.
let main_window


/******************************************************************************/
/*** Functions ***/
/******************************************************************************/

// Create window.
function createWindow () {
  // Create the browser window.
  main_window = new BrowserWindow( { width : 800, height : 600 } )

  // Loading the index.html of the app.
  main_window.loadURL( url.format({
    pathname: path.join( __dirname, 'index.html' ),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  main_window.webContents.openDevTools()

  /*** Main window events ***/
  // Emitted when window is close.
  main_window.on( 'closed', () => {
    // Deleting temp folder.
    deleteTempFolder();

    // Dereference window object.
    main_window = null;
  })
}

// Create temp folder used for saving temporal images.
function createTempFolder () {
  const fs = require( 'fs' );
  const tempFolderPath = path.join( __dirname, 'temp' );
  // Create a temp folder if it doesnt exists.
  fs.access( tempFolderPath, fs.constants.F_OK, ( err ) => {
    if ( err ) {
      fs.mkdir( tempFolderPath, (e) => {
        if ( e ) {
          console.log( e );
        }
      });
    }
  });
}

// Delete the 'temp' folder previously created.
function deleteTempFolder () {
  const fs = require( 'fs' );
  const tempFolderPath = path.join( __dirname, 'temp' );
  // Delete an empty or not empty temp folder.
  fs.access( tempFolderPath, fs.constants.F_OK, ( err0 ) => {
    if ( !err0 ) {
      fs.rmdir( tempFolderPath, ( err1 ) => {
        if ( err1 ) {
          // Deleting all images with the name "output-*.jpg".
          let moreFiles = true;
          for( i = 0; moreFiles; i++ ){
            const fileName = 'output-' + i.toString() + '.jpg';
            const filePath = path.join( tempFolderPath, fileName );
            if( fs.existsSync( filePath ) ){
              fs.unlink(filePath, ( err2 ) => {
                if ( err2 ) {
                  console.log( err2 );
                }
                console.log("Fichero '" + filePath + "' borrado.");
              });
            }else{
              moreFiles = false;
              console.log("FALSE");
            }
          }
          // Deleting thumbnail image.
          fs.unlink( path.join( tempFolderPath, 'thumbnail.jpg'), ( err2 ) => {
            if ( err2 ) {
              console.log( err2 );
            }
          });
          // Deleting temp folder.
          fs.rmdir( tempFolderPath, ( err3 ) => { console.log( err3 );});
        }
      });
    }
  });
}

// funcion para escribir en el div 'log' del footer
function showLogMsg ( msg ) {
    main_window.webContents.send( 'logMsg', msg );
}


// Method that returns true if the filePath passed as argument is an PNG, JPG or
// JPEG image. It executes a callback function if filePath belongs to an image
// file.
function isImage( filePath, callback ){

  var is_image;

  switch ( path.parse(filePath).ext.toLowerCase() ) {
    case '.png':
      is_image = true;
      break;
    case '.jpg':
      is_image = true;
      break;
    case '.jpeg':
      is_image = true;
      break;
    default:
      is_image = false;
  }

  if ( is_image ){
    if ( typeof callback === 'function' ){
      callback( filePath );
    }
    else{
      console.error('"isImage" second parameter must be a function.');
    }
  }
  else{
    showLogMsg( 'File: "' + filePath + '" is not an image.' );
  }
}

function classify () {
  const classifierPath = path.join( __dirname,
    'build', 'lib', 'caffe', 'examples', 'cpp_classification', 'classification');

  const child = execFile( classifierPath, [
      path.join( __dirname, 'data', 'deploy.prototxt'),
      path.join( __dirname, 'data', 'cnn_face_detector.caffemodel' ),
      path.join( __dirname, 'data', 'mean.binaryproto' ),
      path.join( __dirname, 'data', 'labels.txt' ),
      path.join( __dirname, 'temp', 'output.jpg' )
    ], function( error, stdout, stderr ) {
      if ( stdout ) {
        main_window.webContents.send( 'results', stdout );
      }
    });
}

// Function that executes C++ module.
function findFace( filePath ){
  const findFacePath = path.join( __dirname, 'build', 'findFace' );
  const child = execFile( findFacePath, [ filePath ],
    function( error, stdout, stderr ) {
      if ( stderr ){
        showLogMsg( stderr );
      }
      else{
        // Sending face location to renderer process.
        console.log(stdout);
        const thumbnailPath = path.join( __dirname, 'temp', 'thumbnail.jpg');
        console.log(thumbnailPath);
        main_window.webContents.send( 'faceInfo', [thumbnailPath,stdout] );
        classify();
      }
    });

  child.on('error', (err) => {
    showLogMsg( 'Ups, an unexpected error occured while finding face.');
  });
}




/******************************************************************************/
/*** App events ***/
/******************************************************************************/

// Method which call 'createWindow' function once 'Electron' has
// finished its initialization and its ready to create browser windows.
app.on( 'ready', createWindow )

// App creates a temporal folder.
app.on( 'ready', createTempFolder )

// Quit when all windows are closed.
app.on( 'window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if ( process.platform !== 'darwin' ) {
    app.quit()
  }
})

app.on( 'activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if ( main_window === null ) {
    createWindow()
  }
})

// Rest of app main process.
// can also put them in separate files and require them here.

// Method called when our Main process receive an openFile message from a
// renderer process. It opens an open file dialog window which only let us
// select a png, jpg, jpeg image extension.
ipcMain.on( 'openFile', (event, _path) => {
  const { dialog } = require( 'electron' )
  const fs = require( 'fs' )
  dialog.showOpenDialog({ filters: [
    { name: 'Image (*.png, *.jpg, *.jpeg)', extensions: [ 'png', 'jpg', 'jpeg'] },
    { name: 'PNG (*.png)', extensions: [ 'png' ] },
    { name: 'JPG (*.jpg)', extensions: [ 'jpg' ] },
    { name: 'JPEG (*.jpeg)', extensions: [ 'jpeg' ] }
  ]}, function (fileNames){
    if ( fileNames === undefined ) {
      showLogMsg( 'No file selected' );
    }
    else{
      findFace( fileNames[0] );
    }
  });
})

// Method called when our Main process receive an receiveDroppedImagePath event
// from any renderer process. The dropped object file path is received.
ipcMain.on( 'receiveDroppedImagePath', (event, args) => {
  isImage( args[0], findFace );
})
