import { NewMessage, NewMessageEvent } from "telegram/events/index.js";
import client from "./client.js";
import { playYoutube } from "./player.js";
import { getVoiceChatSession } from "./voicechat.js";

const ytb =
  /^(?:https?:\/\/)?(?:www\.|m\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w\-_]+)\&?/;

client.addEventHandler(async (e: NewMessageEvent) => {
  const msg = e.message;
  await msg.delete({});
  const text = msg.message;
  const link = /^stream (.*)/.exec(text)[1];
  const ytbm = link.match(ytb);
  if (ytbm) {
    try {
      console.log("start play ", e.chatId, ytbm[1]);
      await playYoutube(e.chatId, ytbm[1]);
    } catch (e) {
      console.log(e);
    }
  }
}, new NewMessage({ outgoing: true, forwards: false, pattern: /^stream .*/ }));

client.addEventHandler(
  async (e: NewMessageEvent) => {
    const msg = e.message;
    await msg.delete({});
    const call = await getVoiceChatSession(e.chatId);
    if (!call) return console.log("no active voice chat session");
    await call.close();
  },
  new NewMessage({ outgoing: true, forwards: false, pattern: /^stopstream$/ }),
);

process.on("uncaughtException", function (err) {
  console.log(err);
});
