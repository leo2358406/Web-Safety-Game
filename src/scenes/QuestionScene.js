class QuestionScene extends Phaser.Scene {
  constructor() {
    super("QuestionScene");
  }

  init(data) {
    this.levelIndex = data.levelIndex;
    this.callerKey = data.callerKey;
    this.attempts = 0;
  }

  create() {
    this.level = LEVELS[this.levelIndex];
    const { width, height } = this.scale;

    // Dim the paused level behind the question
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.75);

    this.add
      .text(width / 2, 40, this.level.prompt, {
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5, 0);

    this.buttons = this.level.choices.map((text, i) =>
      this.makeButton(width / 2, 170 + i * 66, text, () => this.choose(i))
    );

    this.feedback = this.add
      .text(width / 2, 435, "", {
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5);
  }

  makeButton(x, y, label, onClick) {
    const bg = this.add
      .rectangle(x, y, 760, 54, 0x2f3a6b)
      .setInteractive({ useHandCursor: true });
    const txt = this.add
      .text(x, y, label, { fontSize: "18px", color: "#ffffff", align: "center", wordWrap: { width: 720 } })
      .setOrigin(0.5);
    bg.on("pointerover", () => bg.setFillStyle(0x435095));
    bg.on("pointerout", () => bg.setFillStyle(0x2f3a6b));
    bg.on("pointerdown", onClick);
    return { bg, txt };
  }

  choose(i) {
    if (i === this.level.answer) {
      this.feedback.setColor("#6bff9b").setText("Correct! " + this.level.why);
      this.showContinue();
    } else if (this.attempts++ === 0) {
      this.feedback.setColor("#ff6b6b").setText("Not quite. Hint: " + this.level.hint);
    } else {
      this.feedback
        .setColor("#ff6b6b")
        .setText("The answer: " + this.level.choices[this.level.answer] + "\n" + this.level.why);
      this.showContinue();
    }
  }

  showContinue() {
    this.buttons.forEach((b) => b.bg.disableInteractive());
    const next = LEVELS[this.levelIndex + 1];
    this.makeButton(this.scale.width / 2, 505, next ? "Next level" : "Play again", () =>
      this.goNext(next)
    );
  }

  goNext(next) {
    const target = next || LEVELS[0];
    const index = next ? this.levelIndex + 1 : 0;
    this.scene.stop(this.callerKey);               // shut down the paused level
    this.scene.start(target.scene, { levelIndex: index }); // this also ends the question scene
  }
}