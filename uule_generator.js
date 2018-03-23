let fs = require('fs');
let canonicalName = require('./lib/countries_uule');
let secret = require('./secretkey');
secret = JSON.parse(JSON.stringify(secret));
canonicalName = JSON.parse(JSON.stringify(canonicalName)).data;
let index;
console.log(canonicalName);
for (index in canonicalName) {
  let countryObject = canonicalName[index];
  if (countryObject.hasOwnProperty('canonical') && countryObject['uule'] == "") {
    let uuleData = "w+CAIQICI";
    let length = countryObject['canonical'].length;
    let secretKey = secret[length];
    console.log(length,secretKey);
    uuleData += secretKey;
    let canonicalBaseName = Buffer.from(countryObject['canonical']).toString('base64')
    uuleData += canonicalBaseName;
    console.log(canonicalBaseName);
    console.log(uuleData);
    countryObject['uule'] = uuleData;
  }
}
let canonicalObject = {
  data: canonicalName
}
let json = JSON.stringify(canonicalObject, null, 2);
console.log(json);
fs.writeFile('./lib/countries_uule.json', json, 'utf8', (err,res) => {
  if(err) {
    console.log(err);
  }
});