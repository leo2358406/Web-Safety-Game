class EndScene extends Phaser.Scene {
  constructor() {
    super("EndScene");
  }

  create() {
    const { width } = this.scale;
    const score = this.registry.get("score") || 0;

    this.add
      .text(width / 2, 50, "You finished!", { fontSize: "40px", color: "#ffffff", fontStyle: "bold" })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 100, `You got ${score} of ${LEVELS.length} on the first try.`, {
        fontSize: "20px",
        color: "#ffd166",
      })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 150, "What you learned", { fontSize: "18px", color: "#9aa7d9" })
      .setOrigin(0.5);

    const recap = LEVELS.map((l) => "• " + l.why).join("\n\n");
    this.add
      .text(width / 2, 175, recap, {
        fontSize: "15px",
        color: "#e6e9ff",
        wordWrap: { width: 800 },
      })
      .setOrigin(0.5, 0);

    this.makeButton(width / 2 - 140, 490, "Play again", () => {
      this.registry.set("score", 0);
      this.scene.start(LEVELS[0].scene, { levelIndex: 0 });
    });
    this.makeButton(width / 2 + 140, 490, "Home", () => {
      window.location.href = "index.html";
    });
  }

  makeButton(x, y, label, onClick) {
    const bg = this.add.rectangle(x, y, 240, 54, 0x2f3a6b).setInteractive({ useHandCursor: true });
    this.add.text(x, y, label, { fontSize: "20px", color: "#ffffff" }).setOrigin(0.5);
    bg.on("pointerover", () => bg.setFillStyle(0x435095));
    bg.on("pointerout", () => bg.setFillStyle(0x2f3a6b));
    bg.on("pointerdown", onClick);
  }
}