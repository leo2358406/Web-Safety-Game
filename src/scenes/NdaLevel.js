class NdaLevel extends BaseLevel {
  constructor() {
    super("NdaLevel");
  }

  setup() {
    this.worldW = 1800;
    this.worldH = 1000;
    this.spawn = { x: 150, y: 500 };
    this.objective = "First day at Project Nova.";
  }

  build() {
    this.sawSecret = false;

    const label = { fontSize: "22px", color: "#5a6aa8" };
    this.add.text(400, 60, "LOBBY", label).setOrigin(0.5);
    this.add.text(1150, 60, "SECRET LAB", label).setOrigin(0.5);
    this.add.text(1600, 60, "STREET", label).setOrigin(0.5);

    // Wall with a locked lab door in the middle
    this.addSolid(800, 210, 40, 420, 0x3a3f6b);
    this.addSolid(800, 790, 40, 420, 0x3a3f6b);
    this.door = this.addSolid(800, 500, 40, 160, 0xd9a441);

    // The contract on the boss's desk
    this.addInteractable({
      x: 400, y: 300, w: 160, h: 90, color: 0x8c6b3b, label: "CONTRACT\n(NDA)",
      onUse: () => {
        this.removeSolid(this.door);
        this.say("You signed the Non-Disclosure Agreement. The lab door unlocked!", 3500);
        this.setHud("Next: see the prototype in the lab");
      },
    });

    // The secret prototype
    this.addInteractable({
      x: 1100, y: 500, w: 160, h: 110, color: 0x3b8c6e, label: "SECRET\nPROTOTYPE",
      onUse: () => {
        this.sawSecret = true;
        this.say("Project Nova: a brand-new secret phone. Only people who signed the NDA may know about it.", 4500);
        this.setHud("Next: head out to the street");
      },
    });

    // Your friend Sam, and a rival company's spy nearby
    this.addInteractable({
      x: 1600, y: 500, w: 130, h: 90, color: 0x4a90d9, label: "SAM\n(friend)", once: false,
      onUse: (s) => this.talkToSam(s),
    });
    this.addSolid(1700, 330, 130, 80, 0x8c3b3b, "RIVAL\nCO.");

    this.addExit(1650, 850);
  }

  ready() {
    this.setHud("Task: sign the contract on the desk");
  }

  talkToSam(s) {
    if (!this.sawSecret) {
      this.say("Sam: Hey! Big first day? Go see what they're working on!", 3500);
      return;
    }
    s.enabled = false;
    this.say(
      "Sam: Come on, what's the secret project?!\nYou: I can't. I signed an NDA. And that rival company is right behind us!",
      6000
    );
    this.enableZone(this.exit);
    this.setHud("Head to the exit");
  }
}