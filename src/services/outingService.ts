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
    | 'rejected';

export interface OutingRequest {
    id?: string;
    uid: string;
    studentName: string;
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
}

export const outingService = {
    requestOuting: async (data: any) => {
        const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 48); // 48h expiry
        const link = `${window.location.origin}/guardian/approve/${token}`;

        const docRef = await addDoc(collection(db, "outing_requests"), {
            ...data,
            status: 'requested',
            guardianApprovalStatus: 'pending',
            facultyApprovalStatus: 'pending',
            guardianApprovalToken: token,
            guardianApprovalLink: link,
            guardianApprovalExpiresAt: expiresAt,
            createdAt: serverTimestamp()
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

        await updateDoc(docRef, {
            guardianApprovalStatus: action,
            guardianApprovedAt: serverTimestamp(),
            status: action === 'approved' ? 'guardian_approved' : 'rejected',
            guardianApprovalToken: null // Invalidate token (security)
        });
    },

    facultyAction: async (outingId: string, action: 'approved' | 'rejected') => {
        const updates: any = {
            facultyApprovalStatus: action,
            approvedAt: serverTimestamp(),
            status: action === 'approved' ? 'faculty_approved' : 'rejected'
        };

        if (action === 'approved') {
            updates.status = 'faculty_approved';
            updates.qrData = `OUTING-${outingId}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
        }

        await updateDoc(doc(db, "outing_requests", outingId), updates);
    },

    recordScan: async (outingId: string, type: 'exit' | 'entry') => {
        const docRef = doc(db, "outing_requests", outingId);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error("Request not found");

        const data = docSnap.data();
        const updates: any = {};

        if (type === 'exit') {
            // Can exit if qr_generated OR faculty_approved
            if (data.status !== 'qr_generated' && data.status !== 'faculty_approved') {
                throw new Error("Invalid status for exit scan");
            }
            if (data.exitScanAt) throw new Error("Exit already recorded");

            updates.exitScanAt = serverTimestamp();
            updates.status = 'exited';
        } else {
            // Can enter if exited
            if (data.status !== 'exited') {
                throw new Error("Student must exit before re-entry");
            }
            if (data.entryScanAt) throw new Error("Entry already recorded");

            updates.entryScanAt = serverTimestamp();
            updates.status = 're_entered';
            updates.qrData = null; // Invalidate QR
        }
        await updateDoc(docRef, updates);
    },

    subscribeToUserOutings: (uid: string, callback: (outings: OutingRequest[]) => void) => {
        const q = query(collection(db, "outing_requests"), where("uid", "==", uid));
        return onSnapshot(q, (snapshot) => {
            const outings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as OutingRequest));
            // Sort by createdAt desc
            outings.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            callback(outings);
        });
    },

    subscribeToAllOutings: (callback: (outings: OutingRequest[]) => void) => {
        const q = query(collection(db, "outing_requests"));
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
