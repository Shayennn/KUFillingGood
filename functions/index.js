const functions = require('firebase-functions');

exports.reloadCache = functions.https.onRequest((request, response) => {
 response.send("Reloaded");
});
