import Phaser from 'phaser';
import { TitleBox } from './TitleBox';
import { TILE_SIZE } from '../constants';

export interface DividerConfig {
     x: number;
     y: number;
     width: number; // width in pixels
}

/**
 * Divider - A horizontal platform composed of multiple TitleBox tiles
 */
export class Divider extends Phaser.GameObjects.Container {
     private tiles: TitleBox[] = [];
     private dividerWidth: number = 0;
     private dividerY: number = 0;
     private dividerX: number = 0;
     public levelIndex: number = 0;

     constructor(scene: Phaser.Scene, config: DividerConfig) {
          super(scene, 0, 0);

          scene.add.existing(this);

          this.create(config);
     }

     /**
      * Create the divider with tiles
      */
     create(config: DividerConfig): void {
          this.dividerX = config.x;
          this.dividerY = config.y;
          this.dividerWidth = config.width;

          const numTiles = Math.ceil(config.width / TILE_SIZE);

          // Clear existing tiles
          this.clearTiles();

          // Create tiles
          for (let i = 0; i < numTiles; i++) {
               const tileX = config.x + i * TILE_SIZE + TILE_SIZE / 2;
               const tileY = config.y;

               const tile = new TitleBox(this.scene, tileX, tileY);
               this.tiles.push(tile);
          }

          this.setActive(true);
          this.setVisible(true);
     }

     /**
      * Reset divider at new position with new width
      */
     reset(config: DividerConfig): void {
          this.create(config);
     }

     /**
      * Clear all tiles
      */
     private clearTiles(): void {
          this.tiles.forEach((tile) => {
               tile.deactivate();
          });
          this.tiles = [];
     }

     /**
      * Deactivate the entire divider
      */
     deactivate(): void {
          this.clearTiles();
          this.setActive(false);
          this.setVisible(false);
     }

     /**
      * Get all tile objects for collision
      */
     getTiles(): TitleBox[] {
          return this.tiles;
     }

     /**
      * Get divider bounds
      */
     getBounds(): { left: number; right: number; top: number; width: number } {
          return {
               left: this.dividerX,
               right: this.dividerX + this.dividerWidth,
               top: this.dividerY - TILE_SIZE / 2,
               width: this.dividerWidth,
          };
     }

     /**
      * Get the Y position of this divider
      */
     getY(): number {
          return this.dividerY;
     }

     /**
      * Get center X of this divider
      */
     getCenterX(): number {
          return this.dividerX + this.dividerWidth / 2;
     }

     /**
      * Check if a point is above this divider (for landing)
      */
     isPointAbove(x: number, y: number): boolean {
          const bounds = this.getBounds();
          return x >= bounds.left && x <= bounds.right && y < bounds.top;
     }
}
