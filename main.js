/* Create windows and handle system events. */

const { app, BrowserWindow } = require( 'electron' )
const path = require( 'path' )
const url = require( 'url' )

// Window object global reference.
let main_window

// Create window.
function createWindow () {
  // Create the browser window.
  main_window = new BrowserWindow( { width:800, height: 600 } )

  // Loading the index.html of the app.
  main_window.loadURL( url.format({
    pathname: path.join( __dirname, 'index.html' ),
    protocol: 'file: ',
    slashes: true
  }))

  // Open the DevTools.
  main_window.webContents.openDevTools()

  // Emitted when window is close.
  main_window.on( 'closed', () => {
    // Dereference window object.
    main_window = null
  })
}

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
