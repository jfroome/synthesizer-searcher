import { createPlaywrightRouter, Dataset } from 'crawlee';
import { Listing } from "../models/listing.js";
import { createTokens } from "../util/createTokens.js";
const { createHash } = await import('node:crypto');
export const cicadaRouter = createPlaywrightRouter();

cicadaRouter.addHandler('DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`);
    log.info("***Scraping " + request.url);
    
    //title
    const title = await page.locator('h1.product-title-block').textContent();

    //description
    const description = await page.locator('div.product-block-area > div.js-enabled.accordian.mt-8 > div.rte.mb-8 > p:first-child').textContent();

    //price
    const priceString = await page.locator('span[data-product-price]').textContent();
    const priceNoDollarSign = priceString?.split("$")[1] ?? "";
    const price: number = parseFloat(priceNoDollarSign);

    //uid hash
    const dataProductJsonString = await page.locator('script[data-product-json]').textContent();
    let dataProductJson = ""; 
    let uid = "";
    if(dataProductJsonString != null){
        dataProductJson = JSON.parse(dataProductJsonString);
        let id = request.url + dataProductJson['id' as keyof string];
        uid = createHash('sha1').update(id.toString()).digest('base64');
    }

    const listing: Listing = {
        uid: uid,
        title: await page.locator("h1.product-title-block").textContent(),
        description: description,
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

cicadaRouter.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
    log.info("***Crawling " + request.url);
    await page.waitForSelector('ul.pagination.flex.items-center > li > a');
    if(!request.url.includes('?page')){
        await enqueueLinks({
            selector: 'ul.pagination.flex.items-center > li > a',
            label: 'NEXT', // <= note the different label
            
        })
    }
    //await page.waitForSelector('a.increase-target[href*="products"]');
    const infos = await enqueueLinks({
        selector: 'a.increase-target[href*="products"]',
        label: 'DETAILS', // <= note the different label,
        limit: 12
        
    })
    if (infos.processedRequests.length === 0) log.info(`${request.url} is the last page!`);
    
});