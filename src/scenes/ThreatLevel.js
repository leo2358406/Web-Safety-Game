class ThreatLevel extends BaseLevel {
  constructor() {
    super("ThreatLevel");
  }

  setup() {
    this.worldW = 1600;
    this.worldH = 1000;
    this.spawn = { x: 150, y: 500 };
    this.objective = "Privacy inspection! Check all 4 stations.";
  }

  build() {
    this.checked = 0;

    const stations = [
      { x: 550, y: 300, label: "PUBLIC\nWI-FI", risky: true,
        msg: "Anyone on an open network might be able to snoop on what you send. That's a concern!" },
      { x: 1050, y: 300, label: "LINK FROM\nA STRANGER", risky: true,
        msg: "Unknown links can lead to fake login pages that steal your info. That's a concern!" },
      { x: 550, y: 700, label: "PUBLIC POST:\nADDRESS + SCHEDULE", risky: true,
        msg: "Posting where you live and when you're out tells strangers how to find you. That's a concern!" },
      { x: 1050, y: 700, label: "SECURITY\nUPDATE", risky: false,
        msg: "Updates fix known security holes. Installing them helps protect you, so no concern here." },
    ];

    stations.forEach((st) => {
      this.addInteractable({
        x: st.x, y: st.y, w: 200, h: 100, color: 0x3b4a8c, label: st.label,
        onUse: (s) => this.inspect(s, st),
      });
    });

    this.addExit(1450, 500);
  }

  ready() {
    this.updateHud();
  }

  updateHud() {
    this.setHud(`Inspected: ${this.checked}/4`);
  }

  inspect(s, st) {
    s.rect.setFillStyle(st.risky ? 0x9b2c2c : 0x2e7d4f);
    this.add
      .text(s.x, s.y - 70, st.risky ? "CONCERN" : "SAFE", {
        fontSize: "16px",
        fontStyle: "bold",
        color: st.risky ? "#ff8a8a" : "#6bff9b",
      })
      .setOrigin(0.5);

    this.checked++;
    this.updateHud();

    if (this.checked === 4) {
      this.say(st.msg + "\nAll stations inspected! Head to the exit.", 5000);
      this.enableZone(this.exit);
    } else {
      this.say(st.msg, 4500);
    }
  }
}