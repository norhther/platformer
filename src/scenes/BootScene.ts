export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Transition immediately to main menu
    this.scene.start('MenuScene');
  }
}
