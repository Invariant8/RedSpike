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
                    width: '1024px',
                    height: '768px',
                    margin: '0 auto',
                    borderRadius: '12px',
                    overflow: 'hidden',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.3)',
               }}
          />
     );
}
