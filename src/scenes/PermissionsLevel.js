class PermissionsLevel extends BaseLevel {
  constructor() {
    super("PermissionsLevel");
  }

  setup() {
    this.worldW = 1600;
    this.worldH = 1000;
    this.spawn = { x: 150, y: 500 };
    this.objective = "Your phone is leaking data. Stop every leak!";
  }

  build() {
    this.activeLeaks = 4;
    this.stolen = 0;

    // The data collector on the right
    this.addSolid(1400, 500, 200, 600, 0x8c3b5a, "DATA\nCOLLECTOR");

    const names = ["LOCATION", "CONTACTS", "CAMERA", "MICROPHONE"];
    const ys = [250, 410, 590, 750];

    names.forEach((name, i) => {
      const y = ys[i];

      // A pipe with a red dot flowing into the collector
      const pipe = this.add.rectangle(990, y, 620, 6, 0xff4d4d);
      const dot = this.add.circle(680, y, 8, 0xff4d4d);
      const tween = this.tweens.add({
        targets: dot,
        x: 1290,
        duration: 1400,
        repeat: -1,
        delay: i * 250,
      });

      this.addInteractable({
        x: 600, y, w: 150, h: 70, color: 0x3b4a8c, label: name,
        onUse: (s) => this.switchOff(s, name, pipe, dot, tween),
      });
    });

    // Every half second, each active leak steals more data
    this.time.addEvent({
      delay: 500,
      loop: true,
      callback: () => {
        if (this.activeLeaks > 0) {
          this.stolen += this.activeLeaks;
          this.updateHud();
        }
      },
    });

    this.addExit(150, 850);
  }

  ready() {
    this.updateHud();
  }

  updateHud() {
    this.setHud(`Leaks left: ${this.activeLeaks}\nData stolen: ${this.stolen}`);
  }

  switchOff(s, name, pipe, dot, tween) {
    tween.stop();
    dot.setVisible(false);
    pipe.setFillStyle(0x6bff9b);
    s.rect.setFillStyle(0x2e7d4f);
    s.text.setText(name + "\nOFF");

    this.activeLeaks--;
    this.updateHud();

    if (this.activeLeaks === 0) {
      this.say("All permissions locked. The leaks stopped! Head to the exit.", 4000);
      this.enableZone(this.exit);
    } else {
      this.say(name + " access turned off. That leak stopped.", 2500);
    }
  }
}