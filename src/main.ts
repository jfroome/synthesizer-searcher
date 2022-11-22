import { PlaywrightCrawler, log } from 'crawlee';
import { router } from "./routes/MainRouter.js";
import { QueueManager } from "./queueManager.js";
log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');
const crawler = new PlaywrightCrawler({
    // maxRequestsPerCrawl: 1000,
    requestHandler: router,
    headless: true,
});
log.debug('Adding requests to the queue.');
await crawler.addRequests(
    [
        {
            label: 'CICADA_NEXT',
            url: 'https://cicadasound.ca/collections/used'
        },
        // {
        //     label: 'SM_NEXT',
        //     url: 'https://www.spacemanmusic.com/shop/'
        // },
        // {
        //     label: 'MOOG_NEXT',
        //     url: 'https://moogaudio.com/collections/sales'
        // }
        // ,
        // {
        //     label: 'KIJIJI',
        //     url: 'https://www.kijiji.ca/'
        // }
    ]);
await crawler.run();