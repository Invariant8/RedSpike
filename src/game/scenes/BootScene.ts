import Phaser from 'phaser';

export class BootScene extends Phaser.Scene {
     constructor() {
          super({ key: 'BootScene' });
     }

     preload(): void {
          // Nothing to preload in boot, just setup
     }

     create(): void {
          // Game-wide settings are handled by Phaser config
          // Proceed to preload scene
          this.scene.start('PreloadScene');
     }
}
