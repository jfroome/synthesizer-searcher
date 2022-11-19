import { PlaywrightCrawler, log} from 'crawlee';
import { router } from "./routes/CicadaRouter.js";

log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');

const crawler = new PlaywrightCrawler({
    requestHandler: router,
    headless: false,
});

log.debug('Adding requests to the queue.');

await crawler.addRequests(
    [
        {
            label: 'CICADA_NEXT',
            url: 'https://cicadasound.ca/collections/used'
        }
    ]);

await crawler.run();
