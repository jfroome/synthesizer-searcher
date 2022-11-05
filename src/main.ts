// For more information, see https://crawlee.dev/
import { PlaywrightCrawler, Dataset, CheerioCrawler } from 'crawlee';

// PlaywrightCrawler crawls the web using a headless
// browser controlled by the Playwright library.
const crawler = new CheerioCrawler({
    // Use the requestHandler to process each of the crawled pages.
    async requestHandler({ request, enqueueLinks, log }) {
        const title = $('h3').text();
        log.info(`Title of ${request.loadedUrl} is '${title}'`);

        // Save results as JSON to ./storage/datasets/default
        await Dataset.pushData({ title, url: request.loadedUrl });

        // Extract links from the current page
        // and add them to the crawling queue.
        await enqueueLinks();
    },
    // Uncomment this option to see the browser window.
   // headless: false,
});

// Add first URL to the queue and start the crawl.
await crawler.run(['https://old.reddit.com/r/SomebodyMakeThis/']);
