import { createPlaywrightRouter, Dataset, PlaywrightCrawler } from 'crawlee';
import { Listing } from "../models/listing.js";
import { createTokens } from "../util/createTokens.js";
import { createUID } from "../util/createUID.js";


export const router = createPlaywrightRouter();
router.addHandler('KIJIJI_NEXT',async ({ request, page, enqueueLinks, log }) => {

        log.info("Crawling " + request.url);

        await enqueueLinks({
            selector: 'div.pagination > a[title="Next"]',
            label: 'KIJIJI_NEXT'
        })
        await enqueueLinks({
            selector: 'div.info-container > div.title > a.title',
            label: 'KIJIJI_DETAILS'
        })
});

router.addHandler('KIJIJI_DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`);
    log.info("Scraping " + request.url);

    //title
    const title = await page.locator('h1[itemprop="name"]').textContent();

    //description
    const description = await (await page.locator('span[itemscope] > div[itemprop="description"]').first().allInnerTexts()).join('\n');

    //price
    // const priceString = await page.locator('div[class*="mainColumn"] > div > div > span > span[itemprop="price"]').textContent();
    // const priceNoDollarSign = priceString?.split("$").join().[1] ?? "";
    // const price: number = parseFloat(priceNoDollarSign) ?? 0;

    //uid hash
    let seed = request.url;
    const uid = createUID(seed);

    const listing: Listing = {
        uid: uid,
        title: title,
        description: description,
        price: price,
        shipping: null,
        currency: "CAD",
        site: "https://www.kijiji.ca/",
        url: request.url,
        posted: null,
        tags: createTokens(title),
        inStock: true // if its listed its in stock at this store
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});