import { connection } from "./rtc.js";

await notify("capture");
const video = document.querySelector("video.html5-main-video");
async function start() {
  const stream = video.captureStream();
  const tracks = stream.getTracks();
  if (tracks.length == 0) return;
  video.removeEventListener("canplay", start);
  video.play();
  await notify("canplay");
  tracks.forEach((track) => connection.addTrack(track, stream));
  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);
  const sdp = await joinVoiceChat(offer.sdp);
  await connection.setRemoteDescription({
    type: "answer",
    sdp,
  });
}
video.addEventListener("canplay", start);
start();
