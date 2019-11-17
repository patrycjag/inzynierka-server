
const calculateBestPriceFromOneShop = (prices) => {
    let bestPrice = null;
    let selectedShop;
    let pricesFromBestShop;
    for (let [key, value] of Object.entries(prices)) {
        const sum = Object.values(value).reduce((a, b) => a + b);
        if (bestPrice === null || bestPrice > sum) {
            bestPrice = sum;
            selectedShop = key;
            pricesFromBestShop = Object.values(value);
        }
    }
    return { selectedShop, bestPrice, pricesFromBestShop };
};

const calculateBestPriceFromDifferentShops = (prices) => {
    const bestPrices = {};
    for (let [key, shop] of Object.entries(prices)) {
        for (let [productKey, price] of Object.entries(shop)) {
            if (!bestPrices[productKey]) {
                bestPrices[productKey] = {
                    shopName : null,
                    bestPrice : Infinity
                }
            }
            if (price < bestPrices[productKey].bestPrice) {
                bestPrices[productKey].shopName = key;
                bestPrices[productKey].bestPrice = price;
            }
        }
    }
    return bestPrices;
};

module.exports = {
    calculateBestPriceFromOneShop,
    calculateBestPriceFromDifferentShops
};