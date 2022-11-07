import { createPlaywrightRouter, Dataset } from 'crawlee';

// createPlaywrightRouter() is only a helper to get better
// intellisense and typings. You can use Router.create() too.
export const router = createPlaywrightRouter();

// This replaces the request.label === DETAIL branch of the if clause.
router.addHandler('DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`)
    const urlParts = request.url.split('/').slice(-2);
    // const modifiedTimestamp = await page.locator('time[datetime]').getAttribute('datetime');
    // const runsRow = page.locator('ul.ActorHeader-stats > li').filter({ hasText: 'Runs' });
    // const runCountString = await runsRow.locator('span').last().textContent();

    const results = {
        url: request.url,
        // uniqueIdentifier: urlParts.join('/'),
        // owner: urlParts[0],
        title: await page.locator('.title.may-blank.outbound').textContent(),
        // description: await page.locator('span.actor-description').textContent(),
        // modifiedDate: new Date(Number(modifiedTimestamp)),
        
    }

    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(results);
});

// This is a fallback route which will handle the start URL
// as well as the LIST labelled URLs.
router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
    // log.debug(`Enqueueing pagination: ${request.url}`)
    // await page.waitForSelector('.ActorStorePagination-pages a');
    // await enqueueLinks({
    //     selector: '.ActorStorePagination-pages > a',git a
    //     label: 'LIST',
    // })

    log.debug(`Enqueueing actor details: ${request.url}`)
    await page.waitForSelector('span.next-button');
    await enqueueLinks({
        selector: 'span.next-button',
        label: 'NEXT', // <= note the different label
    })
    
    log.debug(`Enqueueing actor details: ${request.url}`)
    await page.waitForSelector('a.comments');
    await enqueueLinks({
        selector: 'a.comments',
        label: 'DETAILS', // <= note the different label
    })
});