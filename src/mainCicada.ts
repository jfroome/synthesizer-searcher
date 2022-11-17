import { PlaywrightCrawler,log } from 'crawlee';
import { cicadaRouter } from "./routes/CicadaRouter.js";




// This is better set with CRAWLEE_LOG_LEVEL env var
// or a configuration option. This is just for show 😈
log.setLevel(log.LEVELS.INFO);

log.debug('Setting up crawler.');

const crawler = new PlaywrightCrawler({
    //maxRequestsPerCrawl: 5,
    requestHandler: cicadaRouter,
    headless: true,
    // maxRequestRetries: 1,
    // requestHandlerTimeoutSecs: 2,
    // minConcurrency: 2,
    // maxConcurrency: 5,
});

log.debug('Adding requests to the queue.');
await crawler.addRequests(['https://cicadasound.ca/collections/used']);
await crawler.run();
