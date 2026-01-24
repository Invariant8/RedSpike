import Phaser from 'phaser';
import {
     ASSETS,
     HERO_SPEED,
     HERO_JUMP_VELOCITY,
     HERO_DOUBLE_JUMP_VELOCITY,
     HERO_START_LIVES,
     HERO_INVULNERABILITY_TIME,
     HERO_FRAME_WIDTH,
     HERO_FRAME_HEIGHT,
} from '../constants';

export type HeroState = 'idle' | 'running' | 'jumping' | 'falling' | 'hurt' | 'dead';

export class Hero extends Phaser.Physics.Arcade.Sprite {
     private lives: number = HERO_START_LIVES;
     private score: number = 0;
     private canDoubleJump: boolean = false;
     private hasDoubleJumped: boolean = false;
     private isInvulnerable: boolean = false;
     private currentState: HeroState = 'idle';
     private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
     private spaceKey!: Phaser.Input.Keyboard.Key;
     private isDead: boolean = false;

     // Event emitters for React HUD
     public onLivesChange: ((lives: number) => void) | null = null;
     public onScoreChange: ((score: number) => void) | null = null;
     public onGameOver: (() => void) | null = null;

     constructor(scene: Phaser.Scene, x: number, y: number) {
          super(scene, x, y, ASSETS.HERO_IDLE);

          scene.add.existing(this);
          scene.physics.add.existing(this);

          // Set up sprite
          this.setDisplaySize(HERO_FRAME_WIDTH * 1.5, HERO_FRAME_HEIGHT * 1.5);

          // Set up physics body
          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setSize(30, 50);
          body.setOffset(17, 10);
          body.setCollideWorldBounds(false);

          // Set up input
          if (scene.input.keyboard) {
               this.cursors = scene.input.keyboard.createCursorKeys();
               this.spaceKey = scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
          }

          // Play idle animation
          this.play('hero-idle-anim');
     }

     /**
      * Update hero logic
      */
     update(): void {
          if (this.isDead) return;

          const body = this.body as Phaser.Physics.Arcade.Body;
          const onGround = body.blocked.down || body.touching.down;

          // Reset double jump when landing
          if (onGround) {
               this.canDoubleJump = true;
               this.hasDoubleJumped = false;
          }

          // Handle horizontal movement
          if (this.cursors.left.isDown) {
               this.setVelocityX(-HERO_SPEED);
               this.setFlipX(true);
          } else if (this.cursors.right.isDown) {
               this.setVelocityX(HERO_SPEED);
               this.setFlipX(false);
          } else {
               this.setVelocityX(0);
          }

          // Handle jumping
          if (Phaser.Input.Keyboard.JustDown(this.spaceKey) || Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
               if (onGround) {
                    // Normal jump
                    this.setVelocityY(HERO_JUMP_VELOCITY);
                    this.play('hero-jump-anim', true);
               } else if (this.canDoubleJump && !this.hasDoubleJumped) {
                    // Double jump
                    this.setVelocityY(HERO_DOUBLE_JUMP_VELOCITY);
                    this.hasDoubleJumped = true;
                    this.canDoubleJump = false;
                    this.play('hero-jump-anim', true);
               }
          }

          // Update animation state
          this.updateAnimation(onGround);
     }

     /**
      * Update animation based on state
      */
     private updateAnimation(onGround: boolean): void {
          if (this.isDead) return;

          const body = this.body as Phaser.Physics.Arcade.Body;
          const isMovingHorizontally = Math.abs(body.velocity.x) > 10;

          if (this.currentState === 'hurt') return; // Don't interrupt hurt animation

          if (!onGround) {
               if (this.currentState !== 'jumping' && this.currentState !== 'falling') {
                    this.play('hero-jump-anim', true);
                    this.currentState = body.velocity.y < 0 ? 'jumping' : 'falling';
               }
          } else if (isMovingHorizontally) {
               if (this.currentState !== 'running') {
                    this.play('hero-run-anim', true);
                    this.currentState = 'running';
               }
          } else {
               if (this.currentState !== 'idle') {
                    this.play('hero-idle-anim', true);
                    this.currentState = 'idle';
               }
          }
     }

     /**
      * Take damage from a bug
      */
     takeDamage(): void {
          if (this.isInvulnerable || this.isDead) return;

          this.lives--;
          this.onLivesChange?.(this.lives);

          if (this.lives <= 0) {
               this.die();
               return;
          }

          // Enter hurt state
          this.currentState = 'hurt';
          this.play('hero-hurt-anim', true);
          this.isInvulnerable = true;

          // Visual feedback - flashing
          this.scene.tweens.add({
               targets: this,
               alpha: 0.3,
               duration: 100,
               yoyo: true,
               repeat: 10,
               onComplete: () => {
                    this.setAlpha(1);
               },
          });

          // Reset after animation
          this.scene.time.delayedCall(500, () => {
               if (!this.isDead) {
                    this.currentState = 'idle';
               }
          });

          // End invulnerability
          this.scene.time.delayedCall(HERO_INVULNERABILITY_TIME, () => {
               this.isInvulnerable = false;
          });
     }

     /**
      * Hero dies
      */
     private die(): void {
          this.isDead = true;
          this.currentState = 'dead';
          this.play('hero-dead-anim', true);
          this.setVelocity(0, 0);

          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(false);

          this.scene.time.delayedCall(1000, () => {
               this.onGameOver?.();
          });
     }

     /**
      * Add to score
      */
     addScore(points: number): void {
          this.score += points;
          this.onScoreChange?.(this.score);
     }

     /**
      * Get current lives
      */
     getLives(): number {
          return this.lives;
     }

     /**
      * Get current score
      */
     getScore(): number {
          return this.score;
     }

     /**
      * Check if hero is invulnerable
      */
     getIsInvulnerable(): boolean {
          return this.isInvulnerable;
     }

     /**
      * Check if hero is dead
      */
     getIsDead(): boolean {
          return this.isDead;
     }

     /**
      * Reset hero for new game
      */
     reset(x: number, y: number): void {
          this.setPosition(x, y);
          this.setVelocity(0, 0);
          this.lives = HERO_START_LIVES;
          this.score = 0;
          this.isDead = false;
          this.isInvulnerable = false;
          this.currentState = 'idle';
          this.canDoubleJump = false;
          this.hasDoubleJumped = false;
          this.setAlpha(1);
          this.play('hero-idle-anim', true);

          const body = this.body as Phaser.Physics.Arcade.Body;
          body.setAllowGravity(true);

          this.onLivesChange?.(this.lives);
          this.onScoreChange?.(this.score);
     }
}
