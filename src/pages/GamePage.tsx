import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Phaser from 'phaser';
import { GameCanvas } from '../components/GameCanvas';
import { HUD } from '../components/HUD';
import { GameScene, gameEvents } from '../game/scenes/GameScene';
import { useAuth } from '../firebase/AuthContext';
import { submitScore } from '../firebase/leaderboard';
import './GamePage.css';

export function GamePage() {
    const gameRef = useRef<Phaser.Game | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();
    const lastScoreRef = useRef<{ score: number; level: number }>({ score: 0, level: 0 });

    // Track score and level updates
    useEffect(() => {
        const handleScoreChange = (score: number) => {
            lastScoreRef.current.score = score;
        };

        const handleLevelChange = (level: number) => {
            lastScoreRef.current.level = level;
        };

        const handleGameOver = async (score: number) => {
            // Submit score to leaderboard when game ends
            if (user) {
                try {
                    await submitScore(
                        user.uid,
                        user.displayName || 'Anonymous',
                        user.photoURL,
                        score,
                        lastScoreRef.current.level
                    );
                } catch (error) {
                    console.error('Failed to submit score:', error);
                }
            }
        };

        gameEvents.on('scoreChange', handleScoreChange);
        gameEvents.on('levelChange', handleLevelChange);
        gameEvents.on('gameOver', handleGameOver);

        return () => {
            gameEvents.off('scoreChange', handleScoreChange);
            gameEvents.off('levelChange', handleLevelChange);
            gameEvents.off('gameOver', handleGameOver);
        };
    }, [user]);

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

    const handleBack = () => {
        navigate('/');
    };

    // Redirect to landing if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/');
        }
    }, [user, navigate]);

    if (!user) {
        return null;
    }

    return (
        <div className="game-page-container">
            <div className="game-page-wrapper">
                <button className="back-button" onClick={handleBack}>
                    ← Back to Menu
                </button>
                <GameCanvas onGameReady={handleGameReady} />
                <HUD onRestart={handleRestart} />
            </div>
        </div>
    );
}
