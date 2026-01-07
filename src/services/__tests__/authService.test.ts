import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../authService';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';

// Mock Firebase modules
vi.mock('firebase/auth', () => ({
    getAuth: vi.fn(() => ({})),
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
    updateProfile: vi.fn(),
}));

vi.mock('../../firebase/config', () => ({
    auth: {},
    db: {},
}));

describe('Auth Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('login', () => {
        it('calls signInWithEmailAndPassword with correct args', async () => {
            const mockUser = {
                user: {
                    uid: '123',
                    email: 'test@test.com',
                },
            };
            (signInWithEmailAndPassword as any).mockResolvedValue(mockUser);

            const result = await authService.login('test@test.com', 'password', 'student');

            expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@test.com', 'password');
            expect(result).toBeDefined();
        });

        it('throws error when login fails', async () => {
            (signInWithEmailAndPassword as any).mockRejectedValue(new Error('Auth failed'));

            await expect(authService.login('test@test.com', 'wrongpassword', 'student')).rejects.toThrow('Auth failed');
        });
    });

    describe('signup', () => {
        it('calls createUserWithEmailAndPassword with correct args', async () => {
            const mockUser = {
                user: {
                    uid: '456',
                    email: 'new@test.com',
                },
            };
            (createUserWithEmailAndPassword as any).mockResolvedValue(mockUser);

            const result = await authService.signup('new@test.com', 'password', 'Test User', 'student');

            expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@test.com', 'password');
            expect(result).toBeDefined();
        });
    });

    describe('logout', () => {
        it('calls signOut', async () => {
            (signOut as any).mockResolvedValue(undefined);

            await authService.logout();

            expect(signOut).toHaveBeenCalled();
        });
    });
});
