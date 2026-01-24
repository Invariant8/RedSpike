import { useCallback, useRef } from 'react';
import Phaser from 'phaser';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { GameScene } from './game/scenes/GameScene';
import './App.css';

function App() {
  const gameRef = useRef<Phaser.Game | null>(null);

  const handleGameReady = useCallback((game: Phaser.Game) => {
    gameRef.current = game;
  }, []);

  const handleRestart = useCallback(() => {
    if (gameRef.current) {
      const gameScene = gameRef.current.scene.getScene('GameScene') as GameScene;
      if (gameScene) {
        gameScene.restartGame();
      }
    }
  }, []);

  return (
    <div className="app-container">
      <div className="game-wrapper">
        <GameCanvas onGameReady={handleGameReady} />
        <HUD onRestart={handleRestart} />
      </div>
    </div>
  );
}

export default App;
