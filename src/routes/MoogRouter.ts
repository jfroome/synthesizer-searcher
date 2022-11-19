import { createPlaywrightRouter, Dataset, PlaywrightCrawler } from 'crawlee';
import { Listing } from "../models/listing.js";
import { createTokens } from "../util/createTokens.js";
import { createUID } from "../util/createUID.js";
import { parsePriceString } from '../util/parsePriceString.js';

export const router = createPlaywrightRouter();
router.addHandler('MOOG_NEXT', async ({ request, enqueueLinks, log }) => {
    log.info("Crawling " + request.url);
    // await enqueueLinks({
    //     selector: 'a.pagination__next.link',
    //     label: 'MOOG_NEXT'
    // })
    await enqueueLinks({
        selector: 'a.product-item__title.text--strong.link',
        label: 'MOOG_DETAILS'
    })
});

router.addHandler('MOOG_DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`);
    log.info("Scraping " + request.url);

    //title
    const title = await page.locator('h1.product-meta__title.heading').textContent();

    //description
    const description = await page.locator('div.rte.text--pull').allInnerTexts();

    //price
    const priceString = await page.locator('div.price-list > span.price.price--highlight').first().textContent();
    
    //uid hash
    const seed = await page.locator('div.product-meta > #ssw-avg-rate-profile-html').getAttribute('data-product-id');

    //in stock
    const inStock = await page.locator('span.product-form__info-title.text--strong.with-status-colour').first().textContent();

    const listing: Listing = {
        uid: createUID(seed),
        title: title,
        description: description.join('\n'),
        price: parsePriceString(priceString),
        shipping: null,
        currency: "CAD",
        site: "https://moogaudio.com/",
        url: request.url,
        posted: null,
        tags: createTokens(title),
        inStock: inStock == "In Stock" 
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});