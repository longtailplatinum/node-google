var google = require('./lib/google')

google('Microsoft', 'us', 'en', function (err, next, links) {
  console.log(links)
})
