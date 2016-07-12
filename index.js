var google = require('./lib/google')

google('weekly meal planner', 'us', 'en', null, function (err, next, links) {
  console.log(links)
})
