import { create } from "./browser.js";
import ExitGroup from "./exit-group.js";
import getVoiceChatSession from "./voicechat.js";

// client
// https://www.youtube.com/watch?v=BbhrHRsK1S4
// GKSRyLdjsPA

const group = new ExitGroup();
const page = await create();
group.add(page);
await page.exposeFunction("notify", async (event: string) => {
  console.log(event);
  switch (event) {
    case "closed":
      await page.close();
      break;
  }
});
await page.exposeFunction("joinVoiceChat", async (sdp: string) => {
  const session = await getVoiceChatSession(-1001234211532);
  group.add(session);
  return session.join(sdp);
});
await page.exposeFunction("getVideoTask", () => "3jIXsIcov1A");
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
