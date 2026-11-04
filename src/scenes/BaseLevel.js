const PLAYER_SPEED = 220;
const INTERACT_RANGE = 55;

class BaseLevel extends Phaser.Scene {
  init(data) {
    this.levelIndex = (data && data.levelIndex) || 0;
  }

  // ---------- hooks each level overrides ----------
  setup() {}     // set this.worldW, this.worldH, this.spawn, this.objective
  build() {}     // add solids, zones, interactables
  ready() {}     // runs once the player exists
  onUpdate() {}  // runs every frame

  create() {
    this.finished = false;
    this.frozen = false; // true during cutscenes: the player can't move
    this.toast = null;
    this.toastTimer = null;

    // Defaults (a level's setup() can change these)
    this.worldW = 1600;
    this.worldH = 1000;
    this.spawn = { x: 150, y: 500 };
    this.objective = "";
    this.groundColor = 0x1a2040;
    this.setup();

    this.createTextures();
    this.physics.world.setBounds(0, 0, this.worldW, this.worldH);
    this.cameras.main.setBounds(0, 0, this.worldW, this.worldH);
    this.drawGround();

    this.solids = [];
    this.zones = [];
    this.interactables = [];
    this.build();

    this.player = this.physics.add.sprite(this.spawn.x, this.spawn.y, "player");
    this.player.setCollideWorldBounds(true);
    this.solids.forEach((s) => this.physics.add.collider(this.player, s));
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D,E,SPACE");

    this.promptText = this.add
      .text(0, 0, "Press E", {
        fontSize: "14px",
        color: "#ffd166",
        backgroundColor: "rgba(0,0,0,0.6)",
        padding: { x: 4, y: 2 },
      })
      .setOrigin(0.5)
      .setDepth(20)
      .setVisible(false);

    this.add
      .text(16, 16, this.objective + "\nWASD / arrows to move, E to interact", {
        fontSize: "14px",
        color: "#9aa7d9",
      })
      .setScrollFactor(0)
      .setDepth(10);

    this.hud = this.add
      .text(this.scale.width - 16, 16, "", { fontSize: "16px", color: "#ffd166", align: "right" })
      .setOrigin(1, 0)
      .setScrollFactor(0)
      .setDepth(10);

    this.ready();
  }

  // ---------- building blocks ----------

