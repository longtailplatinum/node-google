var google = require('./lib/google')

google('park inn cologne', 'lt', 'en', 0, null, null, function (err, next, links) {
  console.log(links)
})
