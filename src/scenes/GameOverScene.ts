import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  private level: number = 1;

  constructor() {
    super({ key: 'GameOverScene' });
  }

  init(data: { level: number }): void {
    this.level = data?.level ?? 1;
  }

  create(): void {
    const { width, height } = this.scale;

    // Dark semi-transparent overlay
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.7);

    // Game Over title
    this.add.text(width / 2, height / 3, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff4444',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Level info
    this.add.text(width / 2, height / 2 - 20, `Level ${this.level}`, {
      fontSize: '24px',
      color: '#e0e0e0',
    }).setOrigin(0.5);

    // Retry button
    const retryButton = this.add.text(width / 2, height / 2 + 50, '[ RETRY ]', {
      fontSize: '32px',
      color: '#44aaff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    retryButton.on('pointerover', () => retryButton.setColor('#ffffff'));
    retryButton.on('pointerout', () => retryButton.setColor('#44aaff'));
    retryButton.on('pointerdown', () => {
      // Restart GameScene fresh, then launch UIScene overlay again
      this.scene.start('GameScene');
    });
  }
}
