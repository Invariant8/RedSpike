import Phaser from 'phaser';
import { ASSETS, HERO_FRAME_WIDTH, HERO_FRAME_HEIGHT } from '../constants';

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

          // Load hero spritesheets
          this.load.spritesheet(ASSETS.HERO_IDLE, 'assets/hero sprite/Idle.png', {
               frameWidth: HERO_FRAME_WIDTH,
               frameHeight: HERO_FRAME_HEIGHT,
          });

          this.load.spritesheet(ASSETS.HERO_RUN, 'assets/hero sprite/Run.png', {
               frameWidth: HERO_FRAME_WIDTH,
               frameHeight: HERO_FRAME_HEIGHT,
          });

          this.load.spritesheet(ASSETS.HERO_JUMP, 'assets/hero sprite/Jump.png', {
               frameWidth: HERO_FRAME_WIDTH,
               frameHeight: HERO_FRAME_HEIGHT,
          });

          this.load.spritesheet(ASSETS.HERO_HURT, 'assets/hero sprite/Hurt.png', {
               frameWidth: HERO_FRAME_WIDTH,
               frameHeight: HERO_FRAME_HEIGHT,
          });

          this.load.spritesheet(ASSETS.HERO_DEAD, 'assets/hero sprite/Dead.png', {
               frameWidth: HERO_FRAME_WIDTH,
               frameHeight: HERO_FRAME_HEIGHT,
          });

          // Load other assets
          this.load.image(ASSETS.BUG, 'assets/bug/saw_a.png');
          this.load.image(ASSETS.COIN, 'assets/coin/coin_01.png');
          this.load.image(ASSETS.TILE, 'assets/title/tile_0000.png');
          this.load.image(ASSETS.BACKGROUND, 'assets/background/bg.jpg');
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
               frames: this.anims.generateFrameNumbers(ASSETS.HERO_IDLE, { start: 0, end: 7 }),
               frameRate: 10,
               repeat: -1,
          });

          // Hero run animation
          this.anims.create({
               key: 'hero-run-anim',
               frames: this.anims.generateFrameNumbers(ASSETS.HERO_RUN, { start: 0, end: 7 }),
               frameRate: 12,
               repeat: -1,
          });

          // Hero jump animation
          this.anims.create({
               key: 'hero-jump-anim',
               frames: this.anims.generateFrameNumbers(ASSETS.HERO_JUMP, { start: 0, end: 9 }),
               frameRate: 10,
               repeat: 0,
          });

          // Hero hurt animation
          this.anims.create({
               key: 'hero-hurt-anim',
               frames: this.anims.generateFrameNumbers(ASSETS.HERO_HURT, { start: 0, end: 3 }),
               frameRate: 10,
               repeat: 0,
          });

          // Hero dead animation
          this.anims.create({
               key: 'hero-dead-anim',
               frames: this.anims.generateFrameNumbers(ASSETS.HERO_DEAD, { start: 0, end: 5 }),
               frameRate: 8,
               repeat: 0,
          });
     }
}
