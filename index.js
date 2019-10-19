const express = require('express')
const app = express()
const request = require('request')
var DomParser = require('dom-parser');

app.get('/api/v1/getPricesFor/:productName', (req, res) => {
    var promise = getDataFromSkapiec(req.params.productName);
    promise.then(function(value) {
        console.log("finshed")
        console.log(value);
        res.status(200).json(value)
    }, function(err) {
        console.log(err); // Error: "It broke"
    });
});

app.listen(3000, () => console.log('Server running on port 3000'))

const getDataFromSkapiec = function(query) {
    return new Promise((resolve, reject) => {

        request("https://www.skapiec.pl/szukaj/w_calym_serwisie/" + query, function (error, response, body) {
            var parser = new DomParser();
            var doc = parser.parseFromString(body, "text/html");
            var boxes = doc.getElementsByClassName("box-row js");
            var jsonScripts = [];
            Array.prototype.forEach.call(boxes, function(el) {
                var htmlBox = parser.parseFromString(el.innerHTML);
                var script = htmlBox.getElementsByTagName("script");
                if (script[0] != undefined) {
                    var json = JSON.parse(script[0].innerHTML);
                    jsonScripts.push(json);
                }
            });
            if (jsonScripts.length > 0) {
                resolve(jsonScripts); // fulfilled
            } else {
                reject("No scripts to be had");
            }
        });
    });
}