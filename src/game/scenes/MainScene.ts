import Phaser from 'phaser';

export class MainScene extends Phaser.Scene {
  private paddle!: Phaser.Physics.Arcade.Sprite;
  private ball!: Phaser.Physics.Arcade.Sprite;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  
  // Game state
  private score: number = 0;
  private combo: number = 1;
  private isGameOver: boolean = false;
  
  // UI
  private scoreText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  
  // Groups
  private platforms!: Phaser.Physics.Arcade.Group;
  private breakables!: Phaser.Physics.Arcade.Group;
  private gravityWells!: Phaser.Physics.Arcade.Group;
  private portals!: Phaser.Physics.Arcade.Group;
  private speedBoosters!: Phaser.Physics.Arcade.Group;
  
  private pickups!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.Group;

  // Configuration from React
  private paddleColor: number = 0x00ffff;
  private ballColor: number = 0xffffff;
  private trailColor: number = 0x00ffff;
  private arenaType: string = 'classic';
  
  private lastPortalTime: number = 0;

  constructor() {
    super({ key: 'MainScene' });
  }

  init(data: any) {
    this.paddleColor = data.paddleColor ?? 0x00ffff;
    this.arenaType = data.arenaType ?? 'classic';
    this.ballColor = data.ballColor ?? 0xffffff;
    this.trailColor = data.trailColor ?? 0x00ffff;
    
    this.score = 0;
    this.combo = 1;
    this.isGameOver = false;
    this.lastPortalTime = 0;
  }

  create() {
    // Determine physics based on arena
    if (this.arenaType === 'gravity') {
      this.physics.world.gravity.y = 100;
    } else {
      this.physics.world.gravity.y = 0;
    }

    this.createGraphics();
    this.createPlayer();
    this.createBall();
    this.createGroups();
    this.setupCollisions();
    this.createUI();

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    this.resetBall();

    // Spawn obstacles over time
    if (this.arenaType !== 'classic') {
      this.time.addEvent({
        delay: 3000,
        callback: this.spawnObstacle,
        callbackScope: this,
        loop: true
      });
    }

    // Spawn pickups/hazards
    this.time.addEvent({
      delay: 5000,
      callback: this.spawnItem,
      callbackScope: this,
      loop: true
    });
  }

  private createGraphics() {
    // Paddle - Use white base for tinting
    const paddleG = this.make.graphics({ x: 0, y: 0 });
    paddleG.fillStyle(0xffffff, 1);
    paddleG.fillRoundedRect(0, 0, 80, 15, 5); // Slightly smaller for mobile
    paddleG.generateTexture('paddle', 80, 15);
    paddleG.destroy();

    // Ball - Use white base for tinting
    const ballG = this.make.graphics({ x: 0, y: 0 });
    ballG.fillStyle(0xffffff, 1);
    ballG.fillCircle(8, 8, 8);
    ballG.generateTexture('ball', 16, 16);
    ballG.destroy();

    // Platform
    const platG = this.make.graphics({ x: 0, y: 0 });
    platG.fillStyle(0x888888, 1);
    platG.fillRect(0, 0, 60, 15);
    platG.generateTexture('platform', 60, 15);
    platG.destroy();

    // Breakable
    const breakG = this.make.graphics({ x: 0, y: 0 });
    breakG.fillStyle(0xffaa00, 1);
    breakG.fillRect(0, 0, 50, 15);
    breakG.generateTexture('breakable', 50, 15);
    breakG.destroy();

    // Gravity Well
    const gravG = this.make.graphics({ x: 0, y: 0 });
    gravG.lineStyle(2, 0x8800ff, 0.8);
    gravG.strokeCircle(20, 20, 20);
    gravG.generateTexture('well', 40, 40);
    gravG.destroy();
    
    // Portal
    const portG = this.make.graphics({ x: 0, y: 0 });
    portG.lineStyle(3, 0x00aaff, 1);
    portG.strokeEllipse(15, 25, 15, 25);
    portG.generateTexture('portal', 30, 50);
    portG.destroy();
    
    // Speed Booster
    const speedG = this.make.graphics({ x: 0, y: 0 });
    speedG.fillStyle(0xffff00, 1);
    speedG.beginPath();
    speedG.moveTo(0, 15);
    speedG.lineTo(15, 0);
    speedG.lineTo(30, 15);
    speedG.lineTo(30, 30);
    speedG.lineTo(15, 15);
    speedG.lineTo(0, 30);
    speedG.closePath();
    speedG.fillPath();
    speedG.generateTexture('speedBooster', 30, 30);
    speedG.destroy();

    // Pickup
    const pickG = this.make.graphics({ x: 0, y: 0 });
    pickG.fillStyle(0x00ff00, 1);
    pickG.fillCircle(10, 10, 10);
    pickG.generateTexture('pickup', 20, 20);
    pickG.destroy();

    // Hazard
    const hazG = this.make.graphics({ x: 0, y: 0 });
    hazG.fillStyle(0xff0000, 1);
    hazG.fillRect(0, 0, 16, 16);
    hazG.generateTexture('hazard', 16, 16);
    hazG.destroy();
  }

