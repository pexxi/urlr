"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUrl = exports.postNewUrl = void 0;
const firebase_functions_1 = require("firebase-functions");
const nanoid_1 = require("nanoid");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();
exports.postNewUrl = firebase_functions_1.https.onRequest(async (request, response) => {
    try {
        const { url } = request.body;
        firebase_functions_1.logger.info(`Add new URL: ${url}`, { structuredData: true });
        const slug = nanoid_1.nanoid(10);
        await db.collection("urls").doc(slug).set({
            url,
            slug,
        });
        response.json({ slug });
    }
    catch (err) {
        response.status(500).send({ err });
    }
});
exports.getUrl = firebase_functions_1.https.onRequest(async (request, response) => {
    try {
        const { slug } = request.query;
        if (!slug) {
            response.status(400).send("Slug missing");
            return;
        }
        firebase_functions_1.logger.info(`Get URL: ${slug}`, { structuredData: true });
        const data = (await db
            .collection("urls")
            .doc(slug)
            .get()).data();
        if (!(data === null || data === void 0 ? void 0 : data.url)) {
            response.sendStatus(404);
            return;
        }
        response.json({ slug, url: data.url });
    }
    catch (err) {
        response.status(500).send({ err });
    }
});
//# sourceMappingURL=index.js.map