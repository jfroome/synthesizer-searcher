import { PlaywrightCrawler,log } from 'crawlee';
import { router } from "./routes/routes.js";


// This is better set with CRAWLEE_LOG_LEVEL env var
// or a configuration option. This is just for show 😈
log.setLevel(log.LEVELS.DEBUG);

log.debug('Setting up crawler.');

const crawler = new PlaywrightCrawler({
    requestHandler: router,
    headless: false
});

log.debug('Adding requests to the queue.');
await crawler.addRequests(['https://old.reddit.com/r/SomebodyMakeThis/']);
await crawler.run();
