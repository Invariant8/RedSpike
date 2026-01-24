import Phaser from 'phaser';
import { ASSETS, TILE_SIZE } from '../constants';

/**
 * TitleBox - A single tile that makes up a divider platform
 */
export class TitleBox extends Phaser.Physics.Arcade.Image {
     constructor(scene: Phaser.Scene, x: number, y: number) {
          super(scene, x, y, ASSETS.TILE);

          scene.add.existing(this);
          scene.physics.add.existing(this, true); // true = static body

          // Scale tile to desired size
          this.setDisplaySize(TILE_SIZE, TILE_SIZE);

          // Set up physics body
          const body = this.body as Phaser.Physics.Arcade.StaticBody;
          body.setSize(TILE_SIZE, TILE_SIZE);
          body.updateFromGameObject();
     }

     /**
      * Reset the tile at a new position
      */
     reset(x: number, y: number): void {
          this.setPosition(x, y);
          this.setActive(true);
          this.setVisible(true);

          const body = this.body as Phaser.Physics.Arcade.StaticBody;
          body.updateFromGameObject();
          body.enable = true;
     }

     /**
      * Deactivate the tile
      */
     deactivate(): void {
          this.setActive(false);
          this.setVisible(false);

          const body = this.body as Phaser.Physics.Arcade.StaticBody;
          if (body) {
               body.enable = false;
          }
     }
}
