import { create } from "./browser.js";
import ExitGroup from "./exit-group.js";
import { allocVoiceChatSession } from "./voicechat.js";

export async function playYoutube(chatId: number, videoId: string) {
  const group = new ExitGroup();
  const page = await create();
  group.add(page);
  const session = await allocVoiceChatSession(chatId);
  group.add(session);
  await page.exposeFunction("notify", async (event: string, details?: any) => {
    console.log(event, details);
    switch (event) {
      case "error":
        console.error("error", details);
      case "ended":
      case "closed":
        await page.close();
        break;
    }
  });
  await page.exposeFunction("joinVoiceChat", session.join.bind(session));
  await page.exposeFunction("getVideoTask", () => videoId);
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
}
