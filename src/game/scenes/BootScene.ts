import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
     constructor() {
          super({ key: 'BootScene' });
     }

     preload(): void {
          // Nothing to preload in boot, just setup
     }

     create(): void {
          // Set up any game-wide settings
          this.scale.pageAlignHorizontally = true;
          this.scale.pageAlignVertically = true;

          // Proceed to preload scene
          this.scene.start('PreloadScene');
     }
}
