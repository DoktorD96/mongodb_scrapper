var config = require('./config');
//var bigInt = require("big-integer");
//const Realm = require('realm');
//https://stackabuse.com/a-sqlite-tutorial-with-node-js/

const Xvfb = config.mode ? require('xvfb') : null;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tiktok_tags.db');

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



//funkcija koja pretvara image to base64 string

function toDataURL(url) {
    return new Promise(function (resolve) {
        try {
            $.ajax({
                url: url,
                cache: true,
                encode: false,
                type: "GET",
                xhr: function () {
                    var xhr = new XMLHttpRequest();
                    xhr.responseType = 'blob'
                    return xhr;
                },
                error: function () {
                    try {
                        resolve("");
                    } catch (e) { resolve(""); }
                },
                success: function (data) {
                    try {
                        if (data != null && data.type != null
                            && data.type != "" && data.type.trim() != ""
                            && data.type.indexOf("image") > -1) {
                            var reader = new FileReader();
                            reader.onloadend = function () {
                                resolve(reader.result);
                            };
                            reader.readAsDataURL(data);
                        } else {
                            resolve("");
                        }
                    } catch (e) { resolve(""); }
                }
            });
        } catch (e) { resolve(""); }
    });
}

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

EXPORT.inserData = function (data) {
    console.log(BigInt(data.BrojLajkova)); return false;
    var string = "UPDATE `tiktok_uniq_users` (`UserName`,`Keyword`) VALUES ";

    for (var i = 0, l = (data.length - 1); i < l; i++) {
        string += " ('" + data[i] + "','" + EXPORT.keywordnow + "'), ";
    }

    string += " ('" + data[(data.length - 1)] + "','" + EXPORT.keywordnow + "');";



    if (config.log) {
        console.log("Doing insert of " + data.length + " entries.");
    }


    db.run(string, async function (err) {

        if (err) {
            if (config.log) {
                return console.error(err.message);
            }
        }
        if (config.log) {
            console.log("Finished author inserting.");
        }
        //db.close();
        //await EXPORT.close();
        //await EXPORT.sleep(3);
        //if (!(EXPORT.limitnum < 1)) {
        EXPORT.loopfunction();
        //}
    });
}

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
EXPORT.keywordnow = "";
EXPORT.idnow = 0;
EXPORT.started = false;
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
        EXPORT.started = true;
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
            // EXPORT.optimizemem();
        }
        await EXPORT.PAGE.goto(pageurl, {});

        // binding log function inside content script
        //if (EXPORT.started == false) {
        await EXPORT.PAGE.exposeFunction("nodeLog", EXPORT.nodelogmsg);
        await EXPORT.PAGE.exposeFunction("inserData", EXPORT.inserData);
        //}
    } catch (err) {
        if (config.log) {
            //     console.log("Open page error => : ", err);
        }
    }
}


// log network response

EXPORT.lognetwork = function () {
    try {
        if (config.log) {
            console.log("Start request log catching.");
        }
        EXPORT.PAGE.on('response', async (response) => {
            try {
                const request = response.request();
                if (request.url().includes('aid')
                    && request.url().includes('app_name')
                    && request.url().includes('count')
                    && request.url().includes('cursor')
                    && request.url().includes('_signature')
                ) {
                    //const text = await response.text();
                    console.log(request.url() + "\n\n");
                }
            } catch (e) {
                console.log("Err", e)
            }
        })

    } catch (err) {
        //if (config.log) {
        console.log("Request int. error => : ", err);
        ///  }
    }
}



// open desired page

