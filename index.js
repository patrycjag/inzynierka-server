const express = require('express');
const app = express();
const cors = require('cors');
const Promise = require('bluebird');

const {getDataFromSkapiec, getProductDetails} = require('./HTMLParser');
const {calculateBestPriceFromDifferentShops, calculateBestPriceFromOneShop} = require('./PriceCalculator');

app.use(cors());

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

app.get('/api/v1/product/:productIds/deals', (req, res) => {
    Promise.mapSeries(req.params.productIds.split(','), (productId) => getProductDetails(productId))
        .then((values) => {
            const productsForCalculation = {};
            for (const [index, product] of values.entries()) {
                for (const offer of product) {
                    if (!productsForCalculation[offer.shopName]) {
                        productsForCalculation[offer.shopName] = {};
                    }
                    productsForCalculation[offer.shopName][index] = Math.min(offer.price + ((typeof req.query.includeDelivery !== 'undefined') ? (offer.delivery || 0) : 0), productsForCalculation[offer.shopName][index] || Infinity);
                }
            }
            if (typeof req.query.singleShop !== 'undefined') {
                return res.status(200).json(calculateBestPriceFromOneShop(productsForCalculation));
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

