import { ref, set, get, onValue, query, orderByChild, limitToLast, off } from 'firebase/database';
import { database } from './config';

export interface LeaderboardEntry {
    odUserId: string;
    displayName: string;
    photoURL: string | null;
    score: number;
    level: number;
    timestamp: number;
}

export interface UserStats {
    displayName: string;
    email: string;
    photoURL: string | null;
    highScore: number;
    highestLevel: number;
    gamesPlayed: number;
    createdAt: number;
}

/**
 * Submit a score to the leaderboard
 */
export async function submitScore(
    userId: string,
    displayName: string,
    photoURL: string | null,
    score: number,
    level: number
): Promise<void> {
    const userRef = ref(database, `users/${userId}`);
    const leaderboardRef = ref(database, `leaderboard/${userId}`);

    // Get current user stats
    const userSnapshot = await get(userRef);
    const userData = userSnapshot.val() as UserStats | null;

    const isNewHighScore = !userData || score > userData.highScore;
    const isNewHighLevel = !userData || level > userData.highestLevel;

    // Update user stats
    await set(userRef, {
        displayName,
        email: userData?.email || '',
        photoURL,
        highScore: isNewHighScore ? score : (userData?.highScore || 0),
        highestLevel: isNewHighLevel ? level : (userData?.highestLevel || 0),
        gamesPlayed: (userData?.gamesPlayed || 0) + 1,
        createdAt: userData?.createdAt || Date.now()
    });

    // Update leaderboard entry (only store best score)
    if (isNewHighScore) {
        await set(leaderboardRef, {
            odUserId: userId,
            displayName,
            photoURL,
            score,
            level,
            timestamp: Date.now()
        });
    }
}

/**
 * Subscribe to realtime leaderboard updates
 */
export function subscribeToLeaderboard(
    callback: (entries: LeaderboardEntry[]) => void,
    limit: number = 10
): () => void {
    const leaderboardRef = ref(database, 'leaderboard');
    const leaderboardQuery = query(
        leaderboardRef,
        orderByChild('score'),
        limitToLast(limit)
    );

    const handleValue = (snapshot: any) => {
        const entries: LeaderboardEntry[] = [];
        snapshot.forEach((child: any) => {
            entries.push({
                odUserId: child.key,
                ...child.val()
            });
        });
        // Sort in descending order (highest score first)
        entries.sort((a, b) => b.score - a.score);
        callback(entries);
    };

    onValue(leaderboardQuery, handleValue);

    // Return unsubscribe function
    return () => off(leaderboardQuery, 'value', handleValue);
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    return snapshot.val();
}

/**
 * Get user's rank in leaderboard
 */
export async function getUserRank(userId: string): Promise<number> {
    const leaderboardRef = ref(database, 'leaderboard');
    const leaderboardQuery = query(leaderboardRef, orderByChild('score'));

    const snapshot = await get(leaderboardQuery);
    const entries: { odUserId: string; score: number }[] = [];

    snapshot.forEach((child: any) => {
        entries.push({
            odUserId: child.key,
            score: child.val().score
        });
    });

    // Sort descending
    entries.sort((a, b) => b.score - a.score);

    const rank = entries.findIndex(entry => entry.odUserId === userId);
    return rank === -1 ? -1 : rank + 1;
}
