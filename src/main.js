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
  scene: [
    NavigationLevel,
    PermissionsLevel,
    NdaLevel,
    ThreatLevel,
    PasswordLevel,
    QuestionScene,
    EndScene,
  ],
};

const game = new Phaser.Game(config);
game.registry.set("score", 0); // counts questions answered right on the first try