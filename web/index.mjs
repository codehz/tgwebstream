const player = new YouTubePlayer(document.body, {
  width: 1280,
  height: 720,
  controls: false,
  annotations: false,
  modestBranding: false,
  related: false,
});
player.on("cued", () => {
  player.play();
  notify("cued");
});
player.load(await getVideoTask());
