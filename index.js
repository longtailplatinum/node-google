var google = require('./lib/google')

google('shopping malls london', 'in', 'en', 0, null, null, function (err, next, links) {
  console.log(links)
})
