var config = require('./config');
const Xvfb = config.mode ? require('xvfb') : null;

if (config.mode == "local") {

}
if (config.mode == "test") {
    config.log = true;
}

var EXPORT = {};


const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

EXPORT.br = null;
EXPORT.XVFB = null;
EXPORT.PAGE = null;

// sleep funkcija

EXPORT.sleep = function (sleep) {
    return new Promise(function (resolve) {
        setTimeout(function () { resolve("true"); }, sleep * 1000);
    });
}

var scrapped = [];
var sc_len = -1;


// node log funkcija unutar content scripte

EXPORT.nodelogmsg = function (logg) {
    try {
        if (config.log) {
            console.log(logg);
        }
    } catch (err) {
        if (config.log) {
            console.log("Log message error => :", err);
        }
    }
};

// close browser instance

EXPORT.close = async function () {
    try {
        if (config.log) {
            console.log("closing browser");
        }
        await EXPORT.br.close();
    } catch (err) {
        if (config.log) {
            console.log("Closing error => :", err);
        }
    }
}

// browser start funkcija

EXPORT.start = async function () {
    try {

        if (config.mode == "server") {
            EXPORT.XVFB = new Xvfb({
                silent: true,
                xvfb_args: ["-screen", "0", '800x600x24', "-ac"],
            });
            EXPORT.XVFB.start((err) => { if (err && config.log) console.error(err) })
        }

        var configpup = config.settings;
        if (config.mode == "server") {
            configpup.args.push('--display=' + EXPORT.XVFB._display);
            configpup.args.push('--single-process');
            configpup.args.push('--start-fullscreen');
        }

        if (config.mode == "local") {
            configpup.args.push("--window-size=400,800");
            configpup.args.push("--window-position=0,0");
        }

        EXPORT.br = await puppeteer.launch(configpup);

        if (config.log) {
            console.log("Opening the browser......");
        }
    } catch (err) {
        if (config.log) {
            console.log("Could not create a browser instance => : ", err);
        }
    }
}



// open desired page

EXPORT.openpage = async function (pageurl, optimize) {
    try {
        if (config.log) {
            console.log("Opening page url \n" + pageurl + "\n");
        }
        const pages = await EXPORT.br.pages();
        EXPORT.PAGE = pages[0];
        if (optimize) {
            EXPORT.optimizemem();
        }
        await EXPORT.PAGE.goto(pageurl, {});

        // binding log function inside content script

        await EXPORT.PAGE.exposeFunction("nodeLog", EXPORT.nodelogmsg);

    } catch {
        if (config.log) {
            console.log("Open page error => : ", err);
        }
    }
}

// optimize memory which tab consume by blocking media elements

EXPORT.optimizemem = async function () {
    try {

        if (config.log) {
            console.log("Block CSS and MEDIA to free memory space");
        }

        // block unwanted resources like css, images and videos
        // to free memory space

        await EXPORT.PAGE.setRequestInterception(true);
        EXPORT.PAGE.on('request', request => {
            if (
                request.resourceType() === 'image'
                || request.resourceType() === 'stylesheet'
                || request.resourceType() === 'media'
                || request.resourceType() === 'font'
                || request.resourceType() === 'webp'
                || request.resourceType() === 'jpeg'
                || request.url().endsWith('.png')
                || request.url().endsWith('.jpg')
                || request.url().endsWith('.jpeg')
                || request.url().endsWith('.webp')
                || request.url().endsWith('.css')
            )
                request.abort();
            else
                request.continue();
        });

    } catch {
        if (config.log) {
            console.log("Optimization error  => : ", err);
        }
    }
}

// infinite scrool of page

EXPORT.infinitescrool = async function (pageurl) {
    try {
        if (config.log) {
            console.log("Start infinite scrolling.");
        }

        await EXPORT.PAGE.evaluate(() => {
            setInterval(async function () {
                document.documentElement.scrollTop = 1e35;
                await nodeLog(document.querySelectorAll("div.video-feed-item a[href]").length);
            }, 10000)
        });

        // await EXPORT.PAGE.evaluate(async () => {
        //     await nodeLog("2 evaluate testing");
        // });

    } catch {
        if (config.log) {
            console.log("Scroll error => : ", err);
        }
    }
}


module.exports = EXPORT;