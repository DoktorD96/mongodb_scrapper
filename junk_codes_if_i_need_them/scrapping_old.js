



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


    //     await page.setDefaultTimeout(5 * 60 * 60);
    //     const image = await page.screenshot({
    //         quality: 65,
    //         type: "jpeg",
    //         encoding: "base64"
    //     });
    //     if (config.log && false) {
    //         console.log(image);
    //     }