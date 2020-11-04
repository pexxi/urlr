import { https, logger } from "firebase-functions";
import { nanoid } from "nanoid";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const postNewUrl = https.onRequest(async (request, response) => {
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
      slug = nanoid(10);
      db.collection("urls").doc(slug).set({
        url,
        slug,
        created: new Date().toISOString(),
      });
    }
    logger.info(`Added new URL: ${url}, slug: ${slug}`, { structuredData: true });
    response.json({ url, slug });
  } catch (err) {
    response.status(500).send({ err });
  }
});

export const getUrl = https.onRequest(async (request, response) => {
  if (request.method !== "GET") {
    logger.info("Forbidden");
    response.status(403).send("Forbidden!");
    return;
  }
  try {
    const { slug } = request.query;
    response.set("Access-Control-Allow-Origin", "*");

    if (!slug) {
      logger.info("Slug missing");
      response.status(400).send("Slug missing");
      return;
    }

    const data = (
      await db
        .collection("urls")
        .doc(slug as string)
        .get()
    ).data();

    if (!data?.url) {
      logger.info("Slug not found");
      response.status(404).send("Not found");
      return;
    }
    logger.info(`Get slug: ${slug}, URL: ${data.url}`, { structuredData: true });
    response.json({ slug, url: data.url });
  } catch (err) {
    console.error(err);
    response.status(500).send(err.message);
  }
});
