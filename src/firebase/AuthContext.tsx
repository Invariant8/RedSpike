import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { ref, set, get } from 'firebase/database';
import { auth, googleProvider, database, isConfigured } from './config';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    signInWithEmail: (email: string, password: string) => Promise<void>;
    signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
    logout: () => Promise<void>;
    isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isConfigured) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user);
            if (user) {
                // Initialize user in database if not exists
                try {
                    const userRef = ref(database, `users/${user.uid}`);
                    const snapshot = await get(userRef);
                    if (!snapshot.exists()) {
                        await set(userRef, {
                            displayName: user.displayName || 'Anonymous Player',
                            email: user.email,
                            photoURL: user.photoURL || null,
                            highScore: 0,
                            highestLevel: 0,
                            gamesPlayed: 0,
                            createdAt: Date.now()
                        });
                    }
                } catch (e) {
                    console.error("Error syncing user to db:", e);
                }
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signInWithGoogle = async () => {
        if (!isConfigured) throw new Error("Firebase is not configured. Please set up your .env file.");
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error: any) {
            console.error("Google Sign In Error:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                throw new Error("Sign in flow not completed. If you did not close the window, this might be a browser policy issue.");
            }
            if (error.code === 'auth/popup-blocked') {
                throw new Error("Popup was blocked. Please allow popups for this site.");
            }
            throw error;
        }
    };

    const signInWithEmail = async (email: string, password: string) => {
        if (!isConfigured) throw new Error("Firebase is not configured. Please set up your .env file.");
        await signInWithEmailAndPassword(auth, email, password);
    };

    const signUpWithEmail = async (email: string, password: string, displayName: string) => {
        if (!isConfigured) throw new Error("Firebase is not configured. Please set up your .env file.");
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(result.user, { displayName });
    };

    const logout = async () => {
        if (!isConfigured) return;
        await signOut(auth);
    };

    const value = {
        user,
        loading,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        logout,
        isConfigured
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
