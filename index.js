var config = require('./modules/config');

if (config.mode == "server") {
    console.log("yes ");
    const Xvfb = require('xvfb');
} else {
    console.log("not ");
}
console.log(config.mode);
if (config.mode == "local") {

}
if (config.mode == "test") {
    config.log = true;
}

config.log = true;

const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

var browsercon = null;
function sleep(sleep) {
    return new Promise(function (resolve) {
        setTimeout(function () { resolve("true"); }, sleep * 1000);
    });
}
var scrapped = [];
var sc_len = -1;

var nodeLog = function (logg) {
    console.log(logg);
};

(async () => {
    try {
        if (config.mode == "server") {
            var xvfb = new Xvfb({
                silent: true,
                xvfb_args: ["-screen", "0", '800x600x24', "-ac"],
            });
            xvfb.start((err) => { if (err && config.log) console.error(err) })
        }

        var configpup = config.settings;
        if (config.mode == "server") {
            configpup.args.push('--display=' + xvfb._display);
            configpup.args.push('--single-process');
            configpup.args.push('--start-fullscreen');
        }

        if (config.mode == "local") {
            configpup.args.push("--window-size=200,200");
        }



        browsercon = await puppeteer.launch(configpup);
        //browsercon = await browser.createIncognitoBrowserContext();

        if (config.log) {
            console.log("Opening the browser......");
        }
    } catch (err) {
        if (config.log) {
            console.log("Could not create a browser instance => : ", err);
        }
    }
    const pages = await browsercon.pages();
    const page = pages[0];




    await page.exposeFunction("nodeLog", nodeLog);
    await page.goto(`https://www.tiktok.com/tag/makeup?is_copy_url=1&is_from_webapp=v1`, {});
    await page.evaluate(async ({ scrapped, sc_len }) => {
        try {
            //await nodeLog(document.querySelector("div.share-layout-content").innerHTML.trim());
            setInterval(async function () {
                await nodeLog("interval");
                try {
                    document.documentElement.scrollTop = 1e35;
                    var a = document.querySelectorAll("div.video-feed-item a[href]").length;
                    //document.querySelectorAll("a.video-feed-item-wrapper[href]").length;
                    if (true || config.log) {
                        //await nodeLog(a);
                    }
                    scrapped = [];
                    if (document.querySelectorAll("div.video-feed-item a[href]").length == sc_len) {
                        await nodeLog("equal");
                        document.querySelectorAll("div.video-feed-item a[href]").forEach(async function (element) {
                            let t = element.getAttribute("href");
                            t = t.substring(t.indexOf("@"));
                            t = t.substring(0, t.indexOf("/"));
                            scrapped.push(t);
                        }
                        );
                        if (true || config.log) {
                            await nodeLog("Finall");
                            await nodeLog(scrapped.length);
                        }
                    } else {
                        await nodeLog("not equal");
                        if (true || config.log) {
                            sc_len = document.querySelectorAll("div.video-feed-item a[href]").length;
                            await nodeLog(sc_len);
                        }
                    }

                } catch (e) {
                    await nodeLog(e.message);
                    if (config.log) {
                        await nodeLog("error 1");
                        await nodeLog(JSON.stringify(e));
                    }
                }
            }, 10000);
        } catch (e) {
            if (config.log) {
                await nodeLog("error 2");
                await nodeLog(JSON.stringify(e));
            }
        }
    }, { scrapped, sc_len });
    await page.setDefaultTimeout(5 * 60 * 60);
    const image = await page.screenshot({
        quality: 65,
        type: "jpeg",
        encoding: "base64"
    });
    if (config.log && false) {
        console.log(image);
    }
    await sleep(5 * 60 * 60);
    await browsercon.close();

    if (config.mode == "server") {
        xvfb.stop();
    }

})()
