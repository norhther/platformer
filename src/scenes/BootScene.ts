export default class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create(): void {
    // Solid background colour to confirm canvas is rendering
    this.cameras.main.setBackgroundColor('#1a1a2e');

    // Placeholder text — replaced in Phase 2 with a real main menu
    const { width, height } = this.scale;
    this.add
      .text(width / 2, height / 2, 'Platformer\n(Phase 1 — Canvas OK)', {
        fontSize: '24px',
        color: '#e0e0e0',
        align: 'center',
      })
      .setOrigin(0.5);
  }
}
