var config = require('./config');
var axios = require('axios');
const { Image, createCanvas } = require('canvas');
const Xvfb = config.mode ? require('xvfb') : null;

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./tiktok_tags.db');

if (config.mode == "local") {

}
if (config.mode == "test") {
    config.log = true;
}


if (parseInt(process.env.S) == 1) {
    config.skip = 50;
    config.limit = 1450;
}
if (parseInt(process.env.S) == 2) {
    config.skip = 1500;
    config.limit = 1500;
}
if (parseInt(process.env.S) == 3) {
    config.skip = 3000;
    config.limit = 1500;
}
if (parseInt(process.env.S) == 4) {
    config.skip = 4500;
    config.limit = 1500;
}
if (parseInt(process.env.S) == 4) {
    config.skip = 6000;
    config.limit = 1500;
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



// funkcija koja pronalazi mejl adresu unutar signature opisa

function parsestring(str) {
    if (str != null && str != "") {
        var array = str.match(/\S+/g);
        if (array.length != null && array.length > 0) {
            for (var i = 0, l = array.length; i < l; i++) {
                if (array[i].length != null && array[i].length > 2) {
                    array[i] = array[i].trim();
                    if ("!?.,;<>:{}[]".indexOf(array[i][0]) > -1) {
                        array[i] = array[i].slice(1, array[i].length);
                    }
                    if ("!?.,;<>:{}[]".indexOf(array[i][array[i].length - 1]) > -1) {
                        array[i] = array[i].slice(0, array[i].length - 1);
                    }
                    if (gmailvalidate(array[i]) == true) {
                        return array[i];
                        break;
                    }
                }
            }
            return "";
        }
        return "";
    }
    return "";
}

function gmailvalidate(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

//funkcija koja pretvara image to base64 string

function getBase64(url) {
    return new Promise(function (resolve) {
        axios.get(url, {
            responseType: 'arraybuffer'
        })
            .then(response =>
                resolve(Buffer.from(response.data, 'binary')
                    .toString('base64')))
            .catch((err) => {
                resolve("error");
            });
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
EXPORT.increment = 0;

// insert scrapped users data

EXPORT.inserData = async function (data) {
    try {
        if (data.Avatar.substring(0, 23) == "data:image/jpeg;base64,") {
        } else if (data.Avatar.substring(0, 8) == "https://") {
            var img = new Image();
            var b64 = await getBase64(data.Avatar);
            if (b64 != "error") {
                img.src = "data:image/jpeg;base64," + b64;
                var canvas = createCanvas(50, 50);
                var ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "medium";
                ctx.drawImage(img, 0, 0, 50, 50);
                data.Avatar = canvas.toDataURL("image/jpeg", 0.9);
            }
        } else {
            data.Avatar = "";
        }
    } catch (e) {
        console.log(e);
        data.Avatar = "";
    }
    var querytorun =
        "" +
        "UPDATE `tiktok_uniq_users` " +
        //TEXT
        "SET `UrlDodatak` = ? , " +
        "`IdBroj` = ? , " +
        "`Ime` = ? , " +
        "`Avatar` = ? , " +
        "`Potpis` = ? , " +
        "`SecUid` = ? , " +
        "`LinkOpis` = ? , " +
        "`Adress` = ? , " +
        "`Link` = ? , " +
        "`Mail` = ? , " +
        "`IsScrapped` = ? , " +
        //NUMBER
        "`KreiranTimestamp`= cast(? as int) , " +
        "`BrojOsobaKojePrati` = cast(? as int) , " +
        "`BrojPratilaca` = cast(? as int) , " +
        "`BrojLajkova` = cast(? as int) , " +
        "`BrojVideoUploada` = cast(? as int) " +
        //WHERE CLAUSE
        'WHERE `User` = ?;'

    var params = [
        data.UrlDodatak,
        data.IdBroj,
        data.Ime,
        data.Avatar,
        data.Potpis,
        data.SecUid,
        data.LinkOpis,
        "@" + data.UrlDodatak,
        "https://www.tiktok.com/@" + data.UrlDodatak + "?",
        data.Mail,
        "true",
        parseInt(data.KreiranTimestamp),
        data.BrojOsobaKojePrati,
        data.BrojPratilaca,
        data.BrojLajkova,
        data.BrojVideoUploada,
        data.UrlDodatak
    ];

    db.run(querytorun, params, async function (err) {
        if (err) {
            if (config.log) {
                return console.error(err.message);
            }
        }
        EXPORT.increment++;
        console.log("Record updated >> " + EXPORT.increment);
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
            // console.log("Opening the browser......");
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
            //console.log("Opening page url \n" + pageurl + "\n");
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

function getBase64(url) {
    return axios
        .get(url, {
            responseType: 'arraybuffer'
        })
        .then(response =>
            Buffer.from(response.data, 'binary')
                .toString('base64')
        )
        .catch((err) => {
            "error"
        })
}

EXPORT.parsejsonuser = async function () {
    try {


        await EXPORT.PAGE.evaluate(async ({ }) => {

            function getBase64Image(imgUrl) {
                return new Promise(
                    function (resolve) {

                        var img = new Image();
                        img.src = imgUrl;
                        img.setAttribute('crossOrigin', 'anonymous');

                        img.onload = function () {
                            var canvas = document.createElement("canvas");
                            canvas.width = 50;
                            canvas.height = 50;
                            var ctx = canvas.getContext("2d");
                            ctx.imageSmoothingEnabled = true;
                            ctx.imageSmoothingQuality = "medium";
                            ctx.drawImage(img, 0, 0, 50, 50);
                            var dataURL = canvas.toDataURL("image/jpeg", 0.9);
                            resolve(dataURL);
                        }
                        img.onerror = function () {
                            resolve("error");
                        }

                    });

            }



            var text = document.getElementById("__NEXT_DATA__").text;
            var json = JSON.parse(text);
            var data = json.props.pageProps.userInfo;

            var insertData = {
                "UrlDodatak": "#no_slug#",
                "IdBroj": "#no_id#",
                "Ime": "#no_name#",
                "Avatar": "#no_avatar#",
                "Mail": "#no_email#",
                "Potpis": "#no_signature#",
                "KreiranTimestamp": "0",
                "SecUid": "#no_sec_uid#",
                "LinkOpis": "#no_link#",
                "BrojOsobaKojePrati": "0",
                "BrojPratilaca": "0",
                "BrojLajkova": "0",
                "BrojVideoUploada": "0"
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
                console.log("Avatar err >> " + e);
            }

            try {
                insertData.Avatar = await getBase64Image(insertData.Avatar);
            } catch (e) {
                console.log("Avatar err >> " + e);
            }

            try {
                if (data.user.signature.trim() == "") {
                    insertData.Potpis = "#no_signature#";
                } else {
                    insertData.Potpis = data.user.signature.replace(/(?:\r\n|\r|\n)/g, ' ').trim();
                }

            } catch (e) {
                insertData.Potpis = "#no_signature#";
                error = true;
                //  console.log("Potpis err >> " + JSON.stringify(data) + "\n" + e);
            }
            try {
                if (insertData.Potpis != "#no_signature#") {
                    var mail = parsestring(data.user.signature.trim());
                    if (mail.trim() != "") {
                        insertData.Mail = mail.trim();
                    } else {
                        insertData.Mail = "#no_email#";
                    }
                } else {
                    insertData.Mail = "#no_email#";
                }
            } catch (e) {
                insertData.Mail = "#no_email#";
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
                if (data.user.bioLink.link.trim() == "") {
                    insertData.LinkOpis = "#no_link#"
                } else {
                    insertData.LinkOpis = data.user.bioLink.link;
                }
            } catch (e) {
                insertData.LinkOpis = "#no_link#"
                //error = true;
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
                nodeLog(window.location.href);
            }
            await inserData(insertData);
        }, {});
    } catch (err) {
        if (config.log) {
            // console.log("Parse user Err => : ", err);
        }
    }
}


EXPORT.loopfunction = async function () {

    if (EXPORT.started == false) {
        await EXPORT.start();
    }


    db.all("SELECT `Id`, `User` From `tiktok_uniq_users` LIMIT " + config.limit + " OFFSET " + config.skip + ";", async (error, rows) => {
        if (error) {
            if (config.log) {
                return console.error(error.message);
            }
        }

        if (EXPORT.started == false) {
            await EXPORT.start();
            await EXPORT.sleep(parseFloat("30"));
        }

        if (config.mode == "server") {
            EXPORT.XVFB.stop();
        }

        for (var i = 0, l = rows.length; i < l; i++) {
            //EXPORT.idnow = rows[i].Id;
            //EXPORT.keywordnow = row.Keyword;
            await EXPORT.openpage("https://www.tiktok.com/@" + rows[i].User + "?", false);
            await EXPORT.parsejsonuser();
            await EXPORT.sleep(parseFloat("5"));
        }
        await EXPORT.close();
        db.close();
    });
}


module.exports = EXPORT;