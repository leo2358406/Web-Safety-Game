class PasswordLevel extends BaseLevel {
  constructor() {
    super("PasswordLevel");
  }

  setup() {
    this.worldW = 1600;
    this.worldH = 1000;
    this.spawn = { x: 200, y: 500 };
    this.objective = "You use one password for everything.";
  }

  build() {
    // Three accounts, all protected by the SAME password
    this.shop = this.addInteractable({
      x: 800, y: 300, w: 200, h: 120, color: 0x3b4a8c, label: "SHOP\nsame password",
      onUse: () => this.loginShop(),
    });
    this.email = this.addSolid(800, 500, 200, 120, 0x3b4a8c, "EMAIL\nsame password");
    this.bank = this.addSolid(800, 700, 200, 120, 0x3b4a8c, "BANK\nsame password");

    // The hacker (hidden until the breach)
    this.hacker = this.add
      .container(1000, 300, [
        this.add.rectangle(0, 0, 34, 34, 0xff4d4d),
        this.add.text(0, -34, "HACKER", { fontSize: "14px", color: "#ff8a8a" }).setOrigin(0.5),
      ])
      .setVisible(false)
      .setDepth(5);

    this.addExit(1450, 500);
  }

  ready() {
    this.setHud("Task: log in to the shop");
  }

  loginShop() {
    this.frozen = true;
    this.setHud("");
    this.say("You log in to the SHOP with your usual password...", 2200);

    this.time.delayedCall(2400, () => {
      this.hacker.setVisible(true);
      this.shop.rect.setFillStyle(0x9b2c2c);
      this.shop.text.setText("SHOP\nBREACHED!");
      this.say("The shop gets hacked and your password leaks!", 2600);

      this.time.delayedCall(2800, () =>
        this.hackNext(
          [
            { account: this.email, name: "EMAIL", y: 500,
              msg: "The hacker tries your leaked password on your EMAIL... it works!" },
            { account: this.bank, name: "BANK", y: 700,
              msg: "...and on your BANK. One leaked password opened everything." },
          ],
          0
        )
      );
    });
  }

  // Moves the hacker to each account in turn and "breaks in"
  hackNext(list, i) {
    if (i >= list.length) {
      this.frozen = false;
      this.enableZone(this.exit);
      this.setHud("Head to the exit");
      return;
    }
    const step = list[i];
    this.tweens.add({
      targets: this.hacker,
      y: step.y,
      duration: 900,
      onComplete: () => {
        step.account.rect.setFillStyle(0x9b2c2c);
        step.account.text.setText(step.name + "\nHACKED!");
        this.say(step.msg, 2600);
        this.time.delayedCall(2800, () => this.hackNext(list, i + 1));
      },
    });
  }
}