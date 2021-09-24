import { Api, TelegramClient } from "telegram";
import {
  EditParams,
  JoinParams,
  JoinVoiceCallParams,
  JoinVoiceCallResponse,
} from "./types";

export async function join(
  client: TelegramClient,
  call: Api.InputGroupCall,
  { ufrag, pwd, hash, setup, fingerprint, source: ssrc, sourceGroup: sources }:
    JoinVoiceCallParams,
  { joinAs = "me", muted = false, videoStopped = false, inviteHash }:
    JoinParams = {},
): Promise<JoinVoiceCallResponse> {
  // @ts-ignore
  const { updates } = await client.invoke(
    new Api.phone.JoinGroupCall({
      call,
      params: new Api.DataJSON({
        data: JSON.stringify({
          ufrag,
          pwd,
          fingerprints: [
            {
              hash,
              setup,
              fingerprint,
            },
          ],
          ssrc,
          "ssrc-groups": [
            {
              semantics: "FID",
              sources,
            },
          ],
        }),
      }),
      joinAs,
      muted,
      videoStopped,
      inviteHash,
    }),
  );

  for (const update of updates) {
    if (update instanceof Api.UpdateGroupCallConnection) {
      return JSON.parse(update.params.data);
    }
  }

  throw new Error("Could not get transport");
}

export function leave(client: TelegramClient, call: Api.TypeInputGroupCall) {
  return client.invoke(new Api.phone.LeaveGroupCall({ call }));
}

export function edit(
  client: TelegramClient,
  call: Api.InputGroupCall,
  participant: Api.TypeEntityLike,
  params: EditParams,
) {
  return client.invoke(
    new Api.phone.EditGroupCallParticipant({
      call,
      participant,
      ...params,
    }),
  );
}
