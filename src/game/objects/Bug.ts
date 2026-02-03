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
     private fixedY: number = 0; // Fixed Y position set at spawn time
     private dividerBounds: { left: number; right: number; top: number; width: number } | null = null;

     constructor(scene: Phaser.Scene, x: number, y: number) {
          super(scene, x, y, ASSETS.BUG);

          scene.add.existing(this);
          scene.physics.add.existing(this);

          // Set up physics
          this.setDisplaySize(40, 40);
          this.setCircle(20);

          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);
          body.setImmovable(true); // Prevent physics from pushing the bug

          // Set depth so bug renders ABOVE dividers
          this.setDepth(100);

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

          // Cache divider bounds at spawn time (don't recalculate every frame)
          this.dividerBounds = divider.getDividerBounds();
          const x = Phaser.Math.Between(this.dividerBounds.left + 30, this.dividerBounds.right - 30);
          // Position bug ON TOP of the divider (same as hero would stand)
          const y = this.dividerBounds.top - 20;

          // Store fixed Y position - this won't change during gameplay
          this.fixedY = y;

          this.setPosition(x, y);
          this.setActive(true);
          this.setVisible(true);
          this.setAlpha(1); // Ensure full opacity

          // Ensure physics body is properly configured and synced
          const body = this.body as Phaser.Physics.Arcade.Body;
          if (body) {
               body.setAllowGravity(false);
               body.setImmovable(true);
               body.setVelocity(0, 0);
               // Reset body position to sync with sprite position
               body.reset(x - body.halfWidth, y - body.halfHeight);
          }

          // Ensure depth is set for proper rendering above dividers
          this.setDepth(100);

          // Kill any existing tweens before adding new one to prevent conflicts
          this.scene.tweens.killTweensOf(this);

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
          if (!this.active || !this.targetDivider || !this.heroRef || !this.dividerBounds) return;

          // FORCE visibility and opacity every frame to prevent any external modifications
          this.setAlpha(1);
          this.setVisible(true);
          this.clearTint();

          // Ensure depth is maintained (above platforms)
          if (this.depth !== 100) {
               this.setDepth(100);
          }

          // Use cached bounds instead of recalculating every frame
          const bounds = this.dividerBounds;
          const heroX = this.heroRef.x;
          const heroY = this.heroRef.y;

          // Use the fixed Y position stored at spawn time
          const body = this.body as Phaser.Physics.Arcade.Body;

          // Only correct Y position if it has drifted significantly (more than 5 pixels)
          if (Math.abs(this.y - this.fixedY) > 5) {
               this.setY(this.fixedY);
               if (body) {
                    body.y = this.fixedY - body.halfHeight;
               }
          }

          // Ensure velocity Y is always 0 (horizontal movement only)
          if (body) {
               body.velocity.y = 0;
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
               } else if (body && body.velocity.x === 0) {
                    // Start moving in random direction
                    this.setVelocityX(Math.random() > 0.5 ? this.speed : -this.speed);
               }
          }

          // Always constrain to divider bounds (hard stop at edges)
          if (this.x < bounds.left + 25) {
               this.setX(bounds.left + 25);
               this.setVelocityX(this.speed);
          } else if (this.x > bounds.right - 25) {
               this.setX(bounds.right - 25);
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
