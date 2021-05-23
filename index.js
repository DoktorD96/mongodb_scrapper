var config = require('./modules/config');
var TIK = require('./modules/start_tiktok');
const Xvfb = config.mode ? require('xvfb') : null;

(async () => {

    TIK.start();
    TIK.sleep(5 * 60 * 60); // 5 min



    // try {
    //     if (config.mode == "server") {
    //         var xvfb = new Xvfb({
    //             silent: true,
    //             xvfb_args: ["-screen", "0", '800x600x24', "-ac"],
    //         });
    //         xvfb.start((err) => { if (err && config.log) console.error(err) })
    //     }

    //     var configpup = config.settings;
    //     if (config.mode == "server") {
    //         configpup.args.push('--display=' + xvfb._display);
    //         configpup.args.push('--single-process');
    //         configpup.args.push('--start-fullscreen');
    //     }

    //     if (config.mode == "local") {
    //         configpup.args.push("--window-size=400,800");
    //         configpup.args.push("--window-position=0,0");
    //     }



    //     browsercon = await puppeteer.launch(configpup);
    //     //browsercon = await browser.createIncognitoBrowserContext();

    //     if (config.log) {
    //         console.log("Opening the browser......");
    //     }
    // } catch (err) {
    //     if (config.log) {
    //         console.log("Could not create a browser instance => : ", err);
    //     }
    // }
    // const pages = await browsercon.pages();
    // const page = pages[0];




    // await page.exposeFunction("nodeLog", nodeLog);
    // await page.goto(`https://www.tiktok.com/tag/makeup?is_copy_url=1&is_from_webapp=v1`, {});
    // await page.evaluate(async ({ scrapped, sc_len }) => {
    //     try {
    //         //await nodeLog(document.querySelector("div.share-layout-content").innerHTML.trim());
    //         setInterval(async function () {
    //             await nodeLog("interval");
    //             try {
    //                 document.documentElement.scrollTop = 1e35;
    //                 var a = document.querySelectorAll("div.video-feed-item a[href]").length;
    //                 //document.querySelectorAll("a.video-feed-item-wrapper[href]").length;
    //                 if (true || config.log) {
    //                     //await nodeLog(a);
    //                 }
    //                 scrapped = [];
    //                 if (document.querySelectorAll("div.video-feed-item a[href]").length == sc_len) {
    //                     await nodeLog("equal");
    //                     document.querySelectorAll("div.video-feed-item a[href]").forEach(async function (element) {
    //                         let t = element.getAttribute("href");
    //                         t = t.substring(t.indexOf("@"));
    //                         t = t.substring(0, t.indexOf("/"));
    //                         scrapped.push(t);
    //                     }
    //                     );
    //                     if (true || config.log) {
    //                         await nodeLog("Finall");
    //                         await nodeLog(scrapped.length);
    //                     }
    //                 } else {
    //                     await nodeLog("not equal");
    //                     if (true || config.log) {
    //                         sc_len = document.querySelectorAll("div.video-feed-item a[href]").length;
    //                         await nodeLog(sc_len);
    //                     }
    //                 }

    //             } catch (e) {
    //                 await nodeLog(e.message);
    //                 if (config.log) {
    //                     await nodeLog("error 1");
    //                     await nodeLog(JSON.stringify(e));
    //                 }
    //             }
    //         }, 10000);
    //     } catch (e) {
    //         if (config.log) {
    //             await nodeLog("error 2");
    //             await nodeLog(JSON.stringify(e));
    //         }
    //     }
    // }, { scrapped, sc_len });
    // await page.setDefaultTimeout(5 * 60 * 60);
    // const image = await page.screenshot({
    //     quality: 65,
    //     type: "jpeg",
    //     encoding: "base64"
    // });
    // if (config.log && false) {
    //     console.log(image);
    // }
    // await sleep(5 * 60 * 60);
    // await browsercon.close();

    // if (config.mode == "server") {
    //     xvfb.stop();
    // }

})()

