const express = require('express');
const app = express();
const cors = require('cors');
const Promise = require('bluebird');

const fs = require('fs');
const path = require('path');
const morgan = require('morgan');

const {getDataFromSkapiec, getProductDetails} = require('./HTMLParser');
const {calculateBestPriceFromDifferentShops, calculateBestPriceFromOneShop} = require('./PriceCalculator');


app.use(cors());

// log all requests to console
app.use(morgan('dev'));

// log all requests to access.log
app.use(morgan(':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms', {
  stream: fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })
}));

app.get('/api/v1/product', (req, res) => {
    getDataFromSkapiec(req.query.productName)
        .then((value) => {
            res.status(200).json(value);
        })
        .catch((err) => {
            // console.error(err);
            res.status(404).json({"error": "Could not find any matching products."});
        });
});

app.get('/api/v1/product/:productIds', (req, res) => {
    Promise.mapSeries(req.params.productIds.split(','), (productId) => getProductDetails(productId))
        .then((value) => {
            res.status(200).json(value)
        })
        .catch((err) => {
            // console.error(err);
            res.status(404).json({"error": "Could not find any matching products."});
    });
});

app.get('/api/v1/product/:productIds/deals', (req, res) => {
    const productIds = req.params.productIds.split(',');
    Promise.mapSeries(productIds, (productId) => getProductDetails(productId))
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
                for (let [key, value] of Object.entries(productsForCalculation)) {
                    if (Object.values(value).length !== productIds.length) {
                        delete productsForCalculation[key];
                    }
                }
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
            //console.error(err);
            res.status(404).json({"error": "Could not find any matching products."});
        });
});

app.listen(3000, () => console.log('Server running on port 3000'));
