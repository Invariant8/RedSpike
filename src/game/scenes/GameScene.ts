import Phaser from 'phaser';
import { Hero } from '../objects/Hero';
import { Bug } from '../objects/Bug';
import { Star } from '../objects/Star';
import { Generator } from '../systems/Generator';
import { DifficultySystem } from '../systems/Difficulty';
import {
     ASSETS,
     GAME_WIDTH,
     GAME_HEIGHT,
     GRAVITY,
     CAMERA_LERP,
     CAMERA_OFFSET_Y,
     TILE_SIZE,
} from '../constants';

// Event bus for React communication
export const gameEvents = new Phaser.Events.EventEmitter();

export class GameScene extends Phaser.Scene {
     private hero!: Hero;
     private generator!: Generator;
     private difficulty!: DifficultySystem;
     private background!: Phaser.GameObjects.Image;
     private backgroundStartY: number = 0;
     private highestY: number = 0;
     private isGameOver: boolean = false;

     constructor() {
          super({ key: 'GameScene' });
     }

     create(): void {
          // Reset game state
          this.isGameOver = false;

          // Create scrolling background (non-repeating)
          this.background = this.add.image(
               GAME_WIDTH / 2,
               GAME_HEIGHT / 2,
               ASSETS.BACKGROUND
          );

          // Scale background to fit game width while maintaining aspect ratio
          const bgTexture = this.textures.get(ASSETS.BACKGROUND);
          const bgFrame = bgTexture.getSourceImage();
          const bgWidth = bgFrame.width;

          const scaleX = GAME_WIDTH / bgWidth;
          // Scale Y proportionally
          const scaleY = scaleX;
          this.background.setScale(scaleX, scaleY);

          // Store initial Y position for parallax calculation
          this.backgroundStartY = GAME_HEIGHT / 2;

          // Position background at initial camera view
          this.background.setScrollFactor(0);
          this.background.setDepth(-10);

          // Set up physics
          this.physics.world.gravity.y = GRAVITY;
          this.physics.world.setBounds(0, -Infinity, GAME_WIDTH, Infinity);

          // Create difficulty system
          this.difficulty = new DifficultySystem();

          // Calculate starting position - ground level Y where platforms will be
          const startY = GAME_HEIGHT - 100;

          // Create hero - position hero ON TOP of the ground platform
          // The ground platform will be at startY, hero should be on top of it
          this.hero = new Hero(this, GAME_WIDTH / 2, startY - TILE_SIZE - 30);
          this.highestY = this.hero.y;

          // Set up hero event callbacks
          this.hero.onLivesChange = (lives: number) => {
               gameEvents.emit('livesChange', lives);
          };

          this.hero.onScoreChange = (score: number) => {
               gameEvents.emit('scoreChange', score);
          };

          this.hero.onGameOver = () => {
               this.handleGameOver();
          };

          // Create generator
          this.generator = new Generator(this, this.difficulty, this.hero);
          this.generator.generateInitialLevels(startY);

          // Set up collisions
          this.setupCollisions();

          // Set up camera
          this.setupCamera();

          // Emit initial state
          gameEvents.emit('livesChange', this.hero.getLives());
          gameEvents.emit('scoreChange', this.hero.getScore());
          gameEvents.emit('gameStart');
     }

     private setupCollisions(): void {
          // Hero vs tiles (platforms)
          this.physics.add.collider(this.hero, this.generator.getTilesGroup());

          // Hero vs bugs
          this.physics.add.overlap(
               this.hero,
               this.generator.getBugsGroup(),
               this.handleBugCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
               undefined,
               this
          );

          // Hero vs stars
          this.physics.add.overlap(
               this.hero,
               this.generator.getStarsGroup(),
               this.handleStarCollision as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback,
               undefined,
               this
          );
     }

     private handleBugCollision(
          heroObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
          bugObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
     ): void {
          const hero = heroObj as Hero;
          const bug = bugObj as Bug;

          if (!hero.getIsInvulnerable() && !hero.getIsDead()) {
               // Check if hero is jumping on top of the bug
               const heroBody = hero.body as Phaser.Physics.Arcade.Body;
               const bugBody = bug.body as Phaser.Physics.Arcade.Body;

               // Hero is above bug and moving downward
               const heroBottom = heroBody.y + heroBody.height;
               const bugTop = bugBody.y;
               const isJumpingOnTop = heroBottom < bugTop + 20 && heroBody.velocity.y > 0;

               if (isJumpingOnTop) {
                    // Hero jumped over/on the bug - give a small bounce
                    hero.setVelocityY(-200);
                    // Optionally destroy the bug or just let hero pass
               } else {
                    // Hero hit the bug from the side or below
                    hero.takeDamage();
               }
          }
     }

     private handleStarCollision(
          heroObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile,
          starObj: Phaser.Types.Physics.Arcade.GameObjectWithBody | Phaser.Tilemaps.Tile
     ): void {
          const hero = heroObj as Hero;
          const star = starObj as Star;

          if (star.active) {
               const points = star.collect();
               hero.addScore(points);

               // Immediately disable physics body to prevent multiple collisions
               const body = star.body as Phaser.Physics.Arcade.Body;
               body.enable = false;
          }
     }

     private setupCamera(): void {
          // Set camera to follow hero with lerp
          this.cameras.main.startFollow(this.hero, true, CAMERA_LERP, CAMERA_LERP);
          this.cameras.main.setFollowOffset(0, CAMERA_OFFSET_Y);

          // Only follow upward - don't go back down
          this.cameras.main.setBounds(0, -Infinity, GAME_WIDTH, Infinity);
     }

     update(): void {
          if (this.isGameOver) return;

          // Update hero
          this.hero.update();

          // Track highest point reached
          if (this.hero.y < this.highestY) {
               this.highestY = this.hero.y;
          }

          // Prevent camera from going back down
          const cameraY = this.cameras.main.scrollY;
          if (cameraY > this.highestY + CAMERA_OFFSET_Y) {
               this.cameras.main.scrollY = this.highestY + CAMERA_OFFSET_Y;
          }

          // Update generator (spawn/recycle levels)
          this.generator.update(cameraY);

          // Update difficulty based on level
          const currentLevel = this.generator.getCurrentHeroLevel();
          gameEvents.emit('levelChange', currentLevel);

          // Update background parallax - move background up as player climbs
          // Using a slower rate (0.4) so background moves slower than camera, creating depth
          this.background.y = this.backgroundStartY - cameraY * 0.4;

          // Update all active bugs
          const bugs = this.generator.getBugsGroup().getChildren() as Bug[];
          bugs.forEach((bug) => {
               if (bug.active) {
                    bug.update();
               }
          });

          // Check if hero fell too far below camera (safety respawn on nearest platform)
          const fallLimit = cameraY + GAME_HEIGHT + 200;
          if (this.hero.y > fallLimit) {
               // Hero fell - respawn on a platform (lose a life handled by damage)
               this.hero.takeDamage();
               // Teleport hero back up
               this.hero.setPosition(GAME_WIDTH / 2, cameraY + GAME_HEIGHT / 2);
               this.hero.setVelocity(0, 0);
          }
     }

     private handleGameOver(): void {
          this.isGameOver = true;
          gameEvents.emit('gameOver', this.hero.getScore());
     }

     /**
      * Restart the game
      */
     restartGame(): void {
          this.scene.restart();
     }
}
