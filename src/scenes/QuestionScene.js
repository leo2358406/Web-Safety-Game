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
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.8);

    this.add.text(16, 12, `Question ${this.levelIndex + 1} of ${LEVELS.length}`, {
      fontSize: "14px",
      color: "#9aa7d9",
    });

    this.add
      .text(width / 2, 40, this.level.prompt, {
        fontSize: "22px",
        color: "#ffffff",
        align: "center",
        wordWrap: { width: 760 },
      })
      .setOrigin(0.5, 0);

    // Shuffle so the right answer isn't always in the same spot
    this.options = Phaser.Utils.Array.Shuffle(
      this.level.choices.map((text, i) => ({ text, correct: i === this.level.answer }))
    );

    this.buttons = this.options.map((opt, i) =>
      this.makeButton(width / 2, 170 + i * 66, opt.text, () => this.choose(i))
    );

    this.feedback = this.add
      .text(width / 2, 430, "", {
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
    const opt = this.options[i];

    if (opt.correct) {
      this.feedback.setColor("#6bff9b").setText("Correct! " + this.level.why);
      if (this.attempts === 0) {
        this.registry.set("score", (this.registry.get("score") || 0) + 1);
      }
      this.showContinue();
    } else if (this.attempts++ === 0) {
      // First miss: grey out that choice and give a hint
      this.buttons[i].bg.disableInteractive().setFillStyle(0x4a2a2a);
      this.buttons[i].txt.setAlpha(0.5);
      this.feedback.setColor("#ff6b6b").setText("Not quite. Hint: " + this.level.hint);
    } else {
      // Second miss: reveal the answer and move on
      const right = this.options.find((o) => o.correct).text;
      this.feedback.setColor("#ff6b6b").setText("The answer: " + right + "\n" + this.level.why);
      this.showContinue();
    }
  }

  showContinue() {
    this.buttons.forEach((b) => b.bg.disableInteractive());
    const last = this.levelIndex + 1 >= LEVELS.length;
    this.makeButton(this.scale.width / 2, 506, last ? "Finish" : "Next level", () => this.goNext());
  }

  goNext() {
    const nextIndex = this.levelIndex + 1;
    this.scene.stop(this.callerKey); // shut down the paused level
    if (nextIndex < LEVELS.length) {
      this.scene.start(LEVELS[nextIndex].scene, { levelIndex: nextIndex });
    } else {
      this.scene.start("EndScene");
    }
  }
}