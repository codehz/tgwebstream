import { EventEmitter } from "events";
import { Api } from "telegram";
import { EntityLike } from "telegram/define";
import { join, leave } from "./calls.js";
import { getFull } from "./chats.js";
import client from "./client.js";
import { fromConference, parseSdp } from "./sdp.js";

const ref = new Map<number, VoiceChatSession>();

client.addEventHandler((update) => {
  if (update instanceof Api.UpdateGroupCall) {
    if (update.call instanceof Api.GroupCallDiscarded) {
      const session = ref.get(update.chatId);
      session?.emit("close");
    }
  }
});

export class VoiceChatSession extends EventEmitter {
  #chat: Api.TypeChatFull;

  get #call() {
    return this.#chat.call;
  }

  constructor(chat: Api.TypeChatFull) {
    super();
    this.#chat = chat;
    if (ref.has(this.#chat.id)) {
      throw new ReferenceError("already has joined chat session");
    }
    if (!this.#call) throw new ReferenceError("no active call");
    ref.set(this.#chat.id, this);
  }

  async join(sdp: string) {
    try {
      const parsed = parseSdp(sdp);
      const { transport } = await join(client, this.#call, {
        ...parsed,
        setup: "active",
      });
      return fromConference({
        sessionId: Date.now(),
        transport,
        ssrcs: [{ ssrc: parsed.source, ssrcGroup: parsed.sourceGroup }],
      });
    } catch (e) {
      this.emit("error", e);
      throw e;
    }
  }

  async close() {
    this.emit("close");
    ref.delete(this.#chat.id);
    await leave(client, this.#call);
  }
}

export async function allocVoiceChatSession(id: number) {
  const chat = await getFull(client, id);
  if (!chat) throw new ReferenceError("invalid chat");
  return new VoiceChatSession(chat);
}

export async function getVoiceChatSession(id: number) {
  const chat = await getFull(client, id);
  return ref.get(chat.id);
}
