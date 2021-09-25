const player = new YouTubePlayer(document.body, {
  width: 1280,
  height: 720,
  controls: false,
  annotations: false,
  modestBranding: false,
  related: false,
});
player.setPlaybackQuality("hd720");
player.on("error", (e) => notify("error", "" + e));
player.on("unplayable", () => notify("error", "video is unplayable"));
player.on("ended", () => notify("ended"));
player.once("cued", () => {
  player.play();
});
player.load(await getVideoTask());
