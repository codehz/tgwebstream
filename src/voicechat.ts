import { join } from "./calls.js";
import { getFull } from "./chats.js";
import client from "./client.js";

const chat = await getFull(client, -1001234211532);
// await calls.join(client, )
