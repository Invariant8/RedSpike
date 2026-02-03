import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import { createPhaserGame } from '../game/phaserGame';

interface GameCanvasProps {
     onGameReady?: (game: Phaser.Game) => void;
}

/**
 * React component that mounts the Phaser canvas
 */
export function GameCanvas({ onGameReady }: GameCanvasProps) {
     const containerRef = useRef<HTMLDivElement>(null);
     const gameRef = useRef<Phaser.Game | null>(null);

     useEffect(() => {
          if (containerRef.current && !gameRef.current) {
               // Create the Phaser game
               gameRef.current = createPhaserGame(containerRef.current);

               // Notify parent when game is ready
               if (onGameReady) {
                    onGameReady(gameRef.current);
               }
          }

          // Cleanup on unmount
          return () => {
               if (gameRef.current) {
                    gameRef.current.destroy(true);
                    gameRef.current = null;
               }
          };
     }, [onGameReady]);

     return (
          <div
               ref={containerRef}
               id="game-canvas-container"
               style={{
                    width: '100vw',
                    height: '100vh',
                    overflow: 'hidden',
                    background: '#000',
               }}
          />
     );
}
