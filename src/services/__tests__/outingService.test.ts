import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { outingService } from '../outingService';
import { db } from '../../firebase/config';
import { addDoc, getDocs, updateDoc, getDoc, collection, query, where, doc } from 'firebase/firestore';

// Mock Firebase
vi.mock('../../firebase/config', () => ({
    db: {}
}));

vi.mock('firebase/firestore', () => ({
    collection: vi.fn(),
    addDoc: vi.fn(),
    query: vi.fn(),
    where: vi.fn(),
    getDocs: vi.fn(),
    updateDoc: vi.fn(),
    doc: vi.fn(),
    getDoc: vi.fn(),
    serverTimestamp: vi.fn(),
}));

describe('outingService', () => {
    // Setup window.location.origin
    const originalLocation = window.location;

    beforeEach(() => {
        vi.clearAllMocks();
        // @ts-ignore
        delete window.location;
        window.location = { ...originalLocation, origin: 'http://localhost:3000' } as any;
    });

    afterEach(() => {
        window.location = originalLocation as any;
    });

    it('should create an outing request with all strict fields', async () => {
        const mockId = 'test-doc-id';
        (addDoc as any).mockResolvedValue({ id: mockId });

        const requestData = {
            uid: 'student-123',
            studentName: 'John Doe',
            departureDate: '2024-01-01',
            departureTime: '10:00',
            arrivalDate: '2024-01-02',
            arrivalTime: '10:00',
            fullReason: 'Medical Emergency',
            summarizedReason: 'Medical...',
            selectedGuardian: { name: 'Dad', relation: 'Father', phone: '123', email: 'dad@test.com' },
            guardians: []
        };

        const result = await outingService.requestOuting(requestData);

        expect(addDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
            uid: 'student-123',
            status: 'requested',
            guardianApprovalStatus: 'pending',
            guardianApprovalLink: expect.stringContaining('http://localhost:3000/guardian/approve/')
        }));
        expect(result).toBe(mockId);
    });

    it('should retrieve outing by token', async () => {
        const mockData = { id: 'outing-123', guardianApprovalToken: 'valid-token' };
        (getDocs as any).mockResolvedValue({
            empty: false,
            docs: [{ id: 'outing-123', data: () => mockData }]
        });

        const result = await outingService.getOutingByToken('valid-token');
        expect(result).toEqual(mockData);
    });

    it('should process faculty approval and generate QR', async () => {
        (updateDoc as any).mockResolvedValue(undefined);

        await outingService.facultyAction('outing-123', 'approved');

        expect(updateDoc).toHaveBeenCalledWith(undefined, expect.objectContaining({
            status: 'faculty_approved',
            facultyApprovalStatus: 'approved',
            qrData: expect.stringContaining('OUTING-outing-123-')
        }));
    });
});
