import Phaser from 'phaser';

/**
 * Generic object pool for recycling game objects
 */
export class Pool<T extends Phaser.GameObjects.GameObject> {
     private pool: T[] = [];
     private createFn: () => T;
     private resetFn: (obj: T) => void;

     constructor(createFn: () => T, resetFn: (obj: T) => void, initialSize: number = 0) {
          this.createFn = createFn;
          this.resetFn = resetFn;

          // Pre-populate pool
          for (let i = 0; i < initialSize; i++) {
               const obj = this.createFn();
               if ('setActive' in obj) {
                    (obj as unknown as Phaser.GameObjects.Sprite).setActive(false).setVisible(false);
               }
               this.pool.push(obj);
          }
     }

     /**
      * Get an object from the pool, or create a new one if pool is empty
      */
     get(): T {
          let obj = this.pool.find((o) => {
               if ('active' in o) {
                    return !(o as unknown as Phaser.GameObjects.Sprite).active;
               }
               return false;
          });

          if (!obj) {
               obj = this.createFn();
               this.pool.push(obj);
          }

          this.resetFn(obj);
          if ('setActive' in obj) {
               (obj as unknown as Phaser.GameObjects.Sprite).setActive(true).setVisible(true);
          }

          return obj;
     }

     /**
      * Return an object to the pool
      */
     release(obj: T): void {
          if ('setActive' in obj) {
               (obj as unknown as Phaser.GameObjects.Sprite).setActive(false).setVisible(false);
          }
     }

     /**
      * Get all active objects in the pool
      */
     getActive(): T[] {
          return this.pool.filter((o) => {
               if ('active' in o) {
                    return (o as unknown as Phaser.GameObjects.Sprite).active;
               }
               return false;
          });
     }

     /**
      * Get all objects in the pool
      */
     getAll(): T[] {
          return this.pool;
     }

     /**
      * Release all objects back to the pool
      */
     releaseAll(): void {
          this.pool.forEach((obj) => this.release(obj));
     }
}
