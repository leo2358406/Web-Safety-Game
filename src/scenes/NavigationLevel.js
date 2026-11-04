const WORLD_W = 2400;
const WORLD_H = 1600;
const SPEED = 220;

// A wall splits the map. The only way through is the gap.
const WALL_X = 1200;
const GAP_TOP = 650;
const GAP_BOTTOM = 950;

// The Ad Network zone covers the gap
const ZONE_X = WALL_X;
const ZONE_Y = (GAP_TOP + GAP_BOTTOM) / 2;
const ZONE_R = 200;

// Reaching the coffee shop door ends the level
const DOOR_X = 2150;
const DOOR_Y = 440;
const DOOR_R = 80;

class NavigationLevel extends Phaser.Scene {
  constructor() {
    super("NavigationLevel");
  }

  init(data) {
    this.levelIndex = (data && data.levelIndex) || 0;
  }

  create() {
    // Reset state every time the level starts
    this.trail = [];       // {x, y} points the player has visited
    this.distance = 0;
    this.elapsed = 0;
    this.sharing = false;
    this.strangerIdx = 0;  // which trail point the stranger is currently on
    this.finished = false;

    this.createTextures();
    this.buildWorld();
    this.buildPlayer();
    this.buildPhone();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.keys = this.input.keyboard.addKeys("W,A,S,D");

    // Record a trail point and advance the stranger 10 times per second
    this.time.addEvent({ delay: 100, loop: true, callback: this.tick, callbackScope: this });
  }

  // ---------- setup helpers ----------

