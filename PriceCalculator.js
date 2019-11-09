
const calculateBestPriceFromOneShop = (prices) => {
    let lowestPrice = null;
    let selectedShop;
    for (let [key, value] of Object.entries(prices)) {
        const sum = Object.values(value).reduce((a, b) => a + b);
        if (lowestPrice === null || lowestPrice > sum) {
            lowestPrice = sum;
            selectedShop = key;
        }
    }
    return { selectedShop, lowestPrice };
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