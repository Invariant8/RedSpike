import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../firebase/AuthContext';
import { subscribeToLeaderboard, type LeaderboardEntry } from '../firebase/leaderboard';
import './LandingPage.css';

export function LandingPage() {
    const { user, signInWithGoogle, signInWithEmail, signUpWithEmail, logout, loading, isConfigured } = useAuth();
    const navigate = useNavigate();
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [error, setError] = useState('');
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        if (!isConfigured) return;

        const unsubscribe = subscribeToLeaderboard((entries) => {
            setLeaderboard(entries);
        }, 10);

        return unsubscribe;
    }, [isConfigured]);

    const handleEmailAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isConfigured) {
            setError("Please configure Firebase in .env to sign in");
            return;
        }
        setError('');
        setAuthLoading(true);

        try {
            if (isSignUp) {
                if (!displayName.trim()) {
                    setError('Please enter a display name');
                    setAuthLoading(false);
                    return;
                }
                await signUpWithEmail(email, password, displayName);
            } else {
                await signInWithEmail(email, password);
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleGoogleAuth = async () => {
        if (!isConfigured) {
            setError("Please configure Firebase in .env to sign in");
            return;
        }
        setError('');
        setAuthLoading(true);
        try {
            await signInWithGoogle();
        } catch (err: any) {
            setError(err.message || 'Google sign-in failed');
        } finally {
            setAuthLoading(false);
        }
    };

    const handlePlayGame = () => {
        navigate('/game');
    };

    if (loading) {
        return (
            <div className="landing-container">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="landing-container">
            {!isConfigured && (
                <div style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '12px',
                    textAlign: 'center',
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 9999,
                    fontWeight: 600,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    fontSize: '14px'
                }}>
                    ⚠️ Firebase setup required! Rename <code>.env.example</code> to <code>.env</code> and add your credentials to enable Auth & Leaderboard.
                </div>
            )}

            {/* Animated Background */}
            <div className="landing-bg">
                <div className="stars"></div>
                <div className="stars2"></div>
                <div className="stars3"></div>
            </div>

            {/* Main Content */}
            <main className="landing-content" style={{ paddingTop: isConfigured ? '0' : '40px' }}>
                {/* Hero Section */}
                <section className="hero-section">
                    <div className="hero-glow"></div>
                    <h1 className="hero-title">
                        <span className="title-red">Red</span>
                        <span className="title-spike">Spike</span>
                    </h1>
                    <p className="hero-subtitle">Climb infinitely. Compete globally. Be legendary.</p>

                    {user ? (
                        <div className="user-welcome">
                            <div className="user-info">
                                {user.photoURL && (
                                    <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar" />
                                )}
                                <div className="user-details">
                                    <span className="welcome-text">Welcome back,</span>
                                    <span className="user-name">{user.displayName || 'Player'}</span>
                                </div>
                            </div>
                            <div className="action-buttons">
                                <button className="play-button" onClick={handlePlayGame}>
                                    <span className="play-icon">🎮</span>
                                    Play Now
                                </button>
                                <button className="logout-button" onClick={logout}>
                                    Sign Out
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="auth-section">
                            <div className="auth-tabs">
                                <button
                                    className={`auth-tab ${!isSignUp ? 'active' : ''}`}
                                    onClick={() => setIsSignUp(false)}
                                >
                                    Sign In
                                </button>
                                <button
                                    className={`auth-tab ${isSignUp ? 'active' : ''}`}
                                    onClick={() => setIsSignUp(true)}
                                >
                                    Sign Up
                                </button>
                            </div>

                            <form className="auth-form" onSubmit={handleEmailAuth}>
                                {isSignUp && (
                                    <div className="input-group">
                                        <input
                                            type="text"
                                            placeholder="Display Name"
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            className="auth-input"
                                        />
                                    </div>
                                )}
                                <div className="input-group">
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>
                                <div className="input-group">
                                    <input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="auth-input"
                                        required
                                    />
                                </div>
                                {error && <p className="auth-error">{error}</p>}
                                <button
                                    type="submit"
                                    className="auth-submit-button"
                                    disabled={authLoading}
                                >
                                    {authLoading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
                                </button>
                            </form>

                            <div className="auth-divider">
                                <span>or</span>
                            </div>

                            <button
                                className="google-button"
                                onClick={handleGoogleAuth}
                                disabled={authLoading}
                            >
                                <svg className="google-icon" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </button>
                        </div>
                    )}
                </section>

                {/* Leaderboard Section */}
                <section className="leaderboard-section">
                    <div className="leaderboard-header">
                        <h2 className="leaderboard-title">
                            <span className="trophy-icon">🏆</span>
                            Global Leaderboard
                        </h2>
                        <p className="leaderboard-subtitle">Top 10 Players Worldwide</p>
                    </div>

                    <div className="leaderboard-table">
                        {!isConfigured ? (
                            <div className="leaderboard-empty">
                                <p>⚠️ Leaderboard requires Firebase configuration</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="leaderboard-empty">
                                <p>No scores yet. Be the first to climb!</p>
                            </div>
                        ) : (
                            <div className="leaderboard-entries">
                                {leaderboard.map((entry, index) => (
                                    <div
                                        key={entry.userId}
                                        className={`leaderboard-entry ${index < 3 ? `rank-${index + 1}` : ''}`}
                                    >
                                        <div className="entry-rank">
                                            {index === 0 && <span className="medal">🥇</span>}
                                            {index === 1 && <span className="medal">🥈</span>}
                                            {index === 2 && <span className="medal">🥉</span>}
                                            {index > 2 && <span className="rank-number">#{index + 1}</span>}
                                        </div>
                                        <div className="entry-player">
                                            {entry.photoURL ? (
                                                <img src={entry.photoURL} alt={entry.displayName} className="player-avatar" />
                                            ) : (
                                                <div className="player-avatar-placeholder">
                                                    {entry.displayName.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                            <span className="player-name">{entry.displayName}</span>
                                        </div>
                                        <div className="entry-stats">
                                            <div className="stat-item">
                                                <span className="stat-icon">⭐</span>
                                                <span className="stat-value">{entry.score.toLocaleString()}</span>
                                            </div>
                                            <div className="stat-item">
                                                <span className="stat-icon">📊</span>
                                                <span className="stat-value">Lv.{entry.level}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </section>

                {/* Features Section */}
                <section className="features-section">
                    <div className="feature-card">
                        <div className="feature-icon">🚀</div>
                        <h3>Infinite Climbing</h3>
                        <p>Scale endless heights through procedurally generated levels</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Increasing Difficulty</h3>
                        <p>Face tougher challenges as you ascend higher</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🌍</div>
                        <h3>Global Competition</h3>
                        <p>Compete with players worldwide on the leaderboard</p>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="landing-footer">
                <p>© 2026 RedSpike. Climb to greatness.</p>
            </footer>
        </div>
    );
}
