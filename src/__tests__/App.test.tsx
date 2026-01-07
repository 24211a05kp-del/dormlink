import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

// Mock Firebase Config
vi.mock('../firebase/config', () => ({
    auth: {},
    db: {}
}));

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(),
    onAuthStateChanged: vi.fn((auth, callback) => {
        // Simulate no user initially (loading done)
        callback(null);
        return () => { }; // Unsubscribe function
    }),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
}));

describe('App', () => {
    it('renders landing page by default', async () => {
        render(<App />);
        // Expect Student and Faculty buttons to be present
        expect(await screen.findByRole('button', { name: /student login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /faculty login/i })).toBeInTheDocument();
    });
});