  createTextures() {
    if (this.textures.exists("player")) return;
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0x4cc9f0, 1);
    g.fillRoundedRect(0, 0, 30, 30, 8);
    g.generateTexture("player", 30, 30);
    g.destroy();
  }

  // A solid rectangle the player can't walk through (optional text label)
  addSolid(x, y, w, h, color, label) {
    const r = this.add.rectangle(x, y, w, h, color);
    this.physics.add.existing(r, true); // true = static body
    this.solids.push(r);
    if (label) {
      this.add.text(x, y, label, { fontSize: "18px", color: "#ffffff" }).setOrigin(0.5);
    }
  }

  buildWorld() {
    this.physics.world.setBounds(0, 0, WORLD_W, WORLD_H);
    this.cameras.main.setBounds(0, 0, WORLD_W, WORLD_H);

    // Ground with a grid so you can see yourself moving
    const g = this.add.graphics();
    g.fillStyle(0x1a2040, 1).fillRect(0, 0, WORLD_W, WORLD_H);
    g.lineStyle(1, 0x262f57, 1);
    for (let x = 0; x <= WORLD_W; x += 200) g.lineBetween(x, 0, x, WORLD_H);
    for (let y = 0; y <= WORLD_H; y += 200) g.lineBetween(0, y, WORLD_W, y);

    this.solids = [];

    // Ad Network zone (a visible red circle over the gap in the wall)
    this.add.circle(ZONE_X, ZONE_Y, ZONE_R, 0xff4d4d, 0.15).setStrokeStyle(2, 0xff4d4d, 0.8);
    this.add
      .text(ZONE_X, ZONE_Y - ZONE_R - 20, "AD NETWORK", { fontSize: "18px", color: "#ff8a8a" })
      .setOrigin(0.5);

    // The wall: one piece above the gap, one below
    this.addSolid(WALL_X, GAP_TOP / 2, 60, GAP_TOP, 0x3a3f6b);
    this.addSolid(WALL_X, (GAP_BOTTOM + WORLD_H) / 2, 60, WORLD_H - GAP_BOTTOM, 0x3a3f6b);

    // Buildings
    this.addSolid(200, 1400, 200, 160, 0x3b4a8c, "HOME");
    this.addSolid(2150, 300, 240, 200, 0x8c6b3b, "COFFEE SHOP");
    this.add.rectangle(2150, 396, 60, 10, 0xffd166); // the door

    // Extra obstacles to steer around
    this.addSolid(600, 1000, 160, 160, 0x2f3a6b);
    this.addSolid(500, 500, 200, 200, 0x2f3a6b);
    this.addSolid(1700, 1100, 200, 160, 0x2f3a6b);
    this.addSolid(1700, 600, 160, 200, 0x2f3a6b);
    this.addSolid(2150, 900, 180, 180, 0x2f3a6b);

    this.add
      .text(16, 16, "WASD or arrow keys to move\nGet to the coffee shop", {
        fontSize: "14px",
        color: "#9aa7d9",
      })
      .setScrollFactor(0)
      .setDepth(10);
  }

  buildPlayer() {
    this.player = this.physics.add.sprite(200, 1240, "player");
    this.player.setCollideWorldBounds(true);
    this.solids.forEach((s) => this.physics.add.collider(this.player, s));

    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    // Shift the player left of center so the phone doesn't cover them
    this.cameras.main.setFollowOffset(-120, 0);
  }

  buildPhone() {
    const px = 725, py = 25, pw = 210, ph = 400;
    const g = this.add.graphics().setScrollFactor(0).setDepth(10);
    g.fillStyle(0x05060d, 1).fillRoundedRect(px, py, pw, ph, 26);                    // phone body
    g.fillStyle(0x1b2140, 1).fillRoundedRect(px + 8, py + 8, pw - 16, ph - 16, 20); // screen

    this.map = { x: px + 18, y: py + 60, w: pw - 36, h: 160 };
    g.fillStyle(0x24304f, 1).fillRect(this.map.x, this.map.y, this.map.w, this.map.h);

    // Uniform scale so the mini-map isn't stretched, centered in its box
    this.mapScale = Math.min((this.map.w - 20) / WORLD_W, (this.map.h - 20) / WORLD_H);
    this.mapOffX = this.map.x + (this.map.w - WORLD_W * this.mapScale) / 2;
    this.mapOffY = this.map.y + (this.map.h - WORLD_H * this.mapScale) / 2;
    g.fillStyle(0x2c3a63, 1).fillRect(
      this.mapOffX, this.mapOffY, WORLD_W * this.mapScale, WORLD_H * this.mapScale
    );

    const textStyle = { fontSize: "14px", color: "#cfd8ff", wordWrap: { width: pw - 36 } };

    this.add
      .text(px + 18, py + 16, "NaviGo", { fontSize: "18px", color: "#ffffff", fontStyle: "bold" })
      .setScrollFactor(0).setDepth(12);
    this.add
      .text(px + 18, py + 38, "Navigating to: Coffee Shop", { fontSize: "12px", color: "#9aa7d9" })
      .setScrollFactor(0).setDepth(12);

    this.statsText = this.add
      .text(this.map.x, this.map.y + this.map.h + 14, "", textStyle)
      .setScrollFactor(0).setDepth(12);
    this.statusText = this.add
      .text(this.map.x, this.map.y + this.map.h + 70, "Data sharing: private", { ...textStyle, color: "#9aa7d9" })
      .setScrollFactor(0).setDepth(12);

    // Cleared and redrawn every frame (trail + dots)
    this.trailG = this.add.graphics().setScrollFactor(0).setDepth(11);
  }

  // ---------- game logic ----------

  // Converts a world position into a point on the phone's mini-map
  mapPoint(wx, wy) {
    return { x: this.mapOffX + wx * this.mapScale, y: this.mapOffY + wy * this.mapScale };
  }

  tick() {
    const p = { x: this.player.x, y: this.player.y };
    const last = this.trail[this.trail.length - 1];
    if (!last) {
      this.trail.push(p);
    } else {
      const d = Phaser.Math.Distance.Between(last.x, last.y, p.x, p.y);
      if (d > 4) {
        this.distance += d;
        this.trail.push(p);
      }
    }
    this.elapsed += 0.1;

    // The stranger follows your trail, staying a few points behind you
    if (this.sharing) {
      this.strangerIdx = Math.min(this.strangerIdx + 1, Math.max(0, this.trail.length - 7));
    }
  }

  startSharing() {
    this.sharing = true;
    this.strangerIdx = Math.max(0, this.trail.length - 40);
    this.statusText.setText("Data sharing: ON (partners)").setColor("#ff6b6b");
  }

  finishLevel() {
    this.finished = true;
    this.player.setVelocity(0, 0);
    this.scene.launch("QuestionScene", {
      levelIndex: this.levelIndex,
      callerKey: "NavigationLevel",
    });
    this.scene.pause(); // freeze this scene but keep it visible behind the question
  }

  drawPhone() {
    this.trailG.clear();

    // Destination marker
    const dest = this.mapPoint(DOOR_X, 396);
    this.trailG.fillStyle(0xffd166, 1).fillCircle(dest.x, dest.y, 4);

    if (this.trail.length > 1) {
      this.trailG.lineStyle(3, 0x4cc9f0, 1);
      this.trailG.beginPath();
      this.trail.forEach((pt, i) => {
        const m = this.mapPoint(pt.x, pt.y);
        if (i === 0) this.trailG.moveTo(m.x, m.y);
        else this.trailG.lineTo(m.x, m.y);
      });
      this.trailG.strokePath();
    }

    const me = this.mapPoint(this.player.x, this.player.y);
    this.trailG.fillStyle(0x4cc9f0, 1).fillCircle(me.x, me.y, 6);

    if (this.sharing) {
      const sp = this.trail[this.strangerIdx];
      const s = this.mapPoint(sp.x, sp.y);
      this.trailG.fillStyle(0xff4d4d, 1).fillCircle(s.x, s.y, 6);
    }

    this.statsText.setText(
      `Distance: ${Math.round(this.distance / 10)} m\nTime: ${Math.floor(this.elapsed)} s`
    );
  }

  update() {
    if (this.finished) return;

    const left = this.cursors.left.isDown || this.keys.A.isDown;
    const right = this.cursors.right.isDown || this.keys.D.isDown;
    const up = this.cursors.up.isDown || this.keys.W.isDown;
    const down = this.cursors.down.isDown || this.keys.S.isDown;

    const vx = (right ? 1 : 0) - (left ? 1 : 0);
    const vy = (down ? 1 : 0) - (up ? 1 : 0);
    this.player.setVelocity(vx * SPEED, vy * SPEED);
    // Keep diagonal speed the same as straight-line speed
    this.player.body.velocity.normalize().scale(SPEED);

    const dZone = Phaser.Math.Distance.Between(this.player.x, this.player.y, ZONE_X, ZONE_Y);
    if (!this.sharing && dZone < ZONE_R) this.startSharing();

    const dDoor = Phaser.Math.Distance.Between(this.player.x, this.player.y, DOOR_X, DOOR_Y);
    if (dDoor < DOOR_R) this.finishLevel();

    this.drawPhone();
  }
}