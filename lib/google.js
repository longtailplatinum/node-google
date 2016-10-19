var _ = require('lodash')
var request = require('request')
var cheerio = require('cheerio')
var querystring = require('querystring')
var util = require('util')
var Logger = require('le_node')
var logger = new Logger({
    token: 'c938c20d-f4e3-4da3-bd79-291c7138760c'
});

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


//TODO: The list is incomplete 
var COUNTRY_CODES_TO_UULE = [
    {cc: 'ar', tld: 'com.ar', name: 'Argentina', uule: 'w+CAIQICIJQXVzdHJhbGlh'},
    {cc: 'au', tld: 'com.au', name: 'Australia', uule: 'w+CAIQICIJQnJhemls'},
    {cc: 'be', tld: 'be', name: 'Belgium', uule: 'w+CAIQICIJQXJnZW50aW5h'},
    {cc: 'br', tld: 'com.br', name: 'Brazil', uule: 'w+CAIQICIGQnJhemls'},
    {cc: 'bg', tld: 'bg', name: 'Bulgaria', uule: 'w+CAIQICIIQnVsZ2FyaWE'},
    {cc: 'ca', tld: 'ca', name: 'Canada', uule: 'w+CAIQICIGQ2FuYWRh'},
    {cc: 'co', tld: 'com.co', name: 'Colombia', uule: 'w+CAIQICIIQ29sb21iaWE'},
    {cc: 'cz', tld: 'cz', name: 'Czech Republic', uule: 'w+CAIQICIOQ3plY2ggUmVwdWJsaWM'},
    {cc: 'dk', tld: 'dk', name: 'Denmark', uule: 'w+CAIQICILU3dpdHplcmxhbmQ'},
    {cc: 'eg', tld: 'com.eg', name: 'Egypt', uule: 'w+CAIQICIFRWd5cHQ'},
    {cc: 'ee', tld: 'ee', name: 'Estonia', uule: 'w+CAIQICIHRXN0b25pYQ'},
    {cc: 'fi', tld: 'fi', name: 'Finland', uule: 'w+CAIQICIHRGVubWFyaw'},
    {cc: 'fr', tld: 'fr', name: 'France', uule: 'w+CAIQICIHR2VybWFueQ'},
    {cc: 'gt', tld: 'com.gt', name: 'Guatemala', uule: 'w+CAIQICIJR3VhdGVtYWxh'},
    {cc: 'de', tld: 'de', name: 'Germany', uule: 'w+CAIQICIGUnVzc2lh'},
    {cc: 'gh', tld: 'com.gh', name: 'Ghana', uule: 'w+CAIQICIFR2hhbmE'},
    {cc: 'hk', tld: 'com.hk', name: 'Hong Kong', uule: 'w+CAIQICIJSG9uZyBLb25n'},
    {cc: 'hu', tld: 'hu', name: 'Hungary', uule: 'w+CAIQICIHSHVuZ2FyeQ'},
    {cc: 'in', tld: 'co.in', name: 'India', uule: 'w+CAIQICIFSW5kaWE'},
    {cc: 'id', tld: 'co.id', name: 'Indonesia', uule: 'w+CAIQICIJSW5kb25lc2lh'},
    {cc: 'ie', tld: 'ie', name: 'Ireland', uule: 'w+CAIQICIHRmlubGFuZA'},
    {cc: 'il', tld: 'co.il', name: 'Israel', uule: 'w+CAIQICIHSXJlbGFuZA'},
    {cc: 'it', tld: 'it', name: 'Italy', uule: 'w+CAIQICIFU3BhaW4'},
    {cc: 'jp', tld: 'co.jp', name: 'Japan', uule: 'w+CAIQICIFSmFwYW4'},
    {cc: 'my', tld: 'com.my', name: 'Malaysia', uule: 'w+CAIQICIITWFsYXlzaWE'},
    {cc: 'mx', tld: 'com.mx', name: 'Mexico', uule: 'w+CAIQICIGSXNyYWVs'},
    {cc: 'nl', tld: 'nl', name: 'Netherlands', uule: 'w+CAIQICIGTWV4aWNv'},
    {cc: 'nz', tld: 'co.nz', name: 'New Zealand', uule: 'w+CAIQICILTmV3IFplYWxhbmQ'},
    {cc: 'no', tld: 'no', name: 'Norway', uule: 'w+CAIQICILTmV0aGVybGFuZHM'},
    {cc: 'ph', tld: 'com.ph', name: 'Philippines', uule: 'w+CAIQICILUGhpbGlwcGluZXM'},
    {cc: 'pk', tld: 'com.pk', name: 'Pakistan', uule: 'w+CAIQICIIUGFraXN0YW4'},
    {cc: 'pl', tld: 'pl', name: 'Poland', uule: 'w+CAIQICIGTm9yd2F5'},
    {cc: 'pt', tld: 'pt', name: 'Portugal', uule: 'w+CAIQICIIUG9ydHVnYWw'},
    {cc: 'ro', tld: 'ro', name: 'Romania', uule: 'w+CAIQICIHUm9tYW5pYQ'},
    {cc: 'ru', tld: 'ru', name: 'Russia', uule: 'w+CAIQICIGUnVzc2lh'},
    {cc: 'sg', tld: 'com.sg', name: 'Singapore', uule: 'w+CAIQICIGU3dlZGVu'},
    {cc: 'rs', tld: 'rs', name: 'Serbia', uule: 'w+CAIQICIGU2VyYmlh'},
    {cc: 'za', tld: 'co.za', name: 'South Africa', uule: 'w+CAIQICIMU291dGggQWZyaWNh'},
    {cc: 'es', tld: 'es', name: 'Spain', uule: 'w+CAIQICIGRnJhbmNl'},
    {cc: 'se', tld: 'se', name: 'Sweden', uule: 'w+CAIQICIGUG9sYW5k'},
    {cc: 'ch', tld: 'ch', name: 'Switzerland', uule: 'w+CAIQICIHQmVsZ2l1bQ'},
    {cc: 'tr', tld: 'com.tr', name: 'Turkey', uule: 'w+CAIQICIJU2luZ2Fwb3Jl'},
    {cc: 'ae', tld: 'ae', name: 'United Arab Emirates', uule: 'w+CAIQICIUVW5pdGVkIEFyYWIgRW1pcmF0ZXM'},
    {cc: 'uk', tld: 'co.uk', name: 'United Kingdom', uule: 'w+CAIQICIOVW5pdGVkIEtpbmdkb20'},
    {cc: 'us', tld: 'com', name: 'United States', uule: 'w+CAIQICINVW5pdGVkIFN0YXRlcw'},
    {cc: 'vn', tld: 'com.vn', name: 'Vietnam', uule: 'w+CAIQICIHVmlldG5hbQ'}
]

