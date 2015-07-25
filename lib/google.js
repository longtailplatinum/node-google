var _ = require('lodash')
var request = require('request')
var cheerio = require('cheerio')
var querystring = require('querystring')
var util = require('util')

var USER_AGENTS = [
  // Chrome
  'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.1 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2227.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2226.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 6.4; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2225.0 Safari/537.36',
  // Firefox
  'Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10; rv:33.0) Gecko/20100101 Firefox/33.0',
  'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:31.0) Gecko/20130401 Firefox/31.0',
  // Safari
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_9_3) AppleWebKit/537.75.14 (KHTML, like Gecko) Version/7.0.3 Safari/7046A194A',
  'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2'
]

var COUNTRY_CODES_TO_UULE = [
  { cc: 'us', uule: 'w+CAIQICINVW5pdGVkIFN0YXRlcw', tld: 'com', name: 'United States' },
  { cc: 'uk', uule: 'w+CAIQICIOVW5pdGVkIEtpbmdkb20', tld: 'co.uk', name: 'United Kingdom' },
  { cc: 'ca', uule: 'w+CAIQICIGQ2FuYWRh', tld: 'ca', name: 'Canada' },
  { cc: 'ru', uule: 'w+CAIQICIGUnVzc2lh', tld: 'ru', name: 'Russia' },
  { cc: 'de', uule: 'w+CAIQICIGUnVzc2lh', tld: 'de', name: 'Germany' },
  { cc: 'fr', uule: 'w+CAIQICIHR2VybWFueQ', tld: 'fr', name: 'France' },
  { cc: 'es', uule: 'w+CAIQICIGRnJhbmNl', tld: 'es', name: 'Spain' },
  { cc: 'it', uule: 'w+CAIQICIFU3BhaW4', tld: 'it', name: 'Italy' },
  { cc: 'br', uule: 'w+CAIQICIGQnJhemls', tld: 'com.br', name: 'Brazil' },
  { cc: 'au', uule: 'w+CAIQICIGQnJhemls', tld: 'com.au', name: 'Australia' },
  { cc: 'ar', uule: 'w+CAIQICIJQXVzdHJhbGlh', tld: 'com.ar', name: 'Argentina' },
  { cc: 'be', uule: 'w+CAIQICIJQXJnZW50aW5h', tld: 'be', name: 'Belgium' },
  { cc: 'ch', uule: 'w+CAIQICIHQmVsZ2l1bQ', tld: 'ch', name: 'Switzerland' },
  { cc: 'dk', uule: 'w+CAIQICILU3dpdHplcmxhbmQ', tld: 'dk', name: 'Denmark' },
  { cc: 'fi', uule: 'w+CAIQICIHRGVubWFyaw', tld: 'fi', name: 'Finland' },
  { cc: 'hk', uule: 'w+CAIQICIJSG9uZyBLb25n', tld: 'com.hk', name: 'Hong Kong' },
  { cc: 'ie', uule: 'w+CAIQICIHRmlubGFuZA', tld: 'ie', name: 'Ireland' },
  { cc: 'il', uule: 'w+CAIQICIHSXJlbGFuZA', tld: 'co.il', name: 'Israel' },
  { cc: 'mx', uule: 'w+CAIQICIGSXNyYWVs', tld: 'com.mx', name: 'Mexico' },
  { cc: 'nl', uule: 'w+CAIQICIGTWV4aWNv', tld: 'nl', name: 'Netherlands' },
  { cc: 'no', uule: 'w+CAIQICILTmV0aGVybGFuZHM', tld: 'no', name: 'Norway' },
  { cc: 'pl', uule: 'w+CAIQICIGTm9yd2F5', tld: 'pl', name: 'Poland' },
  { cc: 'se', uule: 'w+CAIQICIGUG9sYW5k', tld: 'se', name: 'Sweden' },
  { cc: 'sg', uule: 'w+CAIQICIGU3dlZGVu', tld: 'com.sg', name: 'Singapore' },
  { cc: 'tr', uule: 'w+CAIQICIJU2luZ2Fwb3Jl', tld: 'com.tr', name: 'Turkey' }
]

var linkSel = 'h3.r a'
var descSel = 'span.st'
var itemSel = '.srg .g'
var nextSel = 'td.b a span'

var URL = 'http://www.google.%s/search?hl=%s&q=%s&uule=%s&ie=UTF-8&oe=UTF-8'

var nextTextErrorMsg = 'Translate `google.nextText` option to selected language to detect next results link.'

// start parameter is optional
function google (query, sedb, lang, start, callback) {
  if (typeof callback === 'undefined') {
    callback = start
  } else {
    startIndex = start
  }
  igoogle(query, sedb, lang, 0, callback)
}

google.resultsPerPage = 10
google.sedb = 'us'
google.lang = 'en'
google.requestOptions = {}
google.nextText = 'Next'

var igoogle = function (query, sedb, lang, start, callback) {
  if (google.resultsPerPage > 100) google.resultsPerPage = 100 // Google won't allow greater than 100 anyway
  if (google.lang !== 'en' && google.nextText === 'Next') console.warn(nextTextErrorMsg)

  // timeframe is optional. splice in if set
  if (google.timeSpan) {
    URL = URL.indexOf('tbs=qdr:') >= 0 ? URL.replace(/tbs=qdr:[snhdwmy]\d*/, 'tbs=qdr:' + google.timeSpan) : URL.concat('&tbs=qdr:', google.timeSpan)
  }

  if (_.isEmpty(sedb)) {
    sedb = google.sedb
  }
  if (_.isEmpty(lang)) {
    lang = google.lang
  }

  var locale = _.find(COUNTRY_CODES_TO_UULE, {cc: sedb})
  console.log(locale)

  var newUrl = util.format(
    URL,
    locale.tld,
    lang,
    querystring.escape(query),
    locale.uule,
    start,
    google.resultsPerPage
  )
  console.log(newUrl)

  var userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
  console.log(userAgent)

  var requestOptions = {
    url: newUrl,
    headers: {
      // Pick a random user agent
      'User-Agent': userAgent
    },
    method: 'GET'
  }

  for (var k in google.requestOptions) {
    requestOptions[k] = google.requestOptions[k]
  }

  request(requestOptions, function (err, resp, body) {
    if ((err == null) && resp.statusCode === 200) {
      // console.log(body)
      var $ = cheerio.load(body)
      var links = []

      $(itemSel).each(function (i, elem) {
        var linkElem = $(elem).find(linkSel)
        var descElem = $(elem).find(descSel)
        var item = {
          title: $(linkElem).first().text(),
          link: null,
          description: null,
          href: null
        }
        var qsObj = querystring.parse($(linkElem).attr('href'))

        if (qsObj['/url?q']) {
          item.link = qsObj['/url?q']
          item.href = item.link
        } else {
          item.link = $(linkElem).attr('href');
          item.href = $(linkElem).attr('href');
        }

        $(descElem).find('div').remove()
        item.description = $(descElem).text()

        links.push(item)
      })

      var nextFunc = null
      if ($(nextSel).last().text() === google.nextText) {
        nextFunc = function () {
          igoogle(query, start + google.resultsPerPage, callback)
        }
      }

      console.log(links)
      callback(null, nextFunc, links)
    } else {
      callback(new Error('Error on response' + (resp ? ' (' + resp.statusCode + ')' : '') + ':' + err + ' : ' + body), null, null)
    }
  })
}

module.exports = google
