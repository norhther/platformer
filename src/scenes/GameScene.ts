import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private ground!: Phaser.Physics.Arcade.StaticGroup;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasd!: { left: Phaser.Input.Keyboard.Key; right: Phaser.Input.Keyboard.Key; up: Phaser.Input.Keyboard.Key };
  private readonly WALK_SPEED = 180;
  private readonly JUMP_VELOCITY = -420;
  private readonly SPAWN_X = 100;
  private readonly SPAWN_Y = 500;
  public currentLevel: number = 1;

  constructor() {
    super({ key: 'GameScene' });
  }

  preload(): void {
    // Generate player texture programmatically (16x24 blue rectangle)
    const playerGfx = this.make.graphics({ x: 0, y: 0 });
    playerGfx.fillStyle(0x44aaff);
    playerGfx.fillRect(0, 0, 16, 24);
    playerGfx.generateTexture('player', 16, 24);
    playerGfx.destroy();

    // Generate ground texture programmatically (800x16 dark green rectangle)
    const groundGfx = this.make.graphics({ x: 0, y: 0 });
    groundGfx.fillStyle(0x228b22);
    groundGfx.fillRect(0, 0, 800, 16);
    groundGfx.generateTexture('ground', 800, 16);
    groundGfx.destroy();

    // Generate platform texture (120x16 tile for mid-air platforms)
    const platformGfx = this.make.graphics({ x: 0, y: 0 });
    platformGfx.fillStyle(0x8b5e3c);
    platformGfx.fillRect(0, 0, 120, 16);
    platformGfx.generateTexture('platform', 120, 16);
    platformGfx.destroy();
  }

  create(): void {
    // Ground — static physics group at bottom of canvas
    this.ground = this.physics.add.staticGroup();
    this.ground.create(400, 584, 'ground');  // y=584: 600 - 8 (half of 16px)

    // Two mid-air platforms for testability
    const platforms = this.physics.add.staticGroup();
    platforms.create(250, 430, 'platform');
    platforms.create(550, 320, 'platform');

    // Player sprite with arcade physics — spawned above ground
    this.player = this.physics.add.sprite(this.SPAWN_X, this.SPAWN_Y, 'player');
    this.player.setCollideWorldBounds(true);

    // Colliders
    this.physics.add.collider(this.player, this.ground);
    this.physics.add.collider(this.player, platforms);

    // Keyboard input
    this.cursors = this.input.keyboard!.createCursorKeys();
    this.wasd = {
      left: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      right: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      up: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
    };
  }

  update(): void {
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const onGround = body.blocked.down;

    // Horizontal movement
    const goLeft = this.cursors.left.isDown || this.wasd.left.isDown;
    const goRight = this.cursors.right.isDown || this.wasd.right.isDown;

    if (goLeft) {
      this.player.setVelocityX(-this.WALK_SPEED);
    } else if (goRight) {
      this.player.setVelocityX(this.WALK_SPEED);
    } else {
      this.player.setVelocityX(0);
    }

    // Jump — only when on ground
    const jumpPressed = Phaser.Input.Keyboard.JustDown(this.cursors.up) ||
      Phaser.Input.Keyboard.JustDown(this.cursors.space) ||
      Phaser.Input.Keyboard.JustDown(this.wasd.up);

    if (jumpPressed && onGround) {
      this.player.setVelocityY(this.JUMP_VELOCITY);
    }
  }
}
