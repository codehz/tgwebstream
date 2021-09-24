export const connection = new RTCPeerConnection({
  sdpSemantics: "unified-plan",
});

connection.addEventListener("iceconnectionstatechange", () => {
  switch (connection.iceConnectionState) {
    case "closed":
    case "failed":
      notify("closed");
  }
});
