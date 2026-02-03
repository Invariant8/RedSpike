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
        } catch (err: unknown) {
            setError((err as Error).message || 'Authentication failed');
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
        } catch (err: unknown) {
            setError((err as Error).message || 'Google sign-in failed');
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
                    <div className="game-status-bar">
                        <span className="status-item">SYSTEM: ONLINE</span>
                        <span className="status-item">LOC: SECTOR 7G</span>
                        <span className="status-item">VERS: 2.0.26</span>
                    </div>
                    <h1 className="hero-title">
                        <span className="title-red glitch-text" data-text="Red">Red</span>
                        <span className="title-spike glitch-text" data-text="Spike">Spike</span>
                    </h1>
                    <p className="hero-subtitle gaming-text">Climb infinitely. Compete globally. Be legendary.</p>

                    {user ? (
                        <div className="user-welcome">
                            <div className="user-info">
                                <div className="avatar-frame main-avatar">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt={user.displayName || 'User'} className="user-avatar" />
                                    ) : (
                                        <div className="player-avatar-placeholder">
                                            {(user.displayName || 'P').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="user-details">
                                    <span className="welcome-text gaming-text">ACCESS GRANTED</span>
                                    <span className="user-name">{user.displayName || 'Player'}</span>
                                </div>
                            </div>
                            <div className="action-buttons">
                                <button className="play-button gaming-text" onClick={handlePlayGame}>
                                    <span className="play-icon">🚀</span>
                                    CHALLENGE ASCENT
                                </button>
                                <button className="logout-button gaming-text" onClick={logout}>
                                    DISCONNECT
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

                {/* News Ticker */}
                <div className="news-ticker">
                    <div className="ticker-label gaming-text">LIVE_OPS</div>
                    <div className="ticker-wrapper">
                        <div className="ticker-content">
                            <span>NEW SECTOR UNLOCKED: THE CRYSTAL SPIRES</span>
                            <span>SQUAD "VOID" CURRENTLY DOMINATING THE RANKS</span>
                            <span>INCOMING PATCH 2.1: GRAVITY ANOMALIES DETECTED</span>
                            <span>TOP CLIMBER "OMEGA" REACHED LEVEL 99</span>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="dashboard-grid">
                    {/* Leaderboard Section */}
                    <section className="leaderboard-section">
                        <div className="section-header">
                            <h2 className="section-title gaming-text">
                                <span className="title-icon">📡</span>
                                RANKING_SIGNAL
                            </h2>
                            <div className="header-line"></div>
                        </div>

                        <div className="leaderboard-table">
                            {!isConfigured ? (
                                <div className="leaderboard-empty">
                                    <p>⚠️ ENCRYPTION ERROR: FIREBASE_NOT_FOUND</p>
                                </div>
                            ) : leaderboard.length === 0 ? (
                                <div className="leaderboard-empty">
                                    <p>NO DATA DETECTED. BE THE FIRST TO ASCEND.</p>
                                </div>
                            ) : (
                                <div className="leaderboard-entries">
                                    {leaderboard.map((entry, index) => (
                                        <div
                                            key={entry.userId}
                                            className={`leaderboard-entry ${index < 3 ? `rank-${index + 1}` : ''}`}
                                        >
                                            <div className="entry-rank gaming-text">
                                                {String(index + 1).padStart(2, '0')}
                                            </div>
                                            <div className="entry-player">
                                                <div className="avatar-frame">
                                                    {entry.photoURL ? (
                                                        <img src={entry.photoURL} alt={entry.displayName} className="player-avatar" />
                                                    ) : (
                                                        <div className="player-avatar-placeholder">
                                                            {entry.displayName.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="player-name">{entry.displayName}</span>
                                            </div>
                                            <div className="entry-stats">
                                                <div className="stat-item">
                                                    <span className="stat-label">EXP</span>
                                                    <span className="stat-value">{entry.score.toLocaleString()}</span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-label">LVL</span>
                                                    <span className="stat-value">{entry.level}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Mission Brief Section */}
                    <section className="mission-brief-section">
                        <div className="section-header">
                            <h2 className="section-title gaming-text">
                                <span className="title-icon">📂</span>
                                MISSION_OBJECTIVE
                            </h2>
                            <div className="header-line"></div>
                        </div>
                        <div className="mission-content">
                            <div className="mission-card">
                                <div className="mission-icon">🧗</div>
                                <div className="mission-details">
                                    <h3 className="gaming-text">INFINITE_ASCENT</h3>
                                    <p>Scale the procedurally generated Spikes. Gravity increases every 500m.</p>
                                </div>
                            </div>
                            <div className="mission-card">
                                <div className="mission-icon">⚡</div>
                                <div className="mission-details">
                                    <h3 className="gaming-text">SURVIVAL_PROTOCOL</h3>
                                    <p>Avoid red hazards. Collect blue energy cores to maintain momentum.</p>
                                </div>
                            </div>
                            <div className="mission-card dashboard-stats">
                                <div className="diag-item">
                                    <div className="diag-label">GLOBAL_LOAD</div>
                                    <div className="diag-bar"><div className="diag-fill" style={{ width: '75%' }}></div></div>
                                </div>
                                <div className="diag-item">
                                    <div className="diag-label">ATMOS_STABILITY</div>
                                    <div className="diag-bar"><div className="diag-fill" style={{ width: '42%' }}></div></div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            {/* Side UI Elements */}
            <div className="side-elements">
                <div className="radar-container">
                    <div className="radar-sweep"></div>
                    <div className="radar-grid"></div>
                    <div className="radar-dot" style={{ top: '20%', left: '30%' }}></div>
                    <div className="radar-dot" style={{ top: '60%', left: '70%', animationDelay: '1s' }}></div>
                </div>
            </div>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-line"></div>
                <div className="footer-content">
                    <div className="footer-section">
                        <h4 className="gaming-text">SYSTEM_LINKS</h4>
                        <div className="footer-links">
                            <a href="#">TERMINAL_ACCESS</a>
                            <a href="#">VOID_PROTOCOL</a>
                            <a href="#">CORE_LOGS</a>
                        </div>
                    </div>
                    <div className="footer-section">
                        <h4 className="gaming-text">SOCIAL_UPLINK</h4>
                        <div className="footer-links">
                            <a href="#">DISCORD_NODE</a>
                            <a href="#">TWITTER_STREAM</a>
                            <a href="#">DATA_GREGATE</a>
                        </div>
                    </div>
                    <div className="footer-section tech-status">
                        <div className="status-row">
                            <span className="label">LATENCY:</span>
                            <span className="value">14MS</span>
                        </div>
                        <div className="status-row">
                            <span className="label">SERVER_NODE:</span>
                            <span className="value">A-01</span>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p className="gaming-text">© 2026 REDSPIKE_OS // END_TRANSMISSION</p>
                </div>
            </footer>
        </div>
    );
}
