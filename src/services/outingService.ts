import { db } from "../firebase/config";
import { collection, addDoc, query, where, onSnapshot, updateDoc, doc, getDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { Guardian } from "./userService";

export type OutingStatus =
    | 'requested'
    | 'guardian_approved'
    | 'faculty_approved'
    | 'qr_generated'
    | 'exited'
    | 're_entered'
    | 'rejected'
    | 'pending'
    | 'approved'
    | 'completed';

export interface OutingRequest {
    id?: string;
    uid: string;
    studentName: string;
    studentEmail: string;
    // Dates
    departureDate: string;
    departureTime: string;
    arrivalDate: string;
    arrivalTime: string;
    // Reasons
    fullReason: string;
    summarizedReason: string;
    // Guardians
    guardians: Guardian[];
    selectedGuardian: Guardian;
    // Approvals
    guardianApprovalStatus: 'pending' | 'approved' | 'rejected';
    facultyApprovalStatus: 'pending' | 'approved' | 'rejected';
    status: OutingStatus;
    // QR & Scans
    qrData?: string | null;
    exitScanAt?: any;
    entryScanAt?: any;
    // Metadata
    createdAt: any;
    approvedAt?: any;
    guardianApprovedAt?: any;
    guardianApprovalToken?: string | null;
    guardianApprovalLink?: string;
    guardianApprovalExpiresAt?: any;
    isActive?: boolean;
}

export const outingService = {
    requestOuting: async (data: any) => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48h expiry
        const link = `${window.location.origin}/guardian/approve/${token}`;

        const docRef = await addDoc(collection(db, "outing_requests"), {
            ...data,
            status: 'pending',
            guardianApprovalStatus: 'pending',
            facultyApprovalStatus: 'pending',
            guardianApprovalToken: token,
            guardianApprovalLink: link,
            guardianApprovalExpiresAt: expiresAt,
            createdAt: serverTimestamp(),
            isActive: true
        });
        return docRef.id;
    },

    getOutingByToken: async (token: string): Promise<OutingRequest | null> => {
        const q = query(collection(db, "outing_requests"), where("guardianApprovalToken", "==", token));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const docSnap = querySnapshot.docs[0];
            const data = docSnap.data();

            // Expiry Check
            if (data.guardianApprovalExpiresAt) {
                const expiry = data.guardianApprovalExpiresAt.toDate();
                if (new Date() > expiry) throw new Error("Approval link has expired");
            }

            return { id: docSnap.id, ...data } as OutingRequest;
        }
        return null;
    },

    guardianActionByToken: async (token: string, action: 'approved' | 'rejected') => {
        const q = query(collection(db, "outing_requests"), where("guardianApprovalToken", "==", token));
        const querySnapshot = await getDocs(q);
        if (querySnapshot.empty) throw new Error("Invalid token");

        const docSnap = querySnapshot.docs[0];
        const docRef = docSnap.ref;
        const data = docSnap.data();

        if (data.guardianApprovalStatus !== 'pending') {
            throw new Error("This request has already been processed");
        }

        const updates: any = {
            guardianApprovalStatus: action,
            guardianApprovedAt: serverTimestamp(),
            status: action === 'approved' ? 'pending' : 'rejected',
            guardianApprovalToken: null // Invalidate token (security)
        };

        // If faculty already approved, and this is an approval, move to "approved" and keep active
        if (action === 'approved' && data.facultyApprovalStatus === 'approved') {
            updates.status = 'approved';
            updates.isActive = true;
            updates.approvedAt = serverTimestamp();
            // Generate QR if not already there
            if (!data.qrData) {
                updates.qrData = `OUTING-${docSnap.id}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
            }
        }

        await updateDoc(docRef, updates);
    },

    facultyAction: async (outingId: string, action: 'approved' | 'rejected') => {
        const docRef = doc(db, "outing_requests", outingId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Request not found");
        const data = docSnap.data();

        const updates: any = {
            facultyApprovalStatus: action,
            approvedAt: serverTimestamp(),
            status: action === 'approved' ? 'pending' : 'rejected'
        };

        // Requirement: After both approvals, set status to "approved" and isActive remains true
        if (action === 'approved' && data.guardianApprovalStatus === 'approved') {
            updates.status = 'approved';
            updates.isActive = true;
            updates.approvedAt = serverTimestamp();
            updates.qrData = `OUTING-${outingId}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        }

        await updateDoc(docRef, updates);
    },

    recordScan: async (outingId: string, type: 'exit' | 'entry') => {
        const docRef = doc(db, "outing_requests", outingId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Request not found");

        const data = docSnap.data();
        const updates: any = {};

        if (type === 'exit') {
            // Can exit if "approved"
            if (data.status !== 'approved' && data.status !== 'faculty_approved' && data.status !== 'qr_generated') {
                throw new Error("Invalid status for exit scan");
            }
            if (data.exitScanAt) throw new Error("Exit already recorded");

            updates.exitScanAt = serverTimestamp();
            // Status remains "approved" so scanner stays visible for entry
        } else {
            // Can enter if exit already recorded
            if (!data.exitScanAt) {
                throw new Error("Student must exit before re-entry");
            }
            if (data.entryScanAt) throw new Error("Entry already recorded");

            updates.entryScanAt = serverTimestamp();
            updates.status = 'completed';
            updates.isActive = false;
            updates.completedAt = serverTimestamp();
            updates.qrData = null; // Invalidate QR
        }
        await updateDoc(docRef, updates);
    },

    subscribeToUserOutings: (uid: string, callback: (outings: OutingRequest[]) => void) => {
        const q = query(
            collection(db, "outing_requests"),
            where("uid", "==", uid),
            where("status", "in", ["pending", "approved"])
        );
        return onSnapshot(q, (snapshot) => {
            const outings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OutingRequest));
            // Sort by createdAt desc
            outings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            callback(outings);
        });
    },

    subscribeToAllOutings: (callback: (outings: OutingRequest[]) => void) => {
        const q = query(
            collection(db, "outing_requests"),
            where("status", "in", ["pending", "approved"])
        );
        return onSnapshot(q, (snapshot) => {
            const outings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OutingRequest));
            outings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            callback(outings);
        });
    },

    cancelRequest: async (outingId: string) => {
        const { deleteDoc } = await import("firebase/firestore");
        await deleteDoc(doc(db, "outing_requests", outingId));
    },


};
