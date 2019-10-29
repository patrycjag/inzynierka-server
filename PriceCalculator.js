
const calculateBestPriceFromOneShop = (prices) => {
    let lowestPrice = null;
    let selectedShop;
    for ([key, value] of Object.entries(prices)) {
        const sum = Object.values(value).reduce((a, b) => a + b);
        if (lowestPrice === null || lowestPrice > sum) {
            lowestPrice = sum;
            selectedShop = key;
        }
    };
    return { selectedShop, lowestPrice };
}

const calculateBestPriceFromDifferentShops = (prices1) => {
    const lowestPrice = [];
    const selectedShops = [];
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
}

module.exports = {
    calculateBestPriceFromOneShop,
    calculateBestPriceFromDifferentShops
};