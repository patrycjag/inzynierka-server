const express = require('express');
const app = express();
const cors = require('cors');
const Promise = require('bluebird');

const {getDataFromSkapiec, getProductDetails} = require('./HTMLParser');
const {calculateBestPriceFromDifferentShops, calculateBestPriceFromOneShop} = require('./PriceCalculator');

app.use(cors());

//Endpoint for getting products based on product name
app.get('/api/v1/product', (req, res) => {
    getDataFromSkapiec(req.query.productName)
        .then((value) => {
            res.status(200).json(value);
        })
        .catch((err) => {
            console.error(err);
            res.status(404).json({"error": "Could not find any matching products."});
        });
});

//Endpoint for getting the product details, including all shop offers for the product
//Can be used to get multiple products at once
app.get('/api/v1/product/:productIds', (req, res) => {
    Promise.mapSeries(req.params.productIds.split(','), (productId) => getProductDetails(productId))
        .then((value) => {
            res.status(200).json(value)
        })
        .catch((err) => {
            console.error(err);
            res.status(404).json({"error": "Could not find any matching products."});
    });
});

//Endpoint for calculating the best deals from the group of id's provided in the url
//Takes into account provided options: singleShop and includeDelivery
app.get('/api/v1/product/:productIds/deals', (req, res) => {
    const productIds = req.params.productIds.split(',');
    Promise.mapSeries(productIds, (productId) => getProductDetails(productId))
        .then((values) => {
            const productsForCalculation = {};
            //Create an object that can be usable by the price calculator
            for (const [index, product] of values.entries()) {
                for (const offer of product) {
                    if (!productsForCalculation[offer.shopName]) {
                        productsForCalculation[offer.shopName] = {};
                    }
                    //If we didn't manage to get information about the delivery cost, insert 0 to calculate the price
                    productsForCalculation[offer.shopName][index] = Math.min(offer.price + ((typeof req.query.includeDelivery !== 'undefined') ? (offer.delivery || 0) : 0), productsForCalculation[offer.shopName][index] || Infinity);
                }
            }
            if (typeof req.query.singleShop !== 'undefined') {
                //If we cannot buy all of the products in a specific shop, remove the entry
                for (let [key, value] of Object.entries(productsForCalculation)) {
                    if (Object.values(value).length !== productIds.length) {
                        delete productsForCalculation[key];
                    }
                }
                //Check if any shop has all the products
                if (Object.values(productsForCalculation).length) {
                    return res.status(200).json(calculateBestPriceFromOneShop(productsForCalculation));
                } else {
                    return res.status(400).json({"error": "No single shop has these products."});
                }
            } else {
                return res.status(200).json(calculateBestPriceFromDifferentShops(productsForCalculation))
            }
        })
        .catch((err) => {
            console.error(err);
            res.status(404).json({"error": "Could not find any matching products."});
        });
});

app.listen(3000, () => console.log('Server running on port 3000'));

