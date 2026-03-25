import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private levelText!: Phaser.GameObjects.Text;
  private level: number = 1;

  constructor() {
    super({ key: 'UIScene' });
  }

  init(data: { level: number }): void {
    // Receive level from GameScene.create() launch call
    this.level = data?.level ?? 1;
  }

  create(): void {
    // HUD text — top-left corner, always on top of GameScene
    this.levelText = this.add.text(16, 16, `Level: ${this.level}`, {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#00000066',
      padding: { x: 8, y: 4 },
    });

    // UIScene sits above GameScene in display order — no depth adjustment needed
    // Canvas width 800, height 600 — text at (16,16) is safely in top-left
  }

  update(): void {
    // Sync level from GameScene in case it changes during play
    const gameScene = this.scene.get('GameScene') as unknown as { currentLevel: number } | null;
    if (gameScene && this.levelText) {
      const currentLevel = gameScene.currentLevel ?? this.level;
      this.levelText.setText(`Level: ${currentLevel}`);
    }
  }
}
