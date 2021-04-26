const functions = require("firebase-functions");
const axios = require("axios").default;
const admin = require("firebase-admin");
const zlib = require("zlib");

admin.initializeApp();

exports.scheduledFunctionCrontab = functions.pubsub
    .schedule("6 0 * * *")
    .timeZone("Asia/Bangkok")
    .onRun(async (context) => {
        return axios
            .get(
                "https://us-central1-kufillinggood.cloudfunctions.net/reloadCache",
                {
                    params: {
                        secret: functions.config().api.secret,
                    },
                }
            )
            .catch(function (error) {
                console.log(error);
            });
    });

exports.reloadCache = functions.https.onRequest(async (request, response) => {
    //     response.send("Reloaded");
    // });

    // exports.scheduledFunctionCrontab = functions.pubsub
    //     .schedule("6 0 * * *")
    //     .timeZone("Asia/Bangkok")
    //     .onRun(async (context) => {
    // if (request.params.secret != functions.config().api.secret) {
    //     response.send("Invalid Secret");
    //     return null;
    // }
    var data = {
        username: functions.config().ku.username,
        password: functions.config().ku.password,
    };

    var config = {
        headers: {
            "app-key": functions.config().ku.appkey,
        },
    };

    let accesstoken = null;
    let stdId = null;
    let idCode = null;
    let academicYear = null;
    let semester = null;

    await axios
        .post("https://myapi.ku.th/auth/login", data, config)
        .then(function (response) {
            accesstoken = response.data.accesstoken;
            stdId = response.data.stdId;
            idCode = response.data.idCode;
        })
        .catch(function (error) {
            console.log(error);
        });
    if (accesstoken == null) {
        response.send("Error KU");
        return null;
    }

    config = {
        params: {
            stdStatusCode: 17001,
            campusCode: "B",
            facultyCode: "E",
            majorCode: "E09",
            userType: 1,
        },
        headers: {
            "app-key": functions.config().ku.appkey,
            "x-access-token": accesstoken,
        },
    };

    await axios
        .get("https://myapi.ku.th/common/getschedule", config)
        .then(function (response) {
            academicYear = response.data.results[0].academicYr;
            semester = response.data.results[0].semester;
        })
        .catch(function (error) {
            console.log(error);
        });
    if (accesstoken == null) {
        response.send("Error KU");
        return null;
    }

    config = {
        params: {
            query: "0",
            academicYear: academicYear,
            semester: semester,
            campusCode: "B",
            section: "",
        },
        headers: {
            "app-key": functions.config().ku.appkey,
            "x-access-token": accesstoken,
        },
        responseType: "stream",
    };

    fs = require("fs");
    const writer = fs.createWriteStream("/tmp/SubjectOpen.json");
    await axios
        .get("https://myapi.ku.th/enroll/openSubjectForEnroll", config)
        .then(async function (resku) {
            resku.data.pipe(zlib.createGzip()).pipe(writer);
            let error = null;
            writer.on("error", (err) => {
                error = err;
                writer.close();
                throw new Error(err);
            });
            writer.on("close", async () => {
                if (!error) {
                    let bucket = admin.storage().bucket();
                    // console.log(bucket);
                    const metadata = {
                        contentType: "application/json",
                        contentEncoding: "gzip",
                        cacheControl: "public, max-age=600",
                    };
                    await bucket.upload("/tmp/SubjectOpen.json", {
                        metadata: metadata,
                        resumable: false,
                    });
                    response.send("Uploaded");
                    return null;
                }
            });
            return null;
        })
        .catch(function (error) {
            response.send("ERROR");

            console.log(error);
        });

    return null;
});
