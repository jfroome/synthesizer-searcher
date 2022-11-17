import { createPlaywrightRouter, Dataset, PlaywrightCrawler } from 'crawlee';
import { Listing } from "../models/listing.js";
import { createTokens } from "../util/createTokens.js";
import { createUID } from "../util/createUID.js";

// https://cicadasound.ca/collections/used

export const router = createPlaywrightRouter();
router.addHandler('CICADA_NEXT',async ({ request, page, enqueueLinks, log }) => {

        log.info("Crawling " + request.url);
        await page.waitForSelector('ul.pagination.flex.items-center > li > a');
        if (!request.url.includes('?page')) {
            await enqueueLinks({
                selector: 'ul.pagination.flex.items-center > li > a',
                label: 'CICADA_NEXT',
            })
        }
        await enqueueLinks({
            selector: 'a.increase-target[href*="products"]',
            label: 'CICADA_DETAILS',
            limit: 12
        })
});

router.addHandler('CICADA_DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`);
    log.info("Scraping " + request.url);

    //title
    const title = await page.locator('h1.product-title-block').textContent();

    //description
    const description = await page.locator('div.product-block-area > div.js-enabled.accordian.mt-8 > div.rte.mb-8').allInnerTexts();

    //price
    const priceString = await page.locator('span[data-product-price]').textContent();
    const priceNoDollarSign = priceString?.split("$")[1] ?? "";
    const price: number = parseFloat(priceNoDollarSign);

    //uid hash
    const dataProductJsonString = await page.locator('script[data-product-json]').textContent();
    let dataProductJson = "";
    let uid = "";
    if (dataProductJsonString != null) {
        dataProductJson = JSON.parse(dataProductJsonString);
        let seed = request.url + dataProductJson['id' as keyof string];
        uid = createUID(seed);
    }

    const listing: Listing = {
        uid: uid,
        title: await page.locator("h1.product-title-block").textContent(),
        description: description.join('\n'),
        price: price,
        shipping: null,
        currency: "CAD",
        site: "https://cicadasound.ca/",
        url: request.url,
        posted: null,
        tags: createTokens(title)
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});