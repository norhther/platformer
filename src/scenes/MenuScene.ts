export default class MenuScene extends Phaser.Scene {
  constructor() {
    super({ key: 'MenuScene' });
  }

  create(): void {
    const { width, height } = this.scale;

    // Title text — centered
    this.add.text(width / 2, height / 3, 'PLATFORMER', {
      fontSize: '48px',
      color: '#e0e0e0',
      fontStyle: 'bold',
    }).setOrigin(0.5);

    // Play button — interactive text
    const playButton = this.add.text(width / 2, height / 2, '[ PLAY ]', {
      fontSize: '32px',
      color: '#44aaff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playButton.on('pointerover', () => playButton.setColor('#ffffff'));
    playButton.on('pointerout', () => playButton.setColor('#44aaff'));
    playButton.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
