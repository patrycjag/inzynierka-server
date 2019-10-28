const express = require('express')
const app = express()
const request = require('request')
const DomParser = require('dom-parser');

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
    promise.then(function(value) {
        res.status(200).json(value)
    }, function(err) {
        res.status(404).json({ "error": "Could not find any matching products." });
    });
});

app.get('/api/v1/getBestDeals', (req, res) => {
    if (req.body instanceof Array) {
        //Tablica id do szukania.
    } else {
        res.status(400).json({ "error": "Bad body format. Not an array" })
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));

const getDataFromSkapiec = (query) => {
    return new Promise((resolve, reject) => {

        request("https://www.skapiec.pl/szukaj/w_calym_serwisie/" + query, function (error, response, body) {
            var parser = new DomParser();
            var doc = parser.parseFromString(body, "text/html");
            var boxes = doc.getElementsByClassName("box-row js");
            var jsonScripts = [];
            Array.prototype.forEach.call(boxes, (el) => {
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

const getProductDetails = (productId) => {
    return new Promise((resolve, reject) => {
        request("https://www.skapiec.pl/site/cat/200/comp/" + productId, function (error, response, body) {
            var parser = new DomParser();
            var doc = parser.parseFromString(body, "text/html");
            var bestOffers = doc.getElementsByClassName("offers-list promo js");
            var allOffers = doc.getElementsByClassName("offers-list all js");
            var allOfferRows = parser.parseFromString(allOffers[0].innerHTML).getElementsByTagName("a");
            var bestOfferRows = parser.parseFromString(bestOffers[0].innerHTML).getElementsByTagName("a");
            var allItemOffers = [];
            Array.prototype.forEach.call(bestOfferRows, (el) => {
                const priceHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-value");
                if (priceHtml[0] != undefined) {
                    var price = parser.parseFromString(priceHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var descriptionHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-details-desc");
                    var description = parser.parseFromString(descriptionHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var sectionShopLogo = parser.parseFromString(el.innerHTML).getElementsByClassName("section-shop-logo");
                    const x = parser.parseFromString(sectionShopLogo[0].innerHTML);
                    const src = x.getElementsByTagName('img')[0].getAttribute('src');
                    const alt = x.getElementsByTagName('img')[0].getAttribute('alt');
                    const deliveryHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-cost");
                    const aHref = parser.parseFromString(deliveryHtml[0].innerHTML);
                    const delivery = aHref.getElementsByTagName('a');
                    const deliverySpan = aHref.getElementsByTagName('span');
                    if (delivery[0] != undefined) {
                        let phpScript = delivery[0].getAttribute('href');
                        const deliveryCost = getDeliveryCostFromPhp(phpScript);
                        deliveryCost.then(function(value) {
                            allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : value });
                        }, function() {
                            allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : 'No info'});
                        });
                    } else if (deliverySpan[0] != undefined) {
                        allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : '0.00 zł'});
                    } else {
                        allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : 'No info'});
                    }
                }
            });

            Array.prototype.forEach.call(allOfferRows, (el, index, array) => {
                const priceHtml2 = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-value");
                if (priceHtml2[0] != undefined) {
                    var price = parser.parseFromString(priceHtml2[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var descriptionHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-details-desc");
                    var description = parser.parseFromString(descriptionHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
                    var sectionShopLogo = parser.parseFromString(el.innerHTML).getElementsByClassName("section-shop-logo");
                    const x = parser.parseFromString(sectionShopLogo[0].innerHTML);
                    const src = x.getElementsByTagName('img')[0].getAttribute('src');
                    const alt = x.getElementsByTagName('img')[0].getAttribute('alt');
                    const deliveryHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-cost");
                    const aHref = parser.parseFromString(deliveryHtml[0].innerHTML);
                    const delivery = aHref.getElementsByTagName('a');
                    const deliverySpan = aHref.getElementsByTagName('span');
                    if (delivery[0] != undefined) {
                        let phpScript = delivery[0].getAttribute('href');
                        const deliveryCost = getDeliveryCostFromPhp(phpScript);
                        deliveryCost.then(function(value) {
                            allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : value });
                            if (index === array.length - 1) {
                                if (allItemOffers.length > 0) {
                                    resolve(allItemOffers); // fulfilled
                                } else {
                                    reject("No scripts to be had");
                                }
                            }
                        }, function() {
                            allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : 'No info'});
                            if (index === array.length - 1) {
                                if (allItemOffers.length > 0) {
                                    resolve(allItemOffers); // fulfilled
                                } else {
                                    reject("No scripts to be had");
                                }
                            }
                        });
                    } else if (deliverySpan[0] != undefined) {
                        allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : '0.00 zł'});
                        if (index === array.length - 1) {
                            if (allItemOffers.length > 0) {
                                resolve(allItemOffers); // fulfilled
                            } else {
                                reject("No scripts to be had");
                            }
                        }
                    } else {
                        allItemOffers.push({"price" : price, "description" : description, "imgUrl" : src, "shopName" : alt, "delivery" : 'No info'});
                        if (index === array.length - 1) {
                            if (allItemOffers.length > 0) {
                                resolve(allItemOffers); // fulfilled
                            } else {
                                reject("No scripts to be had");
                            }
                        }
                    }
                }
            });
        });
    });
}

const getDeliveryCostFromPhp = (query) => {
    return new Promise((resolve, reject) => {
        request("https://www.skapiec.pl/" + query, function (error, response, body) {
            try {
                const parser = new DomParser();
                const doc = parser.parseFromString(body, "text/html");
                const tableRow = doc.getElementsByClassName('even');
                const rowFromTableRow = parser.parseFromString(tableRow[0].innerHTML);
                const bTag = rowFromTableRow.getElementsByTagName('b');
                const price = bTag[0].textContent.split('\n').join('');
                resolve(price);
            }
            catch(error) {
                console.error(error);
                reject('Could not get price');
            }
        });
    });
}

const calculateBestPriceFromOneShop = () => {
    const prices1 = {"xkom.pl" : [220, 230, 500], "emag.pl" : [220, 210, 510], "morele.net" : [220, 247, 543], "empik.pl" : [220, 220, 430]}
    var lowestPrice = 0;
    var selectedShop;
    Object.entries(prices1).forEach( (value, index) => {
        const key = value[0];
        const prices = value[1];
        const sum = prices.reduce((a, b) => a + b);
        if (index == 0 || lowestPrice > sum) {
            lowestPrice = sum;
            selectedShop = key;
        }
    });
    console.log(lowestPrice);
    console.log(selectedShop);
}

const calculateBestPriceFromDifferentShops = () => {
    const prices1 = {"xkom.pl" : [220, 230, 500], "emag.pl" : [220, 210, 510], "morele.net" : [220, 247, 543], "empik.pl" : [220, 220, 430]}
    var lowestPrice = [];
    var selectedShops = [];
    const firstShop = Object.entries(prices1)[0];
    firstShop[1].forEach((price) => {
        selectedShops.push(firstShop[0]);
        lowestPrice.push(price);
    });
    const numberOfShops = Object.entries(prices1).length;
    for (let i = 1; i < numberOfShops; i++) {
        const shop = Object.entries(prices1)[i];
        shop[1].forEach((price2, index) => {
            if (lowestPrice[index] > price2) {
                lowestPrice[index] = price2;
                selectedShops[index] = shop[0];
            }
        });
    }

    const totalPrice = lowestPrice.reduce((a, b) => a + b);

    console.log(lowestPrice);
    console.log(selectedShops);
    console.log(totalPrice);
}

