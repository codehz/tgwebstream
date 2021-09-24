import { connection } from "./rtc.js";

await notify("capture");
const video = document.querySelector("video");
async function start() {
  video.removeEventListener("canplay", start);
  await notify("canplay");
  const stream = video.captureStream();
  stream.getTracks().forEach((track) => connection.addTrack(track, stream));
  console.log(stream);
  console.log(stream.getTracks());
  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);
  console.log(offer.sdp);
  const sdp = await joinVoiceChat(offer.sdp);
  console.log(sdp);
  await connection.setRemoteDescription({
    type: "answer",
    sdp,
  });
}
video.addEventListener("canplay", start);
