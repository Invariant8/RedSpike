import Phaser from 'phaser';
import { ASSETS } from '../constants';

export class PreloadScene extends Phaser.Scene {
     constructor() {
          super({ key: 'PreloadScene' });
     }

     preload(): void {
          // Create loading bar
          const width = this.cameras.main.width;
          const height = this.cameras.main.height;

          const progressBar = this.add.graphics();
          const progressBox = this.add.graphics();
          progressBox.fillStyle(0x222222, 0.8);
          progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50);

          const loadingText = this.add.text(width / 2, height / 2 - 50, 'Loading...', {
               font: '24px Arial',
               color: '#ffffff',
          });
          loadingText.setOrigin(0.5, 0.5);

          this.load.on('progress', (value: number) => {
               progressBar.clear();
               progressBar.fillStyle(0x00ff88, 1);
               progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30);
          });

          this.load.on('complete', () => {
               progressBar.destroy();
               progressBox.destroy();
               loadingText.destroy();
          });

          // Load cyberpunk hero images
          this.load.image(ASSETS.HERO_IDLE, 'assets/cyberpunk_hero_idle.png');
          this.load.image(ASSETS.HERO_RUN_1, 'assets/cyberpunk_hero_run1.png');
          this.load.image(ASSETS.HERO_RUN_2, 'assets/cyberpunk_hero_run2.png');
          this.load.image(ASSETS.HERO_JUMP, 'assets/cyberpunk_hero_jump.png');
          this.load.image(ASSETS.HERO_HURT, 'assets/cyberpunk_hero_hurt.png');
          this.load.image(ASSETS.HERO_DEAD, 'assets/cyberpunk_hero_hurt.png');

          // Load cyberpunk game assets
          this.load.image(ASSETS.BUG, 'assets/cyberpunk_enemy.png');
          this.load.image(ASSETS.COIN, 'assets/cyberpunk_coin.png');
          this.load.image(ASSETS.TILE, 'assets/cyberpunk_platform.png');
          // Load the cyberpunk city background
          this.load.image(ASSETS.BACKGROUND, 'assets/Gemini_Generated_Image_d5ztlmd5ztlmd5zt.png');
     }

     create(): void {
          // Create animations
          this.createAnimations();

          // Start game scene
          this.scene.start('GameScene');
     }

     private createAnimations(): void {
          // Hero idle animation
          this.anims.create({
               key: 'hero-idle-anim',
               frames: [{ key: ASSETS.HERO_IDLE }],
               frameRate: 10,
               repeat: -1,
          });

          // Hero run animation
          this.anims.create({
               key: 'hero-run-anim',
               frames: [
                    { key: ASSETS.HERO_RUN_1 },
                    { key: ASSETS.HERO_RUN_2 }
               ],
               frameRate: 8,
               repeat: -1,
          });

          // Hero jump animation
          this.anims.create({
               key: 'hero-jump-anim',
               frames: [{ key: ASSETS.HERO_JUMP }],
               frameRate: 10,
               repeat: 0,
          });

          // Hero hurt animation
          this.anims.create({
               key: 'hero-hurt-anim',
               frames: [{ key: ASSETS.HERO_HURT }],
               frameRate: 10,
               repeat: 0,
          });

          // Hero dead animation
          this.anims.create({
               key: 'hero-dead-anim',
               frames: [{ key: ASSETS.HERO_DEAD }],
               frameRate: 8,
               repeat: 0,
          });
     }
}