var itemSelector = ''
var itemSel1 = '.srg .g'
var itemSel2 = 'li.g'
var descSel = 'span.st'
var linkSel = 'h3.r a'
var nextSel = 'td.b a span'
var advertisements = '#tvcap .commercial-unit-desktop-top'
var mapResults = '._gt'
var rightButton = 'g-right-button'
var rightButtonDisable = 'g-right-button.nb-disabled'

var URL = 'http://www.google.%s/search?hl=%s&q=%s&uule=%s&ie=UTF-8&oe=UTF-8'

var nextTextErrorMsg = 'Translate `google.nextText` option to selected language to detect next results link.'

// start parameter is optional
function google(query, sedb, lang, start, proxy, callback) {
    if (typeof callback === 'undefined') {
        callback = start
    } else {
        startIndex = start
    }
    igoogle(query, sedb, lang, 0, proxy, callback);
}

google.resultsPerPage = 10
google.sedb = 'us'
google.lang = 'en'
google.requestOptions = {}
google.nextText = 'Next'

var igoogle = function(query, sedb, lang, start, proxy, callback) {
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

    var locale = _.find(COUNTRY_CODES_TO_UULE, { cc: sedb })

    //TODO: remove thes condition when country code list is updated
    if (!locale) {
        console.log('========================');
        console.log('Country not found');
        console.log('========================');
        logger.alert('Country not found');
        console.log(locale)
    }
    else {
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

        if (proxy && proxy !== null) {
            requestOptions.proxy = 'http://' + proxy;
        }

        for (var k in google.requestOptions) {
            requestOptions[k] = google.requestOptions[k]
        }

        request(requestOptions, function(err, resp, body) {
            if ((err == null) && resp.statusCode === 200) {
                // console.log(body)
                var $ = cheerio.load(body)
                var links = []
                var totalPages = $('.g').length + $(mapResults).length;
                console.log('adver', $(advertisements))
                if($(advertisements)) {
                    totalPages++;
                }
                console.log('mapResults', $(mapResults).length)
                console.log($(mapResults))
                itemSelector = itemSel2
                if ($(itemSel1).length > $(itemSel2).length) {
                    itemSelector = itemSel1
                }
                console.log(totalPages)
                console.log('..................')
                console.log($(itemSelector).length)
                $(itemSelector).each(function(i, elem) {
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
                    logger.alert('Next page');
                    nextFunc = function() {
                        igoogle(query, start + google.resultsPerPage, callback)
                    }
                }

                //console.log(links)
                callback(null, nextFunc, links)
            } else {
                callback(new Error('Error on response' + (resp ? ' (' + resp.statusCode + ')' : '') + ':' + err + ' : ' + body), null, null)
            }
        })
    }
}

module.exports = google