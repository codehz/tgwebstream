import type { Candidate, Conference, Transport } from "./types.js";

import { Sdp } from "./types";

export function parseSdp(sdp: string): Sdp {
  const lines = sdp.split("\r\n");

  const lookup = (prefix: string) => {
    for (let line of lines) {
      if (line.startsWith(prefix)) {
        return line.substr(prefix.length);
      }
    }
    return null;
  };

  const rawSource = lookup("a=ssrc:");
  const rawSourceGroup = lookup("a=ssrc-group:FID ");

  return {
    fingerprint: lookup("a=fingerprint:")?.split(" ")[1] ?? null,
    hash: lookup("a=fingerprint:")?.split(" ")[0] ?? null,
    setup: lookup("a=setup:"),
    pwd: lookup("a=ice-pwd:"),
    ufrag: lookup("a=ice-ufrag:"),
    source: rawSource ? Number(rawSource.split(" ")[0]) : null,
    sourceGroup: rawSourceGroup ? rawSourceGroup.split(" ").map(Number) : null,
  };
}

class SdpBuilder {
  #lines: string[] = [];
  #newLine: string[] = [];

  get lines() {
    return this.#lines.slice();
  }

  join() {
    return this.#lines.join("\n");
  }

  finalize() {
    return this.join() + "\n";
  }

  private add(line: string) {
    this.#lines.push(line);
  }

  private push(word: string) {
    this.#newLine.push(word);
  }

  private addJoined(separator = "") {
    this.add(this.#newLine.join(separator));
    this.#newLine = [];
  }

  addCandidate(
    { foundation, component, protocol, priority, ip, port, type, generation }:
      Candidate,
  ) {
    this.push("a=candidate:");
    this.push(
      `${foundation} ${component} ${protocol} ${priority} ${ip} ${port} typ ${type}`,
    );
    this.push(` generation ${generation}`);
    this.addJoined();
  }

  addHeader(sessionId: number) {
    this.add("v=0");
    this.add(`o=- ${sessionId} 2 IN IP4 0.0.0.0`);
    this.add("s=-");
    this.add("t=0 0");
    this.add(`a=group:BUNDLE 0 1`);
    this.add("a=ice-lite");
  }

  addTransport({ ufrag, pwd, fingerprints, candidates }: Transport) {
    this.add(`a=ice-ufrag:${ufrag}`);
    this.add(`a=ice-pwd:${pwd}`);

    for (let fingerprint of fingerprints) {
      this.add(
        `a=fingerprint:${fingerprint.hash} ${fingerprint.fingerprint}`,
      );
      this.add(`a=setup:passive`);
    }

    for (let candidate of candidates) {
      this.addCandidate(candidate);
    }
  }

  addSsrcEntry(transport: Transport) {
    // Audio codecs
    this.add(`m=audio 1 RTP/SAVPF 111 126`);
    this.add("c=IN IP4 0.0.0.0");
    this.add(`a=mid:0`);
    this.addTransport(transport);
    this.add("a=rtpmap:111 opus/48000/2");
    this.add("a=rtpmap:126 telephone-event/8000");
    this.add("a=fmtp:111 minptime=10; useinbandfec=1; usedtx=1");
    this.add("a=rtcp:1 IN IP4 0.0.0.0");
    this.add("a=rtcp-mux");
    this.add("a=rtcp-fb:111 transport-cc");
    this.add("a=extmap:1 urn:ietf:params:rtp-hdrext:ssrc-audio-level");
    this.add("a=recvonly");
    // Audio codecs

    // Video codecs
    this.add(`m=video 1 RTP/SAVPF 100 101 102 103`);
    this.add("c=IN IP4 0.0.0.0");
    this.add(`a=mid:1`);
    this.addTransport(transport);

    // VP8 codec
    this.add("a=rtpmap:100 VP8/90000/1");
    this.add("a=fmtp:100 x-google-start-bitrate=800");
    this.add("a=rtcp-fb:100 goog-remb");
    this.add("a=rtcp-fb:100 transport-cc");
    this.add("a=rtcp-fb:100 ccm fir");
    this.add("a=rtcp-fb:100 nack");
    this.add("a=rtcp-fb:100 nack pli");
    this.add("a=rtpmap:101 rtx/90000");
    this.add("a=fmtp:101 apt=100");

    // VP9 codec
    this.add("a=rtpmap:102 VP9/90000/1");
    this.add("a=rtcp-fb:102 goog-remb");
    this.add("a=rtcp-fb:102 transport-cc");
    this.add("a=rtcp-fb:102 ccm fir");
    this.add("a=rtcp-fb:102 nack");
    this.add("a=rtcp-fb:102 nack pli");
    this.add("a=rtpmap:103 rtx/90000");
    this.add("a=fmtp:103 apt=102");

    this.add("a=recvonly");
    this.add("a=rtcp:1 IN IP4 0.0.0.0");
    this.add("a=rtcp-mux");
    // End video codecs
  }

  addConference({ sessionId, transport }: Conference) {
    this.addHeader(sessionId);
    this.addSsrcEntry(transport);
  }
}

export function fromConference(conference: Conference) {
  const sdp = new SdpBuilder();
  sdp.addConference(conference);
  return sdp.finalize();
}
