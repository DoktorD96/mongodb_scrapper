var config = require('./config');
var TIK = require('./start_tiktok');

TIK.limitnum = 3;
TIK.numberofch = 4;
TIK.number = 0;
module.exports.startfn = async function () {


    /*db.each("SELECT `Id`, `Keyword` From `tiktok_tags` WHERE `IsScrapped` = 'false' limit 1",*/

    TIK.loopfunction();

}