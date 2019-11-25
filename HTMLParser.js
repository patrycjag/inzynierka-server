const request = require('request-promise')
const DomParser = require('dom-parser');
const parser = new DomParser();
const Promise = require('bluebird');
const unescape = require('unescape');

const getDataFromSkapiec = async (query) => {
    const body = await request("https://www.skapiec.pl/szukaj/w_calym_serwisie/" + query);
    const boxes = parser.parseFromString(body, "text/html").getElementsByClassName("box-row js");
    //All of the product information is stored inside a script in the html, which is a JSON format
    //This simplifies the process web scraping
    return boxes
        .map((el) => parser.parseFromString(el.innerHTML).getElementsByTagName("script")[0])
        .filter((el) => el)
        .map((el) => JSON.parse(el.innerHTML));
}

const getProductDetails = async (productId) => {
    const body = await request("https://www.skapiec.pl/site/cat/200/comp/" + productId);
    const doc = parser.parseFromString(body, "text/html");
    const bestOffers = doc.getElementsByClassName("offers-list promo js");
    const allOffers = doc.getElementsByClassName("offers-list all js");
    const allOfferRows = parser.parseFromString(allOffers[0].innerHTML).getElementsByTagName("a");
    const bestOfferRows = parser.parseFromString(bestOffers[0].innerHTML).getElementsByTagName("a");
    //Combine the sponsored offers with the rest
    const offerRows = [...allOfferRows, ...bestOfferRows];
    const offerEntities = offerRows.map((el) => {
        const priceHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-value");
        if (!priceHtml[0]) {
            return null
        }

        const price = parser.parseFromString(priceHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
        const descriptionHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-details-desc");
        const description = parser.parseFromString(descriptionHtml[0].innerHTML).getElementsByTagName("span")[0].textContent;
        const sectionShopLogo = parser.parseFromString(el.innerHTML).getElementsByClassName("section-shop-logo");
        const x = parser.parseFromString(sectionShopLogo[0].innerHTML);
        const src = x.getElementsByTagName('img')[0].getAttribute('src');
        const alt = x.getElementsByTagName('img')[0].getAttribute('alt');
        const deliveryHtml = parser.parseFromString(el.innerHTML).getElementsByClassName("section-price-cost");
        const aHref = parser.parseFromString(deliveryHtml[0].innerHTML);
        const delivery = aHref.getElementsByTagName('a');
        const deliverySpan = aHref.getElementsByTagName('span');
        return {
            "price": parseFloat(price.replace(' ', '').replace(',','.')),
            "description": description,
            "imgUrl": src,
            "shopName": alt,
            //Using unescape to get rid of all the character coding from the delivery url
            //If there is anything in the 'span' that means the delivery is free, if not, check if the 'a' tag exists
            "delivery": (delivery[0] && unescape(delivery[0].getAttribute('href'))) || (deliverySpan[0] && "Free")
        }
    }).filter((el) => el && typeof el.delivery !== "undefined" );

    return Promise.mapSeries(offerEntities, async (el) => {
        return {
            ...el,
            delivery: el.delivery === "Free" ? 0 : await getDeliveryCostFromPhp(el.delivery)
        }
    })
};

const getDeliveryCostFromPhp = async (query) => {
    try {
        const body = await request("https://www.skapiec.pl/" + query);
        const parser = new DomParser();
        const doc = parser.parseFromString(body, "text/html");
        const tableRow = doc.getElementsByClassName('even');
        const rowFromTableRow = parser.parseFromString(tableRow[0].innerHTML);
        const bTag = rowFromTableRow.getElementsByTagName('b');
        const number = parseFloat(bTag[0].textContent.trim().replace(' ', '').replace(',','.'));
        return number
    } catch (error) {
        return null
    }
};

module.exports = {
    getDeliveryCostFromPhp,
    getProductDetails,
    getDataFromSkapiec
};