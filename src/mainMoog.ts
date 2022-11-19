import { PlaywrightCrawler, log} from 'crawlee';
import { router } from "./routes/MoogRouter.js";

log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');

const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 10,
    requestHandler: router,
    headless: false,
});

log.debug('Adding requests to the queue.');

await crawler.addRequests(
    [
        {
            label: 'MOOG_NEXT',
            url: 'https://moogaudio.com/collections/sales'
        }
    ]);

await crawler.run();
