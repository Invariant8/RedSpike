import Phaser from 'phaser';
import { ASSETS, BUG_SPEED } from '../constants';
import { Divider } from './Divider';

/**
 * Bug - Enemy that chases the hero horizontally on a divider
 */
export class Bug extends Phaser.Physics.Arcade.Sprite {
     private targetDivider: Divider | null = null;
     private speed: number = BUG_SPEED;
     private heroRef: Phaser.Physics.Arcade.Sprite | null = null;

     constructor(scene: Phaser.Scene, x: number, y: number) {
          super(scene, x, y, ASSETS.BUG);

          scene.add.existing(this);
          scene.physics.add.existing(this);

          // Set up physics
          this.setDisplaySize(40, 40);
          this.setCircle(20);

          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);

          this.setActive(false);
          this.setVisible(false);
     }

     /**
      * Spawn bug on a specific divider
      */
     spawn(divider: Divider, heroRef: Phaser.Physics.Arcade.Sprite, speed: number = BUG_SPEED): void {
          this.targetDivider = divider;
          this.heroRef = heroRef;
          this.speed = speed;

          const bounds = divider.getBounds();
          const x = Phaser.Math.Between(bounds.left + 30, bounds.right - 30);
          const y = bounds.top - 20; // Position above the divider

          this.setPosition(x, y);
          this.setActive(true);
          this.setVisible(true);

          // Add rotation animation for saw blade effect
          this.scene.tweens.add({
               targets: this,
               angle: 360,
               duration: 1000,
               repeat: -1,
          });
     }

     /**
      * Update bug movement - chase hero horizontally if on same divider level
      */
     update(): void {
          if (!this.active || !this.targetDivider || !this.heroRef) return;

          const bounds = this.targetDivider.getBounds();
          const heroX = this.heroRef.x;
          const heroY = this.heroRef.y;

          // Check if hero is on the same level (within jumping distance)
          const dividerY = this.targetDivider.getY();
          const heroOnSameLevel = Math.abs(heroY - dividerY) < 100;

          if (heroOnSameLevel) {
               // Chase hero horizontally
               if (heroX < this.x) {
                    this.setVelocityX(-this.speed);
               } else if (heroX > this.x) {
                    this.setVelocityX(this.speed);
               }
          } else {
               // Patrol on the divider
               const body = this.body as Phaser.Physics.Arcade.Body;
               if (this.x <= bounds.left + 20) {
                    this.setVelocityX(this.speed);
               } else if (this.x >= bounds.right - 20) {
                    this.setVelocityX(-this.speed);
               } else if (body.velocity.x === 0) {
                    // Start moving in random direction
                    this.setVelocityX(Math.random() > 0.5 ? this.speed : -this.speed);
               }
          }

          // Constrain to divider bounds
          if (this.x < bounds.left + 20) {
               this.x = bounds.left + 20;
               this.setVelocityX(this.speed);
          } else if (this.x > bounds.right - 20) {
               this.x = bounds.right - 20;
               this.setVelocityX(-this.speed);
          }
     }

     /**
      * Deactivate the bug
      */
     deactivate(): void {
          this.setActive(false);
          this.setVisible(false);
          if (this.body) {
               this.setVelocity(0, 0);
          }
          this.scene.tweens.killTweensOf(this);
          this.targetDivider = null;
     }

     /**
      * Get the divider this bug is on
      */
     getDivider(): Divider | null {
          return this.targetDivider;
     }
}
