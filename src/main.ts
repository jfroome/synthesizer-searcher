import { PlaywrightCrawler, log } from 'crawlee';
import { router } from "./routes/MainRouter.js";
import { QueueManager } from "./queueManager.js";
log.setLevel(log.LEVELS.INFO);
log.debug('Setting up crawler.');
const crawler = new PlaywrightCrawler({
    // maxRequestsPerCrawl: 1000,
    requestHandler: router,
    headless: false,
});
log.debug('Adding requests to the queue.');

await crawler.addRequests(await QueueManager.getExistingLinks());
await crawler.addRequests(
    [   
        {
            label: 'CICADA_NEXT',
            url: 'https://cicadasound.ca/collections/used'
        },
        {
            label: 'SM_NEXT',
            url: 'https://www.spacemanmusic.com/shop/keyboards/'
        },
        {
            label: 'MOOG_NEXT',
            url: 'https://moogaudio.com/collections/sales?q=synth'
        }, 
        {
            label: 'KIJIJI',
            url: 'https://www.kijiji.ca/'
        }
    ]);
await crawler.run();
await QueueManager.flush();  