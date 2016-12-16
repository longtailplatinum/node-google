var google = require('./lib/google')

google('paintings', 'in', 'en', 0, null, function (err, next, links) {
  console.log(links)
})