  private createPlayer() {
    this.paddle = this.physics.add.sprite(this.scale.width / 2, this.scale.height - 50, 'paddle');
    this.paddle.setImmovable(true);
    this.paddle.setCollideWorldBounds(true);
    
    // Add glow effect using tint
    this.paddle.setTint(this.paddleColor);
  }

  private createBall() {
    this.ball = this.physics.add.sprite(this.scale.width / 2, this.scale.height / 2, 'ball');
    this.ball.setCollideWorldBounds(true);
    this.ball.setBounce(1.02, 1.02); // Slightly increases speed over time
    this.ball.setMaxVelocity(1000, 1000); // Increased max velocity for speed boosters
    this.ball.setTint(this.ballColor); // Apply custom ball color

    // Add particle emitter for trail
    const particles = this.add.particles(0, 0, 'ball', {
        speed: 20,
        scale: { start: 0.8, end: 0 },
        alpha: { start: 0.6, end: 0 },
        blendMode: 'ADD',
        lifespan: 400,
        tint: this.trailColor // Use the equipped trail color
    });
    particles.startFollow(this.ball);

    this.physics.world.on('worldbounds', (body: Phaser.Physics.Arcade.Body, _up: boolean, down: boolean) => {      if (body.gameObject === this.ball) {
        if (down) {
          this.handleGameOver();
        } else {
          this.incrementScore(10);
        }
      }
    });
    this.ball.setCollideWorldBounds(true, 1, 1, true);
  }

  private createGroups() {
    this.platforms = this.physics.add.group();
    this.breakables = this.physics.add.group();
    this.gravityWells = this.physics.add.group();
    this.portals = this.physics.add.group();
    this.speedBoosters = this.physics.add.group();
    
    this.pickups = this.physics.add.group();
    this.hazards = this.physics.add.group();

    if (this.arenaType === 'obstacle' || this.arenaType === 'gravity') {
      // Initial static obstacles
      for (let i = 0; i < 3; i++) {
        const x = Phaser.Math.Between(50, this.scale.width - 50);
        const y = Phaser.Math.Between(100, this.scale.height / 2);
        const b = this.breakables.create(x, y, 'breakable') as Phaser.Physics.Arcade.Sprite;
        b.setImmovable(true);
      }
    }
  }

  private setupCollisions() {
    this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, undefined, this);
    this.physics.add.collider(this.ball, this.platforms);
    this.physics.add.collider(this.ball, this.breakables, this.hitBreakable, undefined, this);
    
    this.physics.add.overlap(this.ball, this.pickups, this.hitPickup, undefined, this);
    this.physics.add.overlap(this.ball, this.hazards, this.hitHazard, undefined, this);
    this.physics.add.overlap(this.paddle, this.pickups, this.hitPickupPaddle, undefined, this);
    this.physics.add.overlap(this.paddle, this.hazards, this.hitHazardPaddle, undefined, this);
    