EXPORT.waitfordownload = async function (pageurl, optimize) {
    try {
        if (config.log) {
            console.log("Waiting for all ajax downloads");
        }
        await EXPORT.PAGE.waitForSelector('#outputdata', {
            timeout: 40 * 60 * 1000
        });

    } catch (err) {
        if (config.log) {
            console.log("Waiting error => : ", err);
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

    } catch (err) {
        if (config.log) {
            console.log("Optimization error  => : ", err);
        }
    }
}

// infinite scrool of page
EXPORT.numberofch = 4;
EXPORT.number = 0;

// EXPORT.infinitescrool = async function (pageurl) {
//     EXPORT.numberofch = 4;
//     EXPORT.number = 0;
//     try {
//         if (config.log) {
//             console.log("Start infinite scrolling.");
//         }
//         var number = EXPORT.number;
//         var numberofch = EXPORT.numberofch;
//         await EXPORT.PAGE.evaluate(async ({ number, numberofch }) => {

//             // var text = document.getElementById("__NEXT_DATA__").text;
//             // text = text.substring(text.indexOf("\"viewCount\":") + 12);
//             // text = text.substring(0, text.indexOf("},"));
//             // var int = parseFloat(text);
//             // await nodeLog(int);

//             setInterval(async function () {
//                 document.documentElement.scrollTop = 1e35;
//                 await nodeLog(document.querySelectorAll("div.video-feed-item a[href]").length);
//                 //await nodeLog("numberofch > " + numberofch + " " + " number > " + number);
//                 if (number == document.querySelectorAll("div.video-feed-item a[href]").length) {
//                     numberofch--;
//                 } else {
//                     numberofch = 4;
//                 }

//                 number = document.querySelectorAll("div.video-feed-item a[href]").length;

//                 if (numberofch < 1) {
//                     await nodeLog("Scrapping done\n\n");
//                     var array = document.querySelectorAll("div.video-feed-item a[href]");
//                     var atemp = [];

//                     for (var i = 0, l = array.length; i < l; i++) {
//                         var text = array[i].href;
//                         text = text.substring(24);
//                         text = text.substring(0, text.indexOf("/"));
//                         text = text.trim().toLowerCase();
//                         atemp.push(text);
//                     }

//                     await inserData(atemp);
//                     var jq1 = document.createElement("script");
//                     jq1.type = "text/javascript";
//                     jq1.id = "outputdata";
//                     document.getElementsByTagName("head")[0].appendChild(jq1)
//                     return false;
//                 }
//             }, 15000)
//         }, { number, numberofch });

//         // await EXPORT.PAGE.evaluate(async () => {
//         //     await nodeLog("2 evaluate testing");
//         // });

//     } catch (err) {
//         if (config.log) {
//             console.log("Scroll error => : ", err);
//         }
//     }
// }
EXPORT.limitnum = 3;



EXPORT.parsejsonuser = async function () {
    try {
        // if (config.log) {
        //     console.log("Start user data parsing");
        // }
        // var number = EXPORT.number;
        // var numberofch = EXPORT.numberofch;

        await EXPORT.PAGE.evaluate(async ({ }) => {
            var text = document.getElementById("__NEXT_DATA__").text;
            var json = JSON.parse(text);
            var data = json.props.pageProps.userInfo;

            var insertData = {
                "UrlDodatak": "",
                "IdBroj": "",
                "Ime": "",
                "Avatar": "",
                "Potpis": "",
                "KreiranTimestamp": "",
                "SecUid": "",
                "LinkOpis": "",
                "BrojOsobaKojePrati": "",
                "BrojPratilaca": "",
                "BrojLajkova": "",
                "BrojVideoUploada": ""
            }


            var error = false;

            try {
                insertData.UrlDodatak = data.user.uniqueId.toLowerCase().trim();
            } catch (e) {
                error = true;
                //  console.log("UrlDodatak err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.IdBroj = data.user.id.toLowerCase().trim();
            } catch (e) {
                // console.log("IdBroj err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.Ime = data.user.nickname.trim();
            } catch (e) {
                error = true;
                // console.log("Ime err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.Avatar = data.user.avatarThumb.trim();
            } catch (e) {
                ///  console.log("Avatar err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.Potpis = data.user.signature.trim();
            } catch (e) {
                error = true;
                //  console.log("Potpis err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.KreiranTimestamp = parseInt(data.user.createTime);
            } catch (e) {
                error = true;
                //  console.log("KreiranTimestamp err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.SecUid = data.user.secUid.trim();
            } catch (e) {
                error = true;
                //  console.log("SecUid err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.LinkOpis = data.user.bioLink.link;
            } catch (e) {
                error = true;
                // console.log("LinkOpis err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.BrojOsobaKojePrati = BigInt(data.stats.followingCount).toString();
            } catch (e) {
                error = true;
                //  console.log("BrojOsobaKojePrati err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.BrojPratilaca = BigInt(data.stats.followerCount).toString();
            } catch (e) {
                error = true;
                // console.log("BrojPratilaca err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.BrojLajkova = BigInt(data.stats.heartCount).toString();
            } catch (e) {
                error = true;
                //  console.log("BrojLajkova err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                insertData.BrojVideoUploada = BigInt(data.stats.videoCount).toString();
            } catch (e) {
                error = true;
                ///  console.log("BrojVideoUploada err >> " + JSON.stringify(data) + "\n" + e);
            }

            if (error == true) {
                nodeLog("error >> " + window.location.href);
            }
            await inserData(insertData);
        }, {});
    } catch (err) {
        if (config.log) {
            console.log("Parse user Err => : ", err);
        }
    }
}

// looping throught all keyowords in sqllite 

// var browser = null; // global
// var jcode = fs.readFileSync('./modules/jquery.js', 'utf8');
// async function dojob(){
// browser = await puppeteer.launch(T.pup_config);
// try{	
//     const page = await browser.newPage();
//     await page.goto('about:blank');
// 	await page.evaluate(({jcode}) =>{
//         var jq = document.createElement("script");
// 		jq.type = "text/javascript";
// 		jq.text = jcode;
//         document.getElementsByTagName("head")[0].appendChild(jq);

// 		var jq = document.createElement("script");
// 		jq.type = "text/javascript";
// 		jq.text = `
// 		var numberglobal = 0;
// 		var authors = [];
// 		var limit = 3;
// 		function callback(){
// 			authors = [...new Set(authors)];
// 			var jq1 = document.createElement("script");
// 			jq1.type = "text/javascript";
// 			jq1.id = "outputdata";
// 			jq1.text = JSON.stringify(authors);
// 			document.getElementsByTagName("head")[0].appendChild(jq1);
// 		}


// 		function tiktokallusers(url){
//         $.ajax({
// 			type: "GET",
// 			url: url,
// 			dataType: 'json',
// 			xhrFields: { withCredentials:false },
// 			headers: {          
// 			Accept: "*/*"
// 			},
// 			success: function (data){debugger;
// 				limit = 0;
// 				if(data.statusMsg != null){
// 					limit++
// 					if(limit>3){
// 						callback();
// 						return false;
// 					}
// 					 tiktokallusers("https://m.tiktok.com/api/challenge/item_list/?aid=1988&challengeID=42164&count=30&cursor="+numberglobal);
// 					 return false;
// 				 }
// 				 if(data.hasMore == true){
// 					try{
// 							 var array = data.itemList;
// 							 for(var i = 0, l = array.length; i<l; i++){
// 								 authors.push(array[i].author.id.toLowerCase().trim());
// 							 }
// 					}catch(e){}
// 					numberglobal = numberglobal + 30;
// 					tiktokallusers("https://m.tiktok.com/api/challenge/item_list/?aid=1988&challengeID=42164&count=30&cursor="+numberglobal);
// 				 }else{
// 					callback();
// 					return false;
// 				 }
// 			},
// 			error: function (data){
// 				limit++
// 				if(limit>3){
// 					callback();
// 					return false;
// 				}
//                 tiktokallusers("https://m.tiktok.com/api/challenge/item_list/?aid=1988&challengeID=42164&count=30&cursor="+numberglobal);
// 			}
// 		});
// 		}
// 		tiktokallusers("https://m.tiktok.com/api/challenge/item_list/?aid=1988&challengeID=42164&count=30&cursor="+numberglobal);
// 		`;
//         document.getElementsByTagName("head")[0].appendChild(jq);
//     },{jcode});

// 	var allAccounts = await page.waitForSelector('#outputdata', {
//         timeout: 20*60*1000
// 	});
// 	const inner_html = await page.$eval('#outputdata', element => element.innerHTML);
// 	console.log(inner_html);

// }catch(e){T.log(e);}
// }
// dojob();





EXPORT.loopfunction = async function () {

    if (EXPORT.started == false) {
        await EXPORT.start();
    }
    await EXPORT.openpage("https://www.tiktok.com/@amaliesode?", false);
    await EXPORT.parsejsonuser();
    // db.all("SELECT `Id` From `tiktok_uniq_users`", async (error, rows) => {
    //     // EXPORT.limitnum--;
    //     // if (error) {
    //     //     if (config.log) {
    //     //         return console.error(error.message);
    //     //     }
    //     // }

    //      if (EXPORT.started == false) {
    //          await EXPORT.start();
    //      }

    //     // EXPORT.keywordnow = row.Keyword;

    //     // await EXPORT.openpage("https://www.tiktok.com/tag/" + row.Keyword + "?is_copy_url=1&is_from_webapp=v1", false);
    //     // //await EXPORT.lognetwork();
    //     // await EXPORT.infinitescrool();
    //     // await EXPORT.waitfordownload();
    //     // await EXPORT.sleep(30);

    //     // if (config.mode == "server") {
    //     //     EXPORT.XVFB.stop();
    //     // }

    //     for (var i = 0, l = rows.length; i < l; i++) {
    //         await EXPORT.sleep(parseFloat("0.5"));
    //         EXPORT.idnow = rows[i].Id;
    //         db.run('UPDATE `tiktok_users` ' +
    //             'SET `UserAdress` = "@' + rows[i].UserSlug + '"' +
    //             ' WHERE Id =' + rows[i].Id, async function (err) {
    //                 if (err) {
    //                     if (config.log) {
    //                         return console.error(err.message);
    //                     }
    //                 }
    //                 console.log("Record updated >> " + EXPORT.idnow);
    //                 //db.close();
    //                 //await EXPORT.close();
    //                 //await EXPORT.sleep(3);

    //                 //if (!(EXPORT.limitnum < 1)) {
    //                 //EXPORT.loopfunction();
    //                 //}
    //             });
    //     }
    // });
}


module.exports = EXPORT;