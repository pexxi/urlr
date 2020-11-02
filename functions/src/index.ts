import { https, logger } from "firebase-functions";
import { nanoid } from "nanoid";
import * as admin from "firebase-admin";

admin.initializeApp();
const db = admin.firestore();

export const postNewUrl = https.onRequest(async (request, response) => {
  try {
    const { url } = request.body;
    logger.info(`Add new URL: ${url}`, { structuredData: true });

    const data = (await db.collection("urls").where("url", "==", url).get()).docs.find((doc) => doc.get("url") === url);

    // check existing
    if (data) {
      const found = data.data();
      response.json({ slug: found.slug, url });
      return;
    }

    // create new
    const slug = nanoid(10);
    await db.collection("urls").doc(slug).set({
      url,
      slug,
    });
    response.json({ slug });
  } catch (err) {
    response.status(500).send({ err });
  }
});

export const getUrl = https.onRequest(async (request, response) => {
  try {
    const { slug } = request.query;
    if (!slug) {
      response.status(400).send("Slug missing");
      return;
    }
    logger.info(`Get URL: ${slug}`, { structuredData: true });

    const data = (
      await db
        .collection("urls")
        .doc(slug as string)
        .get()
    ).data();

    if (!data?.url) {
      response.sendStatus(404);
      return;
    }

    response.json({ slug, url: data.url });
  } catch (err) {
    response.status(500).send({ err });
  }
});
