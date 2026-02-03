import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene';
import { PreloadScene } from './scenes/PreloadScene';
import { GameScene } from './scenes/GameScene';
import { GAME_WIDTH, GAME_HEIGHT } from './constants';

/**
 * Create and configure the Phaser game instance
 */
export function createPhaserGame(parent: HTMLElement): Phaser.Game {
     const config: Phaser.Types.Core.GameConfig = {
          type: Phaser.AUTO,
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          parent: parent,
          backgroundColor: '#1a1a2e',
          physics: {
               default: 'arcade',
               arcade: {
                    gravity: { x: 0, y: 0 }, // Will be set per-scene
                    debug: false,
               },
          },
          scene: [BootScene, PreloadScene, GameScene],
          scale: {
               mode: Phaser.Scale.RESIZE,
               autoCenter: Phaser.Scale.CENTER_BOTH,
               width: '100%',
               height: '100%'
          },
          render: {
               pixelArt: true,
               antialias: false,
          },
          audio: {
               disableWebAudio: true,
          },
     };

     return new Phaser.Game(config);
}

export { gameEvents } from './scenes/GameScene';
