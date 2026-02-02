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
    const { user, isConfigured, loading } = useAuth();
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
            // Submit score to leaderboard when game ends (only if user is logged in and Firebase is configured)
            if (user && isConfigured) {
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
            } else {
                console.log('Offline mode - score not submitted:', score);
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
    }, [user, isConfigured]);

    // Redirect to landing if Firebase is configured but user is not logged in
    // Allow playing in offline mode if Firebase is not configured
    useEffect(() => {
        if (isConfigured && !user && !loading) {
            navigate('/');
        }
    }, [user, navigate, isConfigured, loading]);

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

    // Show loading while checking auth state
    if (loading) {
        return (
            <div className="game-page-container">
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh',
                    color: 'white'
                }}>
                    Loading...
                </div>
            </div>
        );
    }

    // If Firebase is configured but no user, redirect will happen via useEffect
    if (isConfigured && !user) {
        return null;
    }

    return (
        <div className="game-page-container">
            <div className="game-page-wrapper">
                <button className="back-button" onClick={handleBack}>
                    ← Back to Menu
                </button>
                {!isConfigured && (
                    <div style={{
                        position: 'absolute',
                        top: '-40px',
                        right: 0,
                        background: 'rgba(255, 165, 0, 0.9)',
                        color: 'white',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 600
                    }}>
                        🎮 Playing in Offline Mode
                    </div>
                )}
                <GameCanvas onGameReady={handleGameReady} />
                <HUD onRestart={handleRestart} />
            </div>
        </div>
    );
}
