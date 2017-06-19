/* Create windows and handle system events. */

const { app, BrowserWindow } = require( 'electron' )
const path = require( 'path' )
const url = require( 'url' )
const { ipcMain } = require( 'electron' )

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
    // Dereference window object.
    main_window = null
  })
}

//
function isImage( filePath ){
  switch ( path.parse(filePath).ext.toLowerCase() ) {
    case ".png":
      console.log('PNG Image');
      break;
    case ".jpg":
      console.log('JPG Image');
      break;
    case ".jpeg":
      console.log('JPEG Image');
      break;
    default:
      console.log('Not image');
  }
}




/******************************************************************************/
/*** App events ***/
/******************************************************************************/

// Method which call 'createWindow' function once 'Electron' has
// finished its initialization and its ready to create browser windows.
app.on( 'ready', createWindow )

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
// renderer process. It displays file path in console.
ipcMain.on( 'openFile', (event, _path) => {
  const { dialog } = require( 'electron' )
  const fs = require( 'fs' )
  dialog.showOpenDialog( function (fileNames) {
    if ( fileNames === undefined ) {
      console.log( 'No file selected' );
    }
    else {
      //console.log( fileNames[0] );
      //console.log( path.parse( fileNames[0] ))
      isImage( fileNames[0] );
    }
  });
})

ipcMain.on( 'receiveDroppedImagePath', (event, args) => {
  //console.log(args.length);
  //console.log(event);
  isImage( args[0] );
})
