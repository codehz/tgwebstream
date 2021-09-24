import type { Api } from "telegram";

export interface Fingerprint {
  hash: string;
  fingerprint: string;
}

export interface Transport {
  ufrag: string;
  pwd: string;
  fingerprints: Fingerprint[];
  candidates: Candidate[];
}

export interface Conference {
  sessionId: number;
  transport: Transport;
  ssrcs: Ssrc[];
}

export interface Candidate {
  generation: string;
  component: string;
  protocol: string;
  port: string;
  ip: string;
  foundation: string;
  id: string;
  priority: string;
  type: string;
  network: string;
}

export interface Ssrc {
  ssrc: number;
  ssrcGroup: number[];
}

export interface Sdp {
  fingerprint: string | null;
  hash: string | null;
  setup: string | null;
  pwd: string | null;
  ufrag: string | null;
  source: number | null;
  sourceGroup: number[] | null;
}

export interface JoinVoiceCallParams {
  ufrag: string;
  pwd: string;
  hash: string;
  setup: "active";
  fingerprint: string;
  source: number;
  sourceGroup: number[];
}

export interface JoinVoiceCallResponse {
  transport?: Transport;
}

export interface EditParams {
  muted?: boolean;
  volume?: number;
  raiseHand?: boolean;
  videoStopped?: boolean;
  videoPaused?: boolean;
  presentationPaused?: boolean;
}

export interface JoinParams {
  joinAs?: Api.TypeEntityLike;
  muted?: boolean;
  videoStopped?: boolean;
  inviteHash?: string;
}