    this.physics.add.overlap(this.ball, this.portals, this.hitPortal, undefined, this);
    this.physics.add.overlap(this.ball, this.speedBoosters, this.hitSpeedBooster, undefined, this);
  }

  private createUI() {
    this.scoreText = this.add.text(20, 20, 'Score: 0', { 
        fontFamily: 'Orbitron, sans-serif', 
        fontSize: '24px', 
        color: '#0ff' 
    });
    this.comboText = this.add.text(20, 50, 'Combo: x1', { 
        fontFamily: 'Orbitron, sans-serif', 
        fontSize: '18px', 
        color: '#f0f' 
    });
  }

  update() {
    if (this.isGameOver) return;

    // Paddle movement
    let usingKeyboard = false;
    if (this.cursors.left.isDown) {
      this.paddle.setVelocityX(-800);
      usingKeyboard = true;
    } else if (this.cursors.right.isDown) {
      this.paddle.setVelocityX(800);
      usingKeyboard = true;
    } else {
      this.paddle.setVelocityX(0);
    }

    // Pointer (Mouse/Touch) movement
    const pointer = this.input.activePointer;
    const hasPointerMoved = pointer.x !== 0 || pointer.y !== 0;
    
    if (!usingKeyboard && hasPointerMoved) {
      const targetX = pointer.worldX;
      const diff = targetX - this.paddle.x;
      if (Math.abs(diff) > 5) {
        this.paddle.setVelocityX(diff * 15);
      } else {
        this.paddle.setVelocityX(0);
        this.paddle.setX(targetX); // Snap to exact position if very close
      }
    }

    // Apply gravity wells
    this.gravityWells.getChildren().forEach((child: any) => {
      const well = child as Phaser.Physics.Arcade.Sprite;
      const distance = Phaser.Math.Distance.Between(this.ball.x, this.ball.y, well.x, well.y);
      if (distance < 150) {
        const angle = Phaser.Math.Angle.Between(this.ball.x, this.ball.y, well.x, well.y);
        this.ball.body!.velocity.x += Math.cos(angle) * 10;
        this.ball.body!.velocity.y += Math.sin(angle) * 10;
      }
      return true;
    });
  }

  private resetBall() {
    this.ball.setPosition(this.scale.width / 2, this.scale.height / 2 + 50);
    const angle = Phaser.Math.Between(225, 315);
    const speed = 400;
    const velocity = this.physics.velocityFromAngle(angle, speed);
    this.ball.setVelocity(velocity.x, velocity.y);
    this.combo = 1;
    this.updateComboText();
  }

  private hitPaddle(ball: any, paddle: any) {
    this.incrementScore(50);
    this.combo += 1;
    this.updateComboText();
    
    let diff = 0;
    if (ball.x < paddle.x) {
        diff = paddle.x - ball.x;
        ball.setVelocityX(-10 * diff);
    } else if (ball.x > paddle.x) {
        diff = ball.x - paddle.x;
        ball.setVelocityX(10 * diff);
    } else {
        ball.setVelocityX(2 + Math.random() * 8);
    }
  }

  private hitBreakable(_ball: any, breakable: any) {
    this.incrementScore(100);
    breakable.destroy();
    this.cameras.main.shake(100, 0.005);
  }

  private hitPickup(_ball: any, pickup: any) {
    this.incrementScore(200);
    this.combo += 2;
    this.updateComboText();
    pickup.destroy();
  }
  
  private hitPickupPaddle(_paddle: any, pickup: any) {
    this.incrementScore(200);
    this.combo += 2;
    this.updateComboText();
    pickup.destroy();
  }

  private hitHazard(_ball: any, hazard: any) {
    this.combo = 1;
    this.updateComboText();
    this.score = Math.max(0, this.score - 500);
    this.scoreText.setText('Score: ' + this.score);
    hazard.destroy();
    this.cameras.main.shake(200, 0.01);
  }
  
  private hitHazardPaddle(_paddle: any, hazard: any) {
    this.combo = 1;
    this.updateComboText();
    this.score = Math.max(0, this.score - 500);
    this.scoreText.setText('Score: ' + this.score);
    hazard.destroy();
    this.cameras.main.shake(200, 0.01);
  }
  
  private hitPortal(_ball: any, portal: any) {
    const time = this.time.now;
    if (time - this.lastPortalTime < 500) return; // Cooldown for teleporting
    
    // Find the other portal
    const portals = this.portals.getChildren() as Phaser.Physics.Arcade.Sprite[];
    const otherPortal = portals.find(p => p !== portal);
    
    if (otherPortal) {
      this.ball.setPosition(otherPortal.x, otherPortal.y);
      this.lastPortalTime = time;
      this.cameras.main.flash(200, 0, 170, 255);
    }
  }
  
  private hitSpeedBooster(_ball: any, booster: any) {
    booster.destroy();
    
    // Increase ball speed temporarily or permanently for this combo
    const currentVel = this.ball.body!.velocity;
    this.ball.setVelocity(currentVel.x * 1.5, currentVel.y * 1.5);
    
    this.incrementScore(150);
    this.cameras.main.flash(200, 255, 255, 0);
  }

  private spawnObstacle() {
    if (this.isGameOver) return;
    const type = Phaser.Math.Between(0, 4); // 5 types now
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    
    if (type === 0 && this.platforms.countActive() < 2) {
      const p = this.platforms.create(x, 100, 'platform') as Phaser.Physics.Arcade.Sprite;
      p.setImmovable(true);
      p.setVelocityX(Phaser.Math.Between(50, 150) * (Math.random() > 0.5 ? 1 : -1));
      p.setBounce(1, 0);
      p.setCollideWorldBounds(true);
    } else if (type === 1 && this.breakables.countActive() < 5) {
      const b = this.breakables.create(x, Phaser.Math.Between(100, this.scale.height / 2), 'breakable') as Phaser.Physics.Arcade.Sprite;
      b.setImmovable(true);
    } else if (type === 2 && this.gravityWells.countActive() < 1) {
      const w = this.gravityWells.create(x, Phaser.Math.Between(150, this.scale.height / 2 + 100), 'well') as Phaser.Physics.Arcade.Sprite;
      w.setImmovable(true);
      this.time.delayedCall(5000, () => { if (w.active) w.destroy(); });
    } else if (type === 3 && this.portals.countActive() === 0) {
      // Spawn two portals
      const p1 = this.portals.create(50, Phaser.Math.Between(150, this.scale.height / 2 + 50), 'portal') as Phaser.Physics.Arcade.Sprite;
      const p2 = this.portals.create(this.scale.width - 50, Phaser.Math.Between(150, this.scale.height / 2 + 50), 'portal') as Phaser.Physics.Arcade.Sprite;
      p1.setImmovable(true);
      p2.setImmovable(true);
      
      this.time.delayedCall(8000, () => { 
        if (p1.active) p1.destroy(); 
        if (p2.active) p2.destroy(); 
      });
    } else if (type === 4 && this.speedBoosters.countActive() < 2) {
      const s = this.speedBoosters.create(x, Phaser.Math.Between(150, this.scale.height / 2 + 100), 'speedBooster') as Phaser.Physics.Arcade.Sprite;
      s.setImmovable(true);
      
      this.time.delayedCall(6000, () => { if (s.active) s.destroy(); });
    }
  }

  private spawnItem() {
    if (this.isGameOver) return;
    const isHazard = Math.random() > 0.6;
    const x = Phaser.Math.Between(30, this.scale.width - 30);
    
    if (isHazard) {
      const h = this.hazards.create(x, -20, 'hazard') as Phaser.Physics.Arcade.Sprite;
      h.setVelocityY(100);
    } else {
      const p = this.pickups.create(x, -20, 'pickup') as Phaser.Physics.Arcade.Sprite;
      p.setVelocityY(100);
    }
  }

  private incrementScore(points: number) {
    this.score += points * this.combo;
    this.scoreText.setText('Score: ' + this.score);
  }

  private updateComboText() {
    this.comboText.setText('Combo: x' + this.combo);
    if (this.combo > 1) {
      this.comboText.setScale(1.2);
      this.time.delayedCall(100, () => {
        if (this.comboText.active) this.comboText.setScale(1);
      });
    }
  }

  private handleGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.physics.pause();
    this.ball.setTint(0xff0000);
    
    // Slight delay before transitioning back to React
    this.time.delayedCall(1000, () => {
      this.game.events.emit('gameover', this.score);
    });
  }
}
