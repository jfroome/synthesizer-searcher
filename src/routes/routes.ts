import { createPlaywrightRouter, Dataset } from 'crawlee';

export const router = createPlaywrightRouter();
router.addHandler('DETAILS', async ({ request, page, log }) => {
    log.debug(`Extracting data: ${request.url}`)
    const urlParts = request.url.split('/').slice(-2);

    const results = {
        url: request.url,
        title: await page.locator('.title.may-blank.outbound').textContent(),
    }

    log.debug(`Saving data: ${request.url}`)
    await Dataset.pushData(results);
});

router.addDefaultHandler(async ({ request, page, enqueueLinks, log }) => {
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