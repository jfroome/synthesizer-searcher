import { PlaywrightCrawler, log} from 'crawlee';
import { router } from "./routes/KijijiRouter.js";

log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');

const crawler = new PlaywrightCrawler({
    requestHandler: router,
    headless: true,
});

log.debug('Adding requests to the queue.');

await crawler.addRequests(
    [
        {
            label: 'KIJIJI_NEXT',
            url: 'https://www.kijiji.ca/b-musical-instrument/canada/c17l0',
            skipNavigation: true
        }
    ]);

await crawler.run();