  createTextures() {
    if (this.textures.exists("player")) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x4cc9f0, 1);
    g.fillRoundedRect(0, 0, 30, 30, 8);
    g.generateTexture("player", 30, 30);
    g.destroy();
  }

  drawGround() {
    const g = this.add.graphics();
    g.fillStyle(this.groundColor, 1).fillRect(0, 0, this.worldW, this.worldH);
    g.lineStyle(1, 0x262f57, 1);
    for (let x = 0; x <= this.worldW; x += 200) g.lineBetween(x, 0, x, this.worldH);
    for (let y = 0; y <= this.worldH; y += 200) g.lineBetween(0, y, this.worldW, y);
  }

  // A solid rectangle the player can't walk through, with an optional label
  addSolid(x, y, w, h, color, label) {
    const rect = this.add.rectangle(x, y, w, h, color);
    this.physics.add.existing(rect, true); // true = static body
    this.solids.push(rect);
    let text = null;
    if (label) {
      text = this.add
        .text(x, y, label, { fontSize: "16px", color: "#ffffff", align: "center", wordWrap: { width: w - 8 } })
        .setOrigin(0.5);
    }
    return { rect, text, x, y, w, h };
  }

  // Makes a solid (like a door) stop blocking and disappear
  removeSolid(s) {
    s.rect.body.enable = false;
    s.rect.setVisible(false);
    if (s.text) s.text.setVisible(false);
  }

  // A solid object you can use by standing next to it and pressing E.
  // cfg: { x, y, w, h, color, label, onUse, once }  (once defaults to true)
  addInteractable(cfg) {
    const s = this.addSolid(cfg.x, cfg.y, cfg.w, cfg.h, cfg.color, cfg.label);
    s.onUse = cfg.onUse;
    s.once = cfg.once !== false;
    s.enabled = true;
    this.interactables.push(s);
    return s;
  }

  // A circle that triggers onEnter when the player walks into it.
  // opts: { color, label, onEnter, enabled, once }
  addZone(x, y, r, opts = {}) {
    const color = opts.color || 0xff4d4d;
    const enabled = opts.enabled !== false;
    const circle = this.add
      .circle(x, y, r, color, enabled ? 0.18 : 0.05)
      .setStrokeStyle(2, color, enabled ? 0.8 : 0.25);
    let text = null;
    if (opts.label) {
      text = this.add.text(x, y - r - 18, opts.label, { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    }
    const zone = {
      x, y, r, color, circle, text, enabled,
      once: opts.once !== false,
      fired: false,
      inside: false,
      onEnter: opts.onEnter || (() => {}),
    };
    this.zones.push(zone);
    return zone;
  }

  enableZone(zone) {
    zone.enabled = true;
    zone.circle.setFillStyle(zone.color, 0.3).setStrokeStyle(3, zone.color, 1);
  }

  // The exit starts locked. Call this.enableZone(this.exit) when the level is solved.
  addExit(x, y) {
    this.exit = this.addZone(x, y, 90, {
      color: 0x6bff9b,
      label: "EXIT",
      enabled: false,
      onEnter: () => this.finishLevel(),
    });
    return this.exit;
  }

  // Message banner at the bottom of the screen
  say(text, ms = 3000) {
    if (!this.toast) {
      this.toast = this.add
        .text(this.scale.width / 2, this.scale.height - 20, "", {
          fontSize: "18px",
          color: "#ffffff",
          backgroundColor: "rgba(0,0,0,0.75)",
          padding: { x: 14, y: 8 },
          align: "center",
          wordWrap: { width: 800 },
        })
        .setOrigin(0.5, 1)
        .setScrollFactor(0)
        .setDepth(30);
    }
    this.toast.setText(text).setVisible(true);
    if (this.toastTimer) this.toastTimer.remove();
    this.toastTimer = this.time.delayedCall(ms, () => this.toast.setVisible(false));
  }

  setHud(text) {
    this.hud.setText(text);
  }

  finishLevel() {
    if (this.finished) return;
    this.finished = true;
    this.player.setVelocity(0, 0);
    this.scene.launch("QuestionScene", {
      levelIndex: this.levelIndex,
      callerKey: this.scene.key,
    });
    this.scene.pause(); // freeze this scene but keep it visible behind the question
  }

  // ---------- per-frame logic ----------

  updateInteractables() {
    let best = null;
    let bestDist = INTERACT_RANGE;
    for (const it of this.interactables) {
      if (!it.enabled) continue;
      // distance from the player to the object's edge, not its center
      const dx = Math.max(Math.abs(this.player.x - it.x) - it.w / 2, 0);
      const dy = Math.max(Math.abs(this.player.y - it.y) - it.h / 2, 0);
      const d = Math.hypot(dx, dy);
      if (d < bestDist) {
        best = it;
        bestDist = d;
      }
    }

    if (!best) {
      this.promptText.setVisible(false);
      return;
    }
    this.promptText.setPosition(best.x, best.y - best.h / 2 - 16).setVisible(true);

    const pressed =
      Phaser.Input.Keyboard.JustDown(this.keys.E) || Phaser.Input.Keyboard.JustDown(this.keys.SPACE);
    if (pressed) {
      if (best.once) best.enabled = false;
      best.onUse(best);
    }
  }

  updateZones() {
    for (const z of this.zones) {
      if (!z.enabled) continue;
      const inside = Phaser.Math.Distance.Between(this.player.x, this.player.y, z.x, z.y) < z.r;
      if (inside && !z.inside && !(z.once && z.fired)) {
        z.fired = true;
        z.onEnter(z);
      }
      z.inside = inside;
    }
  }

  update() {
    if (this.finished) return;

    if (this.frozen) {
      this.player.setVelocity(0, 0);
      this.promptText.setVisible(false);
    } else {
      const left = this.cursors.left.isDown || this.keys.A.isDown;
      const right = this.cursors.right.isDown || this.keys.D.isDown;
      const up = this.cursors.up.isDown || this.keys.W.isDown;
      const down = this.cursors.down.isDown || this.keys.S.isDown;

      this.player.setVelocity(
        ((right ? 1 : 0) - (left ? 1 : 0)) * PLAYER_SPEED,
        ((down ? 1 : 0) - (up ? 1 : 0)) * PLAYER_SPEED
      );
      this.player.body.velocity.normalize().scale(PLAYER_SPEED);

      this.updateInteractables();
    }

    this.updateZones();
    this.onUpdate();
  }
}