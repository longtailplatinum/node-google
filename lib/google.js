let _ = require('lodash')
let request = require('request')
let cheerio = require('cheerio')
let querystring = require('querystring')
let util = require('util')
let Logger = require('le_node')
let logger = new Logger({
    token: 'c938c20d-f4e3-4da3-bd79-291c7138760c'
});

let USER_AGENTS = [
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
    // 'Mozilla/5.0 (iPad; CPU OS 6_0 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Version/6.0 Mobile/10A5355d Safari/8536.25',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2'
]


//TODO: The list is incomplete 
let COUNTRY_CODES_TO_UULE = [
    {cc: 'ar', tld: 'com.ar', name: 'Argentina', uule: 'w+CAIQICIJQXJnZW50aW5h'},
    {cc: 'au', tld: 'com.au', name: 'Australia', uule: 'w+CAIQICIJQXVzdHJhbGlh'},
    {cc: 'at', tld: 'at', name: 'Austria', uule: 'w+CAIQICIHQXVzdHJpYQ=='},    
    {cc: 'be', tld: 'be', name: 'Belgium', uule: 'w+CAIQICIHQmVsZ2l1bQ=='},
    {cc: 'bz', tld: 'com.bz', name: 'Belize', uule: 'w+CAIQICIGQmVsaXpl'},
    {cc: 'br', tld: 'com.br', name: 'Brazil', uule: 'w+CAIQICIGQnJhemls'},
    {cc: 'bg', tld: 'bg', name: 'Bulgaria', uule: 'w+CAIQICIIQnVsZ2FyaWE='},
    {cc: 'ca', tld: 'ca', name: 'Canada', uule: 'w+CAIQICIGQ2FuYWRh'},
    {cc: 'cl', tld: 'cl', name: 'Chile', uule: 'w+CAIQICIFQ2hpbGU='},    
    {cc: 'co', tld: 'com.co', name: 'Colombia', uule: 'w+CAIQICIIQ29sb21iaWE='},
    {cc: 'kh', tld: 'com.kh', name: 'Cambodia', uule: 'w+CAIQICIIQ2FtYm9kaWE='},
    {cc: 'cr', tld: 'co.cr', name: 'Costa Rica', uule: 'w+CAIQICIKQ29zdGEgUmljYQ=='},
    {cc: 'cz', tld: 'cz', name: 'Czech Republic', uule: 'w+CAIQICIHQ3plY2hpYQ=='},
    {cc: 'dk', tld: 'dk', name: 'Denmark', uule: 'w+CAIQICIHRGVubWFyaw=='},
    {cc: 'ec', tld: 'com.ec', name: 'Ecuador', uule: 'w+CAIQICIHRWN1YWRvcg=='},
    {cc: 'sv', tld: 'com.sv', name: 'El Salvador', uule: 'w+CAIQICILRWwgU2FsdmFkb3I='},
    {cc: 'eg', tld: 'com.eg', name: 'Egypt', uule: 'w+CAIQICIFRWd5cHQ='},
    {cc: 'ee', tld: 'ee', name: 'Estonia', uule: 'w+CAIQICIHRXN0b25pYQ='},
    {cc: 'fi', tld: 'fi', name: 'Finland', uule: 'w+CAIQICIHRmlubGFuZA=='},
    {cc: 'fr', tld: 'fr', name: 'France', uule: 'w+CAIQICIGRnJhbmNl'},
    {cc: 'gt', tld: 'com.gt', name: 'Guatemala', uule: 'w+CAIQICIJR3VhdGVtYWxh'},
    {cc: 'de', tld: 'de', name: 'Germany', uule: 'w+CAIQICIHR2VybWFueQ=='},
    {cc: 'gh', tld: 'com.gh', name: 'Ghana', uule: 'w+CAIQICIFR2hhbmE='},
    {cc: 'gr', tld: 'gr', name: 'Greece', uule: 'w+CAIQICIGR3JlZWNlDQo='},
    {cc: 'hn', tld: 'hn', name: 'Honduras', uule: 'w+CAIQICIISG9uZHVyYXM='},
    {cc: 'hk', tld: 'com.hk', name: 'Hong Kong', uule: 'w+CAIQICIJSG9uZyBLb25n'},
    {cc: 'hu', tld: 'hu', name: 'Hungary', uule: 'w+CAIQICIHSHVuZ2FyeQ=='},
    {cc: 'in', tld: 'co.in', name: 'India', uule: 'w+CAIQICIFSW5kaWE='},
    {cc: 'id', tld: 'co.id', name: 'Indonesia', uule: 'w+CAIQICIJSW5kb25lc2lh'},
    {cc: 'ie', tld: 'ie', name: 'Ireland', uule: 'w+CAIQICIHRmlubGFuZA=='},
    {cc: 'il', tld: 'co.il', name: 'Israel', uule: 'w+CAIQICIGSXNyYWVs'},
    {cc: 'it', tld: 'it', name: 'Italy', uule: 'w+CAIQICIFSXRhbHk='},
    {cc: 'jp', tld: 'co.jp', name: 'Japan', uule: 'w+CAIQICIFSmFwYW4='},
    {cc: 'my', tld: 'com.my', name: 'Malaysia', uule: 'w+CAIQICIITWFsYXlzaWE='},
    {cc: 'mx', tld: 'com.mx', name: 'Mexico', uule: 'w+CAIQICIGTWV4aWNv'},
    {cc: 'nl', tld: 'nl', name: 'Netherlands', uule: 'w+CAIQICILTmV0aGVybGFuZHM='},
    {cc: 'nz', tld: 'co.nz', name: 'New Zealand', uule: 'w+CAIQICILTmV3IFplYWxhbmQ='},
    {cc: 'ni', tld: 'ni', name: 'Nicaragua', uule: 'w+CAIQICIJTmljYXJhZ3Vh'},
    {cc: 'no', tld: 'no', name: 'Norway', uule: 'w+CAIQICIGTm9yd2F5'},
    {cc: 'ph', tld: 'com.ph', name: 'Philippines', uule: 'w+CAIQICILUGhpbGlwcGluZXM='},
    {cc: 'pk', tld: 'com.pk', name: 'Pakistan', uule: 'w+CAIQICIIUGFraXN0YW4='},
    {cc: 'pa', tld: 'com.pa', name: 'Panama', uule: 'w+CAIQICIGUGFuYW1h'},
    {cc: 'py', tld: 'com.py', name: 'Paraguay', uule: 'w+CAIQICIIUGFyYWd1YXk='},
    {cc: 'pe', tld: 'com.pe', name: 'Peru', uule: 'w+CAIQICIEUGVydQ=='},
    {cc: 'pl', tld: 'pl', name: 'Poland', uule: 'w+CAIQICIGTm9yd2F5'},
    {cc: 'pt', tld: 'pt', name: 'Portugal', uule: 'w+CAIQICIIUG9ydHVnYWw='},
    {cc: 'ro', tld: 'ro', name: 'Romania', uule: 'w+CAIQICIHUm9tYW5pYQ=='},
    {cc: 'ru', tld: 'ru', name: 'Russia', uule: 'w+CAIQICIGUnVzc2lh'},
    {cc: 'sg', tld: 'com.sg', name: 'Singapore', uule: 'w+CAIQICIJU2luZ2Fwb3Jl'},
    {cc: 'rs', tld: 'rs', name: 'Serbia', uule: 'w+CAIQICIGU2VyYmlh'},
    {cc: 'sk', tld: 'sk', name: 'Slovakia', uule: 'w+CAIQICIIU2xvdmFraWE='},    
    {cc: 'za', tld: 'co.za', name: 'South Africa', uule: 'w+CAIQICIMU291dGggQWZyaWNh'},
    {cc: 'es', tld: 'es', name: 'Spain', uule: 'w+CAIQICIFU3BhaW4='},
    {cc: 'se', tld: 'se', name: 'Sweden', uule: 'w+CAIQICIGU3dlZGVu'},
    {cc: 'ch', tld: 'ch', name: 'Switzerland', uule: 'w+CAIQICIHQmVsZ2l1bQ='},
    {cc: 'tr', tld: 'com.tr', name: 'Turkey', uule: 'w+CAIQICIGVHVya2V5'},
    {cc: 'th', tld: 'co.th', name: 'Thailand', uule: 'w+CAIQICIIVGhhaWxhbmQ='},    
    {cc: 'ae', tld: 'ae', name: 'United Arab Emirates', uule: 'w+CAIQICIUVW5pdGVkIEFyYWIgRW1pcmF0ZXM='},
    {cc: 'uk', tld: 'co.uk', name: 'United Kingdom', uule: 'w+CAIQICIOVW5pdGVkIEtpbmdkb20='},
    {cc: 'us', tld: 'com', name: 'United States', uule: 'w+CAIQICINVW5pdGVkIFN0YXRlcw=='},
    {cc: 'uy', tld: 'com.uy', name: 'Uruguay', uule: 'w+CAIQICIHVXJ1Z3VheQ=='},
    {cc: 've', tld: 'co.ve', name: 'Venezuela', uule: 'w+CAIQICIJVmVuZXp1ZWxh'},
    {cc: 'vn', tld: 'com.vn', name: 'Vietnam', uule: 'w+CAIQICIHVmlldG5hbQ=='}
]

let itemSelector = '';
let itemSel1 = '.srg .g';
let itemSel2 = 'li.g';
let itemSel3 = '.g';
let descSel = 'span.st';
let linkSel = 'h3.r a';
let nextSel = 'td.b a span';
let advertisements = '.ads-ad';
let mapResults = '._gt';
let inTheNews = '.card-section';
let peopleAsk = '.related-question-pair';
let sponsored = '#tvcap .commercial-unit-desktop-top';
let featuredClass = 'kp-blk';
let featured = {
    class: '.kp-blk h3.r a',
    count: 2
}
let featured_feedback = {
    class: '._V1j',
    count: 1
}

let local_pack = {
    class: '._M4k',
    count: 3
}
let local_knowleadge_graph = {
    class: '.knowledge-panel #lu_map',
    count: 1
}
let adword_ads = {
    class: '.ads-ad',
    count: 1
}
let google_shopping = {
    class: '.cu-container',
    count: 1
}

let google_flights = {
    class: '.flt-actionblock',
    count: 1
}
let hotel_ads = {
    class: '.gws-local-hotels__booking-module',
    count: 1
}
let travel_box = {
    class: '[data-async-type="editableDirectionsSearch"]',
    count: 1
}
let carousel_results = {
    class: 'rl_container',
    count: 1
}
let knowleadge_graph_panel = {
    class: '.knowledge-panel',
    count: 1
}
let knowleadge_graph_results = {
    class: '.kp-blk ._Sen',
    count: 1
}
let knowleadge_graph_slider= {
    class: '._S5o',
    count: 1
}
let social_listing= {
    class: '._mip',
    count: 1
}
let google_news= {
    class: '._Ncr',
    count: 1
}
let images= {
    class: '#imagebox_bigimages',
    count: 1
}

let nextTextErrorMsg = 'Translate `google.nextText` option to selected language to detect next results link.'

// start parameter is optional
function google(query, sedb, lang, start, proxy, cert, callback) {
    if (typeof callback === 'undefined') {
        callback = start
    } else {
        startIndex = start
    }
    let serpResults = {
        featured: 0,
        local: 0,
        organic: 0,
        ads: 0,
        knowledge_graph: 0
    }
    igoogle(query, sedb, lang, 0, proxy, cert, serpResults, callback);
}

google.resultsPerPage = 10
google.sedb = 'us'
google.lang = 'en'
google.requestOptions = {}
google.nextText = 'Next';
google.protocol = 'http';


let igoogle = function(query, sedb, lang, start, proxy, cert, serpResults, callback) {
    let URL = '%s://www.google.%s/search?hl=%s&q=%s&uule=%s&ip=0.0.0.0&source_ip=0.0.0.0&ie=UTF-8&oe=UTF-8&noj=1&igu=1&nomo=1&nota=1&biw=1075&bih=5000&gl=%s&adtest=on';
    if (google.resultsPerPage > 100) google.resultsPerPage = 100 // Google won't allow greater than 100 anyway
    if (google.lang !== 'en' && google.nextText === 'Next') console.warn(nextTextErrorMsg)
    if (google.protocol !== 'http' && google.protocol !== 'https') {
        google.protocol = 'http';
        console.warn(protocolErrorMsg);
    }
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

    let locale = _.find(COUNTRY_CODES_TO_UULE, { cc: sedb })

    //TODO: remove thes condition when country code list is updated
    if (!locale) {
        console.log('========================');
        console.log('Country not found');
        console.log('========================');
        logger.alert('Country not found');
        console.log(locale);
        callback(new Error('country not found'));
    }
    else {
        console.log(locale)
        let newUrl = util.format(
            URL,
            google.protocol,
            locale.tld,
            lang,
            querystring.escape(query),
            locale.uule,
            //google.resultsPerPage,
            locale.cc.toUpperCase()
        );
        //newUrl += "&ie="+(new Date()).getTime();
            console.log(newUrl)

        let userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]
        console.log(userAgent)

        let requestOptions = {
            url: newUrl,
            headers: {
                // Pick a random user agent
                'User-Agent': userAgent,
                'Cache-Control':'private, no-cache, no-store, must-revalidate, max-age=0',
                'Pragma':'no-cache'
            },
            method: 'GET'
        }

        if (proxy && proxy !== null) {
            requestOptions.proxy =  proxy;
        }

        if (cert) {
            requestOptions.ca =  cert;
        }

        for (let k in google.requestOptions) {
            requestOptions[k] = google.requestOptions[k]
        }
        console.log('request options: ...............', requestOptions)

        request(requestOptions, function(err, resp, body) {
            if ((err == null) && resp.statusCode === 200) {
                // console.log(body)
                let $ = cheerio.load(body)
                let links = []
                let totalPages = Number($('.g').length) + Number($(mapResults).length) + Number($(advertisements).length) + Number($(peopleAsk).length) + Number($(sponsored).length);
                itemSelector = itemSel2
                if(Number($(mapResults).length) > 0) {
                    totalPages+= 2;
                }
                if ($(itemSel1).length > $(itemSel2).length) {
                    itemSelector = itemSel1
                }
                if ($(itemSel3).length > $(itemSelector).length) {
                    itemSelector = itemSel3
                }
                console.log('total: ',totalPages)
                $(itemSelector).each(function(i, elem) {
                    let linkElem = $(elem).find(linkSel)
                    let descElem = $(elem).find(descSel)
                    let item = {
                        title: $(linkElem).first().text(),
                        link: null,
                        description: null,
                        href: null
                    }
                    if ($(linkElem).attr('href') != '#') {
                        let qsObj = querystring.parse($(linkElem).attr('href'))
                        if (qsObj['/url?q']) {
                            item.link = qsObj['/url?q']
                            item.href = item.link
                        } else {
                            item.link = $(linkElem).attr('href');
                            item.href = $(linkElem).attr('href');
                        }
                    } else {
                        let pingObj = $(linkElem).attr('ping')
                        item.link = getParameterByName('url',pingObj);
                        item.href = item.link;
                    }

                    $(descElem).find('div').remove()
                    item.description = $(descElem).text()
                    let link = links.filter(function (data) { return (data.title === item.title && data.link === item.link && data.href === item.href)})
                    if(!link || (link && link.length <= 0)){
                        links.push(item)
                    }
                });

                // SERP featured results
                if ($(featured.class).length && $(featured_feedback.class).length) {
                    serpResults.featured += featured.count * Number($(featured.class).length);
                }

                // SERP local search
                if ($(local_pack.class).length) {
                    serpResults.local += local_pack.count * Number($(local_pack.class).length);
                }
                if ($(local_knowleadge_graph.class).length) {
                    serpResults.local += local_knowleadge_graph.count * Number($(local_knowleadge_graph.class).length);
                }

                // SERP ads search
                if ($(adword_ads.class).length) {
                    serpResults.ads += adword_ads.count * Number($(adword_ads.class).length);
                }
                if ($(google_shopping.class).length) {
                    serpResults.ads += google_shopping.count * Number($(google_shopping.class).length);
                }
                if ($(google_flights.class).length) {
                    serpResults.ads += google_flights.count * Number($(google_flights.class).length);
                }
                if ($(hotel_ads.class).length) {
                    serpResults.ads += hotel_ads.count * Number($(hotel_ads.class).length);
                }

                // SERP knowledge graph
                if ($(travel_box.class).length) {
                    serpResults.knowledge_graph += travel_box.count * Number($(travel_box.class).length);
                }
                if ($(carousel_results.class).length) {
                    serpResults.knowledge_graph += carousel_results.count * Number($(carousel_results.class).length);
                }
                if ($(knowleadge_graph_panel.class).length && !$(local_knowleadge_graph.class).length) {
                    serpResults.knowledge_graph += knowleadge_graph_panel.count * Number($(knowleadge_graph_panel.class).length);
                }
                if ($(knowleadge_graph_results.class).length) {
                    serpResults.knowledge_graph += knowleadge_graph_results.count * Number($(knowleadge_graph_results.class).length);
                }
                if ($(knowleadge_graph_slider.class).length) {
                    serpResults.knowledge_graph += knowleadge_graph_slider.count * Number($(knowleadge_graph_slider.class).length);
                }


                // SERP organic results
                if (links.length) {
                    serpResults.organic += links.length;
                }
                if ($(social_listing.class).length) {
                    serpResults.organic += social_listing.count * Number($(social_listing.class).length);
                }
                if ($(google_news.class).length) {
                    serpResults.organic += google_news.count * Number($(google_news.class).length);
                }
                if ($(images.class).length) {
                    serpResults.organic += images.count * Number($(images.class).length);
                }

                let nextFunc = null
                if ($(nextSel).last().text() === google.nextText) {
                    logger.alert('Next page');
                    nextFunc = function() {
                        igoogle(query, start + google.resultsPerPage, cert, serpResults, callback)
                    }
                }

                //console.log(links)
                callback(null, nextFunc, {links: links, total: totalPages, serpResults: serpResults})
            } else {
                console.log('Error response from scraper res: ', resp);
                callback(new Error('Error on response' + (resp ? ' (' + resp.statusCode + ')' : '') + ':' + err + ' : ' + body), null, null)
            }
        })
    }
}

module.exports = google