//const browserObject = require('./browser');
//const scraperController = require('./pageController')
//Start the browser and create a browser instance
//let browserInstance = browserObject.startBrowser();
// Pass the browser instance to the scraper controller
//scraperController(browserInstance)
//const fs = require('fs');
const Xvfb = require('xvfb');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin())
var browser = null;
function sleep(sleep){
    return new Promise(function(resolve) {
        setTimeout(function(){resolve("true");}, sleep*1000);
    });
}
var scrapped = [];
var sc_len = 0;
var nodeLog = function(logg) { console.log(logg); };
(async () => {
    try {
    var xvfb = new Xvfb({
        silent: true,
        xvfb_args: ["-screen", "0", '800x600x24', "-ac"],
    });
    xvfb.start((err)=>{if (err) console.error(err)})
	browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: ['--disable-setuid-sandbox','--no-sandbox', '--start-fullscreen','--display='+xvfb._display],
        ignoreHTTPSErrors: true
        });
        console.log("Opening the browser......");
    }catch (err){
        console.log("Could not create a browser instance => : ", err);
    }
    const page = await browser.newPage();
    await page.exposeFunction("nodeLog", nodeLog);
    await page.goto(`https://www.tiktok.com/tag/makeup?is_copy_url=1&is_from_webapp=v1`,{});
    //await page.evaluate(async({}) => {
       //         try{
		//await nodeLog(document.querySelector("div.share-layout-content").innerHTML.trim());
		//setInterval(async function(){
		//	try{
                 //       await nodeLog("-------------------");
                   ///     document.documentElement.scrollTop = 1e35;
			//var a = document.querySelectorAll("div.video-feed-item a[href]").length;
			//await nodeLog(a);
                        //var b = document.querySelectorAll("a.video-feed-item-wrapper[href]").length;
                        //await nodeLog(b);
		//	scrapped = [];
//if(document.querySelectorAll("div.video-feed-item a[href]").length == sc_len){
//			document.querySelectorAll("div.video-feed-item a[href]").forEach(async function (element){
//	let t = element.getAttribute("href");
//	t = t.substring(t.indexOf("@"));
//	t = t.substring(0,t.indexOf("/"));
//	scrapped.push(t);
//		}
//		);
//await nodeLog("Finall");
//await nodeLog(scrapped.length);
//}else{
//sc_len = document.querySelectorAll("div.video-feed-item a[href]").length;
//await nodeLog(sc_len);
//}

  //                      }catch(e){await nodeLog("error 1\n");await nodeLog(JSON.stringify(e));}
//		},10000);
  //              }catch(e){await nodeLog("error 2\n");await nodeLog(JSON.stringify(e));}
    //},{});
    //await page.setDefaultTimeout(5*60*60);
    //const base64 = await page.screenshot({ encoding: "base64" });
const image =  await page.screenshot({
quality: 65,
type: "jpeg",
encoding: "base64"
});
//console.log(image);
//fs.writeFile('img.txt', image, function (err) {
//  if (err) return console.log(err);
//});
   // await sleep(5*60*60);
    await browser.close()
    xvfb.stop();
})()
