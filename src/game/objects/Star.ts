import Phaser from 'phaser';
import { ASSETS } from '../constants';

/**
 * Star - Collectible for score
 * Using the data chip sprite as our cyberpunk collectible
 */
export class Star extends Phaser.Physics.Arcade.Sprite {
     private value: number = 10;

     constructor(scene: Phaser.Scene, x: number, y: number) {
          super(scene, x, y, ASSETS.COIN);

          scene.add.existing(this);
          scene.physics.add.existing(this);

          // Set up display - larger for data chip visibility
          this.setDisplaySize(40, 40);

          // Set up physics
          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);
          body.setImmovable(true); // Prevent any movement from physics
          body.setCircle(20);
          body.enable = true; // Ensure enabled initially

          this.setActive(false);
          this.setVisible(false);
     }

     /**
      * Spawn data chip at position
      */
     spawn(x: number, y: number, valueMultiplier: number = 1): void {
          this.setPosition(x, y);
          this.setActive(true);
          this.setVisible(true);

          const body = this.body as Phaser.Physics.Arcade.Body;
          if (body) {
               body.enable = true;
               body.setAllowGravity(false);
               body.setImmovable(true);
               body.setVelocity(0, 0); // Ensure no velocity
          }

          this.value = Math.round(10 * valueMultiplier);

          // Add floating animation - holographic hover effect
          this.scene.tweens.add({
               targets: this,
               y: y - 12,
               duration: 1000,
               yoyo: true,
               repeat: -1,
               ease: 'Sine.easeInOut',
          });

          // Add holographic flicker/glow effect
          this.scene.tweens.add({
               targets: this,
               alpha: 0.7,
               duration: 300,
               yoyo: true,
               repeat: -1,
               ease: 'Sine.easeInOut',
          });

          // Add subtle rotation for holographic effect
          this.scene.tweens.add({
               targets: this,
               angle: 10,
               duration: 1500,
               yoyo: true,
               repeat: -1,
               ease: 'Sine.easeInOut',
          });
     }

     /**
      * Collect the star
      */
     collect(): number {
          // Play collect animation
          this.scene.tweens.killTweensOf(this);

          this.scene.tweens.add({
               targets: this,
               scaleX: 0,
               scaleY: 0,
               alpha: 0,
               y: this.y - 30,
               duration: 200,
               onComplete: () => {
                    this.deactivate();
               },
          });

          return this.value;
     }

     /**
      * Deactivate the star
      */
     deactivate(): void {
          this.setActive(false);
          this.setVisible(false);
          this.scene.tweens.killTweensOf(this);
          this.setScale(1);
          this.setAlpha(1);
     }

     /**
      * Get the value of this star
      */
     getValue(): number {
          return this.value;
     }
}
