var google = require('./lib/google')

google('weekly meal planner', 'us', 'en', function (err, next, links) {
  console.log(links)
})
