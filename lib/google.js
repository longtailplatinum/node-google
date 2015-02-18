var request = require('request'),
  cheerio = require('cheerio'),
  fs = require('fs'),
  querystring = require('querystring'),
  util = require('util');

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
];

var linkSel = 'h3.r a',
  descSel = 'div.s',
  itemSel = 'li.g',
  nextSel = 'td.b a span';

var URL = 'http://www.google.%s/search?hl=%s&q=%s&start=%s&sa=N&num=%s&ie=UTF-8&oe=UTF-8';

function google(query, callback) {
  igoogle(query, 0, callback);
}

google.resultsPerPage = 10;
google.tld = 'com';
google.lang = 'en';
google.uule = '&uule=w+CAIQICINVW5pdGVkIFN0YXRlcw'; // Default US; see usearchfrom.com and github.com/512banque/uule-grabber
google.proxy = null;

var igoogle = function(query, start, callback) {
  if (google.resultsPerPage > 100) google.resultsPerPage = 100; //Google won't allow greater than 100 anyway

  var newUrl = util.format(URL, google.tld, google.lang, querystring.escape(query), start, google.resultsPerPage);
  if (google.tld === 'com' && google.lang == 'en') {
    newUrl += google.uule;
  }
  var requestOptions = {
    url: newUrl,
    method: 'GET',
    headers: {
      // Pick a random user agent
      'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
    }
  };

  //make sure we have a set proxy for the scrape
  if (google.proxy != null) {
    //set request.proxy to the provided google.proxy
    requestOptions.proxy = google.proxy;
  }

  request(requestOptions, function(err, resp, body) {
    if ((err == null) && resp.statusCode === 200) {
      var $ = cheerio.load(body),
        links = [],
        text = [];

      $(itemSel).each(function(i, elem) {
        var linkElem = $(elem).find(linkSel),
          descElem = $(elem).find(descSel),
          item = {
            title: $(linkElem).first().text(),
            link: null,
            description: null,
            href: null
          },
          qsObj = querystring.parse($(linkElem).attr('href'));

        if (qsObj['/url?q']) {
          item.link = qsObj['/url?q']
          item.href = item.link
        }

        $(descElem).find('div').remove();
        item.description = $(descElem).text();

        links.push(item);
      });

      var nextFunc = null;
      if ($(nextSel).last().text() === 'Next') {
        nextFunc = function() {
          igoogle(query, start + google.resultsPerPage, callback);
        }
      }

      callback(null, nextFunc, links);
    } else {
      callback(new Error('Error on response' + (resp ? ' (' + resp.statusCode + ')' : '') + ':' + err + " : " + body), null, null);
    }
  });
}

module.exports = google;
