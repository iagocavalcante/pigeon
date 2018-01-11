window.requestFileSystem(window.PERSISTENT, 0, (fs) => {
  const self = this
  console.log('file system open: ', fs.name)
  fs.root.getFile("newPersistentFile.txt", 
    { 
      create: true, 
      exclusive: false 
    }, 
    fileEntry => {
      console.log('fileEntry is file?' + fileEntry.isFile.toString())
      // fileEntry.name == 'someFile.txt'
      // fileEntry.fullPath == '/someFile.txt'
      self.writeFile(fileEntry, null)
    }, 
    err => {
      console.log(err)
    })
}, 
err => {
  console.log(err)
})

writeFile(fileEntry, dataObj) {
  // Create a FileWriter object for our FileEntry (log.txt).
  fileEntry.createWriter((fileWriter) => {
    // fileWriter.onwriteend = () => {
    //     console.log('Successful file write...')
    //     readFile(fileEntry)
    // };

    fileWriter.onerror = (e) => {
      console.log('Failed file write: ', e.toString())
    }

    // If data object is not passed in,
    // create a new Blob instead.
    if (!dataObj) {
      dataObj = new Blob(['some file data'], { type: 'text/plain' })
    }

    fileWriter.write(dataObj)
  })
}