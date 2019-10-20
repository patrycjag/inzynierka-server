const express = require('express')
const app = express()
const request = require('request')
var DomParser = require('dom-parser');

app.get('/api/v1/getPricesFor/:productName', (req, res) => {
    var promise = getDataFromSkapiec(req.params.productName);
    promise.then(function(value) {
        res.status(200).json(value)
    }, function(err) {
        res.status(404).json({ "error": "Could not find any matching products." });
    });
});

app.get('/api/v1/getOffersFor/:productId', (req, res) => {
    var promise = getProductDetails(req.params.productId);
    // promise.then(function(value) {
    //     res.status(200).json(value)
    // }, function(err) {
    //     res.status(404).json({ "error": "Could not find any matching products." });
    // });
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

const getProductDetails = function(productId) {
    // return new Promise((resolve, reject) => {
        request("https://www.skapiec.pl/site/cat/200/comp/" + productId, function (error, response, body) {
            var parser = new DomParser();
            var doc = parser.parseFromString(body, "text/html");
            var bestOffers = doc.getElementsByClassName("offers-list promo js");
            var allOffers = doc.getElementsByClassName("offers-list all js");
            var allOfferRows = parser.parseFromString(allOffers[0].innerHTML).getElementsByTagName("a");
            var bestOfferRows = parser.parseFromString(bestOffers[0].innerHTML).getElementsByTagName("a");
            var allItemOffers = [];
            Array.prototype.forEach.call(bestOfferRows, function(el) {
                var priceHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-value");
                if (priceHtml[0] != undefined) {
                    var price = parser.parseFromString(priceHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var descriptionHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-details-desc");
                    var description = parser.parseFromString(descriptionHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var sectionShopLogo = parser.parseFromString(el.innerHTML).getElementsByClassName("section-shop-logo");
                    const x = parser.parseFromString(sectionShopLogo[0].innerHTML);
                    const src = x.getElementsByTagName('img')[0].getAttribute('src');
                    const alt = x.getElementsByTagName('img')[0].getAttribute('alt');
                    allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt});
                }
            });

            Array.prototype.forEach.call(allOfferRows, function(el) {
                var priceHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-value");
                if (priceHtml[0] != undefined) {
                    var price = parser.parseFromString(priceHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var descriptionHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-details-desc");
                    var description = parser.parseFromString(descriptionHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var sectionShopLogo = parser.parseFromString(el.innerHTML).getElementsByClassName("section-shop-logo");
                    const x = parser.parseFromString(sectionShopLogo[0].innerHTML);
                    const src = x.getElementsByTagName('img')[0].getAttribute('src');
                    const alt = x.getElementsByTagName('img')[0].getAttribute('alt');
                    allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt});
                }
            });

            console.log(allItemOffers);
            //
            // Array.prototype.forEach.call(allOffers, function(el) {
            //     var htmlBox = parser.parseFromString(el.innerHTML);
            //     var script = htmlBox.getElementsByTagName("script");
            //     if (script[0] != undefined) {
            //         var json = JSON.parse(script[0].innerHTML);
            //         jsonScripts.push(json);
            //     }
            // });
            // if (true) {
            //     resolve([]); // fulfilled
            // } else {
            //     reject("No scripts to be had");
            // }
        // });
    });
}

const calculateBestPriceWithoutDelivery = function() {
    var prices = {"xkom.pl" : [220, 230, 500], "emag.pl" : [320, 330, 510], "morele.net" : [250, 247, 543], "empik.pl" : [199, 220, 430]}
    var lowestPriceFromSameShop = 0
    Object.keys(prices).forEach(function(key) {
        var value = prices[key];
        Array.prototype.forEach.call(value, function (singleValue) {

        });
    });
}