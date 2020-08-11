// Copyright (c) 2018-2019, The TurtleCoin Developers
// Copyright (c) 2019-2020, The Deccash Developers
//
// Please see the included LICENSE file for more information.

const fs = require('fs')
const http = require('https')

del('checkpoints.csv').then((msg) => {
  console.log(msg)
  console.log('Downloading latest checkpoints file...')

  return download('https://deccash.xyz/checkpoint.txt', 'checkpoints.csv')
}).then((msg) => {
  console.log(msg)
  console.log('')
}).catch((err) => {
  console.log('Error: %s', err.toString())
})

function del (file) {
  return new Promise((resolve, reject) => {
    fs.unlink(file, (err) => {
      if (err) return resolve(`${file} not found, skipping delete...`)
      return resolve(`Deleting ${file}...`)
    })
  })
}

function download (url, destination, append) {
  append = append || false
  return new Promise((resolve, reject) => {
    const options = {}

    if (append) {
      options.flags = 'a'
    }

    const file = fs.createWriteStream(destination, options)

    http.get(url, function (response) {
      response.pipe(file)
      file.on('finish', function () {
        file.close((err) => {
          if (err) return reject(err)
          if (!append) return resolve(`Downloaded ${url} to ${destination}`)
          return resolve(`Appended ${url} to ${destination}`)
        })
      })
    })
  })
}
