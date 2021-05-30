
var MEX = null;
const { MongoClient } = require("mongodb");
var MONGO = null;
var DB = null;
MEX.connect = function () {
    MongoClient.connect("mongodb+srv://viser:viser@cluster0.iczw6.mongodb.net/tiktok_dump?retryWrites=true&w=majority", {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }, async (err, client) => {
        if (err) {
            return console.log(err);
        }
        MONGO = client;
        try {
            // Specify database you want to access
            const db = MONGO.db('tiktok_dump');
            DB = db.collection('tiktoktest');
            // await courses.find().limit(1).toArray((err, results) => {
            //     console.log(results);
            // });
            // await MONGO.close();
        } catch (e) {
            console.log(e);
        }
    });
}

MEX.close = async function () {
    await MONGO.close();
}

module.exports = MEX;