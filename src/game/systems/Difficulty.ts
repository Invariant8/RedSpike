import { BUG_SPEED, DIVIDER_MAX_WIDTH, DIVIDER_MIN_WIDTH, LEVEL_VERTICAL_GAP } from '../constants';

/**
 * Difficulty scaling system based on current level/height
 */
export class DifficultySystem {
     private currentLevel: number = 0;

     /**
      * Update the current level the player has reached
      */
     setLevel(level: number): void {
          this.currentLevel = level;
     }

     getLevel(): number {
          return this.currentLevel;
     }

     /**
      * Get the current bug speed (increases with level)
      */
     getBugSpeed(): number {
          // Gradually increase bug speed, capping at 2x original speed
          const multiplier = 1 + Math.min(this.currentLevel * 0.02, 1);
          return BUG_SPEED * multiplier;
     }

     /**
      * Get the divider width range for current difficulty
      * Dividers get narrower as difficulty increases
      */
     getDividerWidthRange(): { min: number; max: number } {
          // Gradually decrease max width, making platforms smaller
          const reduction = Math.min(this.currentLevel * 5, 100);
          return {
               min: DIVIDER_MIN_WIDTH,
               max: Math.max(DIVIDER_MIN_WIDTH + 50, DIVIDER_MAX_WIDTH - reduction),
          };
     }

     /**
      * Get vertical gap between levels (slight increase with difficulty)
      */
     getLevelVerticalGap(): number {
          // Slightly increase gap at higher levels
          const increase = Math.min(this.currentLevel * 2, 40);
          return LEVEL_VERTICAL_GAP + increase;
     }

     /**
      * Get probability of spawning 3 dividers vs 2 (harder = more 2-divider levels)
      */
     getThreeDividerProbability(): number {
          // Start with 50% chance of 3 dividers, decrease to 30% as difficulty rises
          return Math.max(0.3, 0.5 - this.currentLevel * 0.01);
     }

     /**
      * Get number of bugs per divider
      */
     getBugsPerDivider(): number {
          // Start with 1, increase to 2 at level 10, 3 at level 25
          if (this.currentLevel >= 25) return 3;
          if (this.currentLevel >= 10) return 2;
          return 1;
     }

     /**
      * Get star value multiplier
      */
     getStarValueMultiplier(): number {
          return 1 + Math.floor(this.currentLevel / 5) * 0.5;
     }
}
