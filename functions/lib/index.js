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
        response.set("Access-Control-Allow-Origin", "*");
        if (request.method === "OPTIONS") {
            // Send response to OPTIONS requests
            response.set("Access-Control-Allow-Methods", "GET");
            response.set("Access-Control-Allow-Headers", "Content-Type");
            response.set("Access-Control-Max-Age", "3600");
            response.status(204).send("");
            return;
        }
        if (request.method !== "POST") {
            response.status(403).send("Forbidden!");
            return;
        }
        const { url } = request.body;
        const data = (await db.collection("urls").where("url", "==", url).get()).docs.find((doc) => doc.get("url") === url);
        // check existing
        let slug = null;
        if (data) {
            const found = data.data();
            slug = found.slug;
        }
        if (!slug) {
            // create new
            slug = nanoid_1.nanoid(10);
            db.collection("urls").doc(slug).set({
                url,
                slug,
                created: new Date().toISOString(),
            });
        }
        firebase_functions_1.logger.info(`Added new URL: ${url}, slug: ${slug}`, { structuredData: true });
        response.json({ url, slug });
    }
    catch (err) {
        response.status(500).send({ err });
    }
});
exports.getUrl = firebase_functions_1.https.onRequest(async (request, response) => {
    if (request.method !== "GET") {
        firebase_functions_1.logger.info("Forbidden");
        response.status(403).send("Forbidden!");
        return;
    }
    try {
        const { slug } = request.query;
        response.set("Access-Control-Allow-Origin", "*");
        if (!slug) {
            firebase_functions_1.logger.info("Slug missing");
            response.status(400).send("Slug missing");
            return;
        }
        const data = (await db
            .collection("urls")
            .doc(slug)
            .get()).data();
        if (!(data === null || data === void 0 ? void 0 : data.url)) {
            firebase_functions_1.logger.info("Slug not found");
            response.status(404).send("Not found");
            return;
        }
        firebase_functions_1.logger.info(`Get slug: ${slug}, URL: ${data.url}`, { structuredData: true });
        response.json({ slug, url: data.url });
    }
    catch (err) {
        console.error(err);
        response.status(500).send(err.message);
    }
});
//# sourceMappingURL=index.js.map