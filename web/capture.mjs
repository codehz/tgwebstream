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
  for (const track of tracks) {
    try {
      if (track.kind == "video") {
        await track.applyConstraints({
          width: { min: 480, max: 1280, ideal: 1280 },
          height: { min: 360, max: 720, ideal: 720 },
          frameRate: { min: 10, max: 30, ideal: 30 },
        });
      }
    } catch (e) {
      await notify(
        "log",
        `failed to apply constraints for ${track.kind} track`,
      );
    }
    connection.addTrack(track, stream);
  }
  const offer = await connection.createOffer();
  await connection.setLocalDescription(offer);
  const sdp = await joinVoiceChat(offer.sdp);
  await connection.setRemoteDescription({
    type: "answer",
    sdp,
  });
}
video.addEventListener("canplay", start);
