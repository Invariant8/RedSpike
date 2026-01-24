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

          const bounds = divider.getDividerBounds();
          const x = Phaser.Math.Between(bounds.left + 30, bounds.right - 30);
          // Position bug ON TOP of the divider (same as hero would stand)
          const y = bounds.top - 20; // top is already TILE_SIZE/2 above divider Y

          this.setPosition(x, y);
          this.setActive(true);
          this.setVisible(true);

          // Ensure velocity is 0 initially (prevent falling)
          this.setVelocity(0, 0);

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
      * Bug will only chase if hero is on the same platform, otherwise it patrols
      */
     update(): void {
          if (!this.active || !this.targetDivider || !this.heroRef) return;

          const bounds = this.targetDivider.getDividerBounds();
          const heroX = this.heroRef.x;
          const heroY = this.heroRef.y;

          // CRITICAL: Lock Y position to divider surface every frame
          // This prevents any downward drift from physics accumulation
          const fixedY = bounds.top - 20;
          this.y = fixedY;
          this.setVelocityY(0);

          // Also ensure the physics body knows about this position
          const body = this.body as Phaser.Physics.Arcade.Body;
          if (body) {
               body.y = fixedY - body.halfHeight;
          }

          // Check if hero is on the same level (within jumping distance)
          const dividerY = this.targetDivider.getY();
          const heroOnSameLevel = Math.abs(heroY - dividerY) < 100;

          // Also check if hero is within the divider's horizontal bounds
          // This prevents the bug from running off the platform
          const heroWithinDividerBounds = heroX >= bounds.left && heroX <= bounds.right;

          if (heroOnSameLevel && heroWithinDividerBounds) {
               // Chase hero horizontally (only if hero is on this platform)
               if (heroX < this.x - 10) {
                    this.setVelocityX(-this.speed);
               } else if (heroX > this.x + 10) {
                    this.setVelocityX(this.speed);
               } else {
                    // Hero is very close, stop
                    this.setVelocityX(0);
               }
          } else {
               // Patrol on the divider (patrol back and forth)
               if (this.x <= bounds.left + 30) {
                    this.setVelocityX(this.speed);
               } else if (this.x >= bounds.right - 30) {
                    this.setVelocityX(-this.speed);
               } else if (body.velocity.x === 0) {
                    // Start moving in random direction
                    this.setVelocityX(Math.random() > 0.5 ? this.speed : -this.speed);
               }
          }

          // Always constrain to divider bounds (hard stop at edges)
          if (this.x < bounds.left + 25) {
               this.x = bounds.left + 25;
               this.setVelocityX(this.speed);
          } else if (this.x > bounds.right - 25) {
               this.x = bounds.right - 25;
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
