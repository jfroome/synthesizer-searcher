import { PlaywrightCrawler, log} from 'crawlee';
import { router } from "./routes/SpacemanRouter.js";

log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');

const crawler = new PlaywrightCrawler({
    maxRequestsPerCrawl: 100,
    requestHandler: router,
    headless: true,
});

log.debug('Adding requests to the queue.');

await crawler.addRequests(
    [
        {
            label: 'SM_NEXT',
            url: 'https://www.spacemanmusic.com/shop/'
        }
    ]);

await crawler.run();
