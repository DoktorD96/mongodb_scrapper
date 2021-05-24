var config = require('./config');
var TIK = require('./start_tiktok');


module.exports.startfn = async function () {


    await TIK.start();
    await TIK.openpage("https://www.tiktok.com/tag/makeup?is_copy_url=1&is_from_webapp=v1", false);
    await TIK.infinitescrool();
    await TIK.sleep(60 * 60); // 60 min
    await TIK.close();
    if (config.mode == "server") {
        TIK.XVFB.stop();
    }
}