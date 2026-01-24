import { useState, useEffect } from 'react';
import { gameEvents } from '../game/phaserGame';
import './HUD.css';

interface HUDProps {
     onRestart?: () => void;
}

/**
 * HUD Component - Displays score, lives, level, and keyboard hints
 */
export function HUD({ onRestart }: HUDProps) {
     const [score, setScore] = useState(0);
     const [lives, setLives] = useState(10);
     const [level, setLevel] = useState(0);
     const [isGameOver, setIsGameOver] = useState(false);
     const [finalScore, setFinalScore] = useState(0);

     useEffect(() => {
          // Subscribe to game events
          const handleScoreChange = (newScore: number) => {
               setScore(newScore);
          };

          const handleLivesChange = (newLives: number) => {
               setLives(newLives);
          };

          const handleLevelChange = (newLevel: number) => {
               setLevel(newLevel);
          };

          const handleGameOver = (score: number) => {
               setIsGameOver(true);
               setFinalScore(score);
          };

          const handleGameStart = () => {
               setIsGameOver(false);
               setScore(0);
               setLives(10);
               setLevel(0);
          };

          gameEvents.on('scoreChange', handleScoreChange);
          gameEvents.on('livesChange', handleLivesChange);
          gameEvents.on('levelChange', handleLevelChange);
          gameEvents.on('gameOver', handleGameOver);
          gameEvents.on('gameStart', handleGameStart);

          return () => {
               gameEvents.off('scoreChange', handleScoreChange);
               gameEvents.off('livesChange', handleLivesChange);
               gameEvents.off('levelChange', handleLevelChange);
               gameEvents.off('gameOver', handleGameOver);
               gameEvents.off('gameStart', handleGameStart);
          };
     }, []);

     const handleRestartClick = () => {
          setIsGameOver(false);
          onRestart?.();
     };

     return (
          <>
               {/* Top HUD Bar */}
               <div className="hud-container">
                    <div className="hud-left">
                         <div className="hud-item">
                              <span className="hud-icon">⭐</span>
                              <span className="hud-value">{score.toLocaleString()}</span>
                         </div>
                         <div className="hud-item">
                              <span className="hud-icon">📊</span>
                              <span className="hud-label">Level</span>
                              <span className="hud-value">{level}</span>
                         </div>
                    </div>

                    <div className="hud-center">
                         <h1 className="game-title">Infinite Climber</h1>
                    </div>

                    <div className="hud-right">
                         <div className="hud-item lives">
                              <span className="hud-icon">❤️</span>
                              <span className="hud-value">{lives}</span>
                              <div className="lives-bar">
                                   <div
                                        className="lives-fill"
                                        style={{ width: `${(lives / 10) * 100}%` }}
                                   />
                              </div>
                         </div>
                    </div>
               </div>

               {/* Keyboard Hints */}
               <div className="keyboard-hints">
                    <div className="hint">
                         <kbd>←</kbd><kbd>→</kbd>
                         <span>Move</span>
                    </div>
                    <div className="hint">
                         <kbd>Space</kbd>
                         <span>Jump</span>
                    </div>
                    <div className="hint">
                         <kbd>Space</kbd><kbd>×2</kbd>
                         <span>Double Jump</span>
                    </div>
               </div>

               {/* Game Over Overlay */}
               {isGameOver && (
                    <div className="game-over-overlay">
                         <div className="game-over-modal">
                              <h2>Game Over</h2>
                              <div className="final-stats">
                                   <div className="stat">
                                        <span className="stat-label">Final Score</span>
                                        <span className="stat-value">{finalScore.toLocaleString()}</span>
                                   </div>
                                   <div className="stat">
                                        <span className="stat-label">Highest Level</span>
                                        <span className="stat-value">{level}</span>
                                   </div>
                              </div>
                              <button className="restart-button" onClick={handleRestartClick}>
                                   Play Again
                              </button>
                         </div>
                    </div>
               )}
          </>
     );
}
