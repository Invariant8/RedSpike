import Phaser from 'phaser';
import { Divider, type DividerConfig } from '../objects/Divider';
import { Bug } from '../objects/Bug';
import { Star } from '../objects/Star';
import { Hero } from '../objects/Hero';
import { DifficultySystem } from './Difficulty';
import {
     GAME_WIDTH,
     LEVEL_VERTICAL_GAP,
     TILE_SIZE,
     STARS_PER_LEVEL,
     HERO_JUMP_VELOCITY,
     HERO_DOUBLE_JUMP_VELOCITY,
     GRAVITY,
} from '../constants';

interface LevelData {
     levelIndex: number;
     y: number;
     dividers: Divider[];
     bugs: Bug[];
     stars: Star[];
}

/**
 * Generator - Procedural level generator with reachability guarantee
 */
export class Generator {
     private scene: Phaser.Scene;
     private difficulty: DifficultySystem;
     private hero: Hero;

     private levels: Map<number, LevelData> = new Map();
     private currentHighestLevel: number = 0;
     private tilesGroup!: Phaser.Physics.Arcade.StaticGroup;
     private bugsGroup!: Phaser.Physics.Arcade.Group;
     private starsGroup!: Phaser.Physics.Arcade.Group;

     // Reachability constants (based on physics)
     private maxJumpHeight: number = 0;
     private maxJumpDistance: number = 0;

     constructor(scene: Phaser.Scene, difficulty: DifficultySystem, hero: Hero) {
          this.scene = scene;
          this.difficulty = difficulty;
          this.hero = hero;

          // Calculate max jump reach based on physics
          // Using kinematic equations: h = v^2 / (2g)
          const singleJumpHeight = Math.abs(HERO_JUMP_VELOCITY * HERO_JUMP_VELOCITY) / (2 * GRAVITY);
          const doubleJumpHeight = Math.abs(HERO_DOUBLE_JUMP_VELOCITY * HERO_DOUBLE_JUMP_VELOCITY) / (2 * GRAVITY);
          this.maxJumpHeight = singleJumpHeight + doubleJumpHeight * 0.7; // Double jump from apex

          // Max horizontal distance during full jump arc (time = 2v/g for up+down)
          const jumpTime = (Math.abs(HERO_JUMP_VELOCITY) / GRAVITY) * 2 + (Math.abs(HERO_DOUBLE_JUMP_VELOCITY) / GRAVITY) * 2;
          this.maxJumpDistance = 250 * jumpTime * 0.6; // 60% of theoretical max for safety

          // Create physics groups
          this.tilesGroup = this.scene.physics.add.staticGroup();
          this.bugsGroup = this.scene.physics.add.group();
          this.starsGroup = this.scene.physics.add.group();
     }

     /**
      * Get physics groups for collision setup
      */
     getTilesGroup(): Phaser.Physics.Arcade.StaticGroup {
          return this.tilesGroup;
     }

     getBugsGroup(): Phaser.Physics.Arcade.Group {
          return this.bugsGroup;
     }

     getStarsGroup(): Phaser.Physics.Arcade.Group {
          return this.starsGroup;
     }

     /**
      * Generate initial levels
      */
     generateInitialLevels(startY: number, count: number = 5): void {
          // Create ground level (level 0)
          this.createLevel(0, startY);

          // Create additional levels above
          for (let i = 1; i <= count; i++) {
               const levelY = startY - i * LEVEL_VERTICAL_GAP;
               this.createLevel(i, levelY);
          }

          this.currentHighestLevel = count;
     }

     /**
      * Create a single level with 2-3 dividers
      */
     private createLevel(levelIndex: number, y: number): LevelData {
          const numDividers = Math.random() < this.difficulty.getThreeDividerProbability() ? 3 : 2;
          const widthRange = this.difficulty.getDividerWidthRange();

          const dividers: Divider[] = [];
          const dividerConfigs: DividerConfig[] = [];

          // Generate divider positions ensuring gaps
          const totalWidth = GAME_WIDTH;
          const minGap = 80; // Minimum gap between dividers

          if (numDividers === 2) {
               // Two dividers - one on left, one on right with gap in middle
               const width1 = Phaser.Math.Between(widthRange.min, widthRange.max);
               const width2 = Phaser.Math.Between(widthRange.min, widthRange.max);

               const x1 = Phaser.Math.Between(0, 100);
               const x2 = totalWidth - width2 - Phaser.Math.Between(0, 100);

               dividerConfigs.push({ x: x1, y, width: width1 });
               dividerConfigs.push({ x: x2, y, width: width2 });
          } else {
               // Three dividers - left, center, right with two gaps
               const width1 = Phaser.Math.Between(widthRange.min, widthRange.max * 0.7);
               const width2 = Phaser.Math.Between(widthRange.min, widthRange.max * 0.7);
               const width3 = Phaser.Math.Between(widthRange.min, widthRange.max * 0.7);

               const x1 = 0;
               const x3 = totalWidth - width3;
               const x2 = Phaser.Math.Between(x1 + width1 + minGap, x3 - width2 - minGap);

               dividerConfigs.push({ x: x1, y, width: width1 });
               dividerConfigs.push({ x: x2, y, width: width2 });
               dividerConfigs.push({ x: x3, y, width: width3 });
          }

          // Ensure reachability from previous level
          if (levelIndex > 0) {
               const prevLevel = this.levels.get(levelIndex - 1);
               if (prevLevel) {
                    this.ensureReachability(prevLevel.dividers, dividerConfigs, y);
               }
          }

          // Create dividers
          for (const config of dividerConfigs) {
               const divider = new Divider(this.scene, config);
               divider.levelIndex = levelIndex;
               dividers.push(divider);

               // Add tiles to physics group
               divider.getTiles().forEach((tile) => {
                    this.tilesGroup.add(tile);
               });
          }

          // Create bugs on each divider
          const bugs: Bug[] = [];
          const bugsPerDivider = this.difficulty.getBugsPerDivider();

          for (const divider of dividers) {
               for (let i = 0; i < bugsPerDivider; i++) {
                    const bug = new Bug(this.scene, 0, 0);
                    bug.spawn(divider, this.hero, this.difficulty.getBugSpeed());
                    bugs.push(bug);
                    this.bugsGroup.add(bug);
               }
          }

          // Create stars between dividers (in the gaps)
          const stars: Star[] = [];
          for (let i = 0; i < STARS_PER_LEVEL; i++) {
               const star = new Star(this.scene, 0, 0);

               // Position stars in gaps or above dividers
               let starX: number;
               let starY: number;

               if (i === 0 && dividerConfigs.length >= 2) {
                    // Star in the first gap
                    starX = dividerConfigs[0].x + dividerConfigs[0].width + 40;
                    starY = y - TILE_SIZE - 40;
               } else if (i === 1 && dividerConfigs.length >= 3) {
                    // Star in the second gap
                    starX = dividerConfigs[1].x + dividerConfigs[1].width + 40;
                    starY = y - TILE_SIZE - 40;
               } else {
                    // Star above a random divider
                    const randomDivider = dividerConfigs[Phaser.Math.Between(0, dividerConfigs.length - 1)];
                    starX = randomDivider.x + randomDivider.width / 2;
                    starY = y - TILE_SIZE - 60 - i * 30;
               }

               star.spawn(starX, starY, this.difficulty.getStarValueMultiplier());
               stars.push(star);
               this.starsGroup.add(star);
          }

          const levelData: LevelData = {
               levelIndex,
               y,
               dividers,
               bugs,
               stars,
          };

          this.levels.set(levelIndex, levelData);
          return levelData;
     }

     /**
      * Ensure at least one divider in the new level is reachable from the previous level
      */
     private ensureReachability(
          prevDividers: Divider[],
          newConfigs: DividerConfig[],
          newY: number
     ): void {
          // Check if any new divider is reachable from any previous divider
          let isReachable = false;

          for (const prevDivider of prevDividers) {
               const prevBounds = prevDivider.getBounds();

               for (const newConfig of newConfigs) {
                    // Check if hero can reach from prev divider to new divider
                    const horizontalDistance = Math.min(
                         Math.abs(prevBounds.left - newConfig.x),
                         Math.abs(prevBounds.right - (newConfig.x + newConfig.width)),
                         Math.abs(prevBounds.left - (newConfig.x + newConfig.width)),
                         Math.abs(prevBounds.right - newConfig.x)
                    );

                    const verticalDistance = Math.abs(prevBounds.top - newY);

                    if (horizontalDistance < this.maxJumpDistance && verticalDistance < this.maxJumpHeight) {
                         isReachable = true;
                         break;
                    }
               }

               if (isReachable) break;
          }

          // If not reachable, adjust the first new divider to guarantee reachability
          if (!isReachable && prevDividers.length > 0 && newConfigs.length > 0) {
               const prevBounds = prevDividers[0].getBounds();
               const targetConfig = newConfigs[0];

               // Move the first new divider to be reachable from the first previous divider
               const targetX = prevBounds.left + Phaser.Math.Between(-50, 50);
               targetConfig.x = Phaser.Math.Clamp(targetX, 0, GAME_WIDTH - targetConfig.width);
          }
     }

     /**
      * Update generator - spawn new levels and recycle old ones
      */
     update(cameraY: number): void {
          // Check if we need to generate more levels above
          const topVisibleLevel = Math.ceil(Math.abs(cameraY) / LEVEL_VERTICAL_GAP) + 3;

          while (this.currentHighestLevel < topVisibleLevel) {
               this.currentHighestLevel++;


               // Calculate proper Y based on level 0's position
               const baseY = this.levels.get(0)?.y || 0;
               const newLevelY = baseY - this.currentHighestLevel * this.difficulty.getLevelVerticalGap();

               this.createLevel(this.currentHighestLevel, newLevelY);
               this.difficulty.setLevel(this.currentHighestLevel);
          }

          // Recycle levels that are too far below the camera
          const recycleThreshold = cameraY + 800; // Below visible area

          this.levels.forEach((level, index) => {
               if (level.y > recycleThreshold) {
                    this.recycleLevel(level);
                    this.levels.delete(index);
               }
          });
     }

     /**
      * Recycle a level's objects
      */
     private recycleLevel(level: LevelData): void {
          // Deactivate dividers
          level.dividers.forEach((divider) => {
               divider.getTiles().forEach((tile) => {
                    this.tilesGroup.remove(tile, true, true);
               });
               // divider.deactivate(); // Caused crash because tiles were already destroyed
               divider.destroy();
          });

          // Deactivate bugs
          level.bugs.forEach((bug) => {
               this.bugsGroup.remove(bug, true, true);
          });

          // Deactivate stars
          level.stars.forEach((star) => {
               this.starsGroup.remove(star, true, true);
          });
     }

     /**
      * Get the current level the hero is on
      */
     getCurrentHeroLevel(): number {
          const baseY = this.levels.get(0)?.y || 0;
          return Math.floor((baseY - this.hero.y) / LEVEL_VERTICAL_GAP);
     }

     /**
      * Reset generator for new game
      */
     reset(startY: number): void {
          // Clear all levels
          this.levels.forEach((level) => {
               this.recycleLevel(level);
          });
          this.levels.clear();

          this.currentHighestLevel = 0;
          this.difficulty.setLevel(0);

          // Generate initial levels
          this.generateInitialLevels(startY);
     }
}
