import { describe, it, expect, vi, beforeEach } from 'vitest';
import { issueService } from '../issueService';
import { addDoc, collection } from 'firebase/firestore';

// Mock Firebase modules
vi.mock('firebase/firestore', () => ({
    getFirestore: vi.fn(() => ({})),
    collection: vi.fn(),
    addDoc: vi.fn(),
    serverTimestamp: vi.fn(),
}));

vi.mock('../../firebase/config', () => ({
    db: {},
}));

describe('Issue Service', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('addIssue', () => {
        it('calls addDoc with correct data', async () => {
            const mockIssueData = {
                uid: 'test-uid',
                category: 'Maintenance',
                priority: 'high' as const,
                hostelBlock: 'A',
                roomNumber: '101',
                description: 'Leaky tap',
                studentName: 'Test Student',
            };

            const mockDocRef = { id: 'new-issue-id' };
            (addDoc as any).mockResolvedValue(mockDocRef);

            const result = await issueService.addIssue(mockIssueData);

            expect(collection).toHaveBeenCalled();
            expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
                ...mockIssueData,
                status: 'Pending',
            }));
            expect(result).toBe('new-issue-id');
        });

        it('throws error when addDoc fails', async () => {
            const mockIssueData = {
                uid: 'test-uid',
                category: 'Maintenance',
                priority: 'low' as const,
                hostelBlock: 'B',
                roomNumber: '202',
                description: 'Light bulb',
                studentName: 'Test Student',
            };

            (addDoc as any).mockRejectedValue(new Error('Firestore error'));

            await expect(issueService.addIssue(mockIssueData)).rejects.toThrow('Firestore error');
        });
    });
});
