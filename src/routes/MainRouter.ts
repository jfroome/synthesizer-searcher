import { createPlaywrightRouter, Dataset } from 'crawlee';
import { Listing } from "../models/listing.js";
import { createTokens } from "../util/createTokens.js";
import { createUID } from "../util/createUID.js";
import { parsePriceString } from '../util/parsePriceString.js';
import { search } from 'kijiji-scraper';
import { QueueManager } from "../queueManager.js";

export const router = createPlaywrightRouter();

router.addHandler('KIJIJI', async ({ log }) => {
    log.info('Scraping from kijiji api.... this will take a few minutes.');
    var results = await search(
        //params
        {
            locationId: 1700184,
            categoryId: 17,
            priceType: "SPECIFIED_AMOUNT"
        },

        //options
        {
            pageDelayMs: 250,
            minResults: 1000,
            resultDetailsDelayMs: 250
        }
    )
    console.log(`${JSON.stringify(results)}`)
    let listings = results.map(jsonData => {
        return <Listing>{
            uid: createUID(jsonData.id),
            title: jsonData.title,
            description: jsonData.description,
            price: jsonData.attributes.price,
            shipping: null,
            currency: "CAD",
            site: "https://kijiji.ca/",
            url: jsonData.url,
            posted: jsonData.date,
            tags: createTokens(jsonData.title),
            inStock: true // if its listed its in stock at this store
        }
    });
    await Dataset.pushData(listings);
});



// Cicada
router.addHandler('CICADA_NEXT', async ({ request, page, enqueueLinks, log }) => {

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

    //uid hash
    const dataProductJsonString = await page.locator('script[data-product-json]').textContent();
    let dataProductJson = "";
    let id;
    if (dataProductJsonString != null) {
        dataProductJson = JSON.parse(dataProductJsonString);
        id = dataProductJson['id' as keyof string];
    }
    let seed = request.url + id;

    const listing: Listing = {
        uid: createUID(seed),
        title: title,
        description: description.join('\n'),
        price: parsePriceString(priceString),
        shipping: null,
        currency: "CAD",
        site: "https://cicadasound.ca/",
        url: request.url,
        posted: null,
        tags: createTokens(title),
        inStock: true // if its listed its in stock at this store
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});

// moog
router.addHandler('MOOG_NEXT', async ({ request, enqueueLinks, log }) => {
    log.info("Crawling " + request.url);
    await enqueueLinks({
        selector: 'a.pagination__next.link',
        label: 'MOOG_NEXT'
    })
    await enqueueLinks({
        selector: 'a.product-item__title.text--strong.link',
        label: 'MOOG_DETAILS'
    })
});

router.addHandler('MOOG_DETAILS', async ({ request, page, log }) => {
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
    log.info(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});

// spaceman
router.addHandler('SM_NEXT', async ({ request, page, enqueueLinks, log }) => {
    log.info("Crawling " + request.url);
    if (!request.url.includes('page')) {
        await page.waitForSelector('ul.page-numbers');
        let pages = await page.locator('li > a:not(.next).page-numbers');
        let maxPage = parseInt(await (await pages.last().allInnerTexts()).join()) ?? 0;
        let urls: string[] = [];
        for (let i = 2; i <= maxPage; i++) {
            urls.push('https://www.spacemanmusic.com/shop/page/' + i + '/');
        }
        await enqueueLinks({
            urls: urls,
            label: 'SM_NEXT'
        })
    }
    await enqueueLinks({
        selector: 'div.info.style-grid1 > div.text-center > a[href*="product"]',
        label: 'SM_DETAILS',
        //limit: 12
    })
});

router.addHandler('SM_DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`);
    log.info("Scraping " + request.url);

    //await page.locator('div[itemscope]').getAttribute('class').then((value) => { return !value?.includes('outOfStock')});
    let isInStock = await page.locator('.outofstock').count() == 0;

    //title
    const title = await page.locator('h1.entry-title').textContent();

    //description
    const description = await page.locator('#tab-description').allInnerTexts();

    //price
    const priceString = await page.locator('p.price').allInnerTexts();
    const priceNoDollarSign = priceString?.join().split("$")[1] ?? "";
    const price: number = parseFloat(priceNoDollarSign);

    //uid hash
    const id = await page.locator('div[itemscope][id*="product"]').getAttribute('id');
    let seed = request.url + id;
    const uid = createUID(seed);


    const listing: Listing = {
        uid: uid,
        title: title,
        description: description.join('\n'),
        price: price,
        shipping: null,
        currency: "CAD",
        site: "https://spacemanmusic.com/",
        url: request.url,
        posted: null,
        tags: createTokens(title),
        inStock: isInStock // if its listed its in stock at this store
    }
    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(listing);
});