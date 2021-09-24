import { create } from "./browser.js";
import { join } from "./calls.js";
import { getFull } from "./chats.js";
import client from "./client.js";
import { fromConference, parseSdp } from "./sdp.js";

// client
// https://www.youtube.com/watch?v=BbhrHRsK1S4
// GKSRyLdjsPA

const page = await create();
await page.exposeFunction("notify", async (event: string) => {
  console.log(event);
  switch (event) {
    case "closed":
      await page.close();
      break;
  }
});
await page.exposeFunction("joinVoiceChat", async (sdp: string) => {
  const parsed = parseSdp(sdp);
  console.log(parsed);
  const chat = await getFull(client, -1001234211532);
  const { transport } = await join(client, chat.call, {
    ...parsed,
    setup: "active",
  });
  return fromConference({
    sessionId: Date.now(),
    transport,
    ssrcs: [{ ssrc: parsed.source, ssrcGroup: parsed.sourceGroup }],
  });
});
await page.exposeFunction("getVideoTask", () => "GKSRyLdjsPA");
page.on("framenavigated", async (frame) => {
  if (new URL(frame.url()).hostname != "www.youtube.com") return;
  try {
    await frame.waitForSelector("video");
    await frame.addScriptTag({
      url: "https://data/capture.mjs",
      type: "module",
    });
  } catch (e) {
    console.error(e);
    await page.close();
  }
});
await page.goto("https://data/index.html", {
  waitUntil: "domcontentloaded",
});
