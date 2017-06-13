// Method which sends an 'openFile' event to the main process when the select
// image button is pressed by the user.
function selectImage () {
  const {ipcRenderer} = require('electron')

  ipcRenderer.send('openFile', () => {
     console.log("Select-image event sent.");
  });
}

// Method which is triggered when user drag and drop and image on the specified
// area.
function dropImage (ev) {
  // Getting the HTML element.
  const dropImageArea = document.getElementById('dropImageArea')
  console.log(dropImageArea);
  console.log(ev);

/*  // Events handling.
  dropImageArea.ondragover = () => {
    return false;
  }
  dropImageArea.ondragleave = dropImageArea.ondragend = () => {
    return false;
  }

  dropImageArea.ondrop = (ev) => {
    ev.preventDefault()
    for (let f of ev.dataTransfer.files) {
      console.log('File(s) you dragged here: ', f.path)
    }
    return false;
  }*/
}

// Adding events to elements.
document.getElementById("selectImageButton").addEventListener( "click", selectImage );
document.getElementById("dropImageArea").addEventListener( "dragover", function(ev) { ev.preventDefault(); return false; });
document.getElementById("dropImageArea").addEventListener( "drop", dropImage );



/*const {ipcRenderer} = require('electron')

ipcRenderer.send('openFile', () => {
   console.log("Event sent.");
})*/

/*ipcRenderer.on('fileData', (event, data) => {
   document.write(data)
})*/
