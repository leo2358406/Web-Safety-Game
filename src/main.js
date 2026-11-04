const config = {
  type: Phaser.AUTO,
  width: 960,
  height: 540,
  parent: "game",
  backgroundColor: "#12162b",
    physics: {
    default: "arcade",
    arcade: { debug: false },
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  // The first scene in the list starts automatically.
  scene: [NavigationLevel, QuestionScene],
};

new Phaser.Game(config);