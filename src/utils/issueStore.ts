import { useState, useEffect } from 'react';

export interface Issue {
    id: string;
    studentName: string;
    hostelBlock: 'A' | 'B' | 'C';
    roomNumber: string;
    category: 'Room Maintenance' | 'Water Problem' | 'Electricity' | 'Cleanliness' | 'Wi-Fi' | 'Security' | 'Other';
    description: string;
    priority: 'low' | 'medium' | 'high';
    image?: string; // Base64 string for preview
    status: 'Pending' | 'In Progress' | 'Resolved';
    date: string;
    adminRemarks?: string;
}

const STORAGE_KEY = 'dormlink_issues';

const initialIssues: Issue[] = [
    {
        id: '1',
        studentName: 'Rahul Kumar',
        hostelBlock: 'A',
        roomNumber: '101',
        category: 'Wi-Fi',
        description: 'Internet connection is very slow in the room.',
        priority: 'medium',
        status: 'Pending',
        date: new Date().toLocaleDateString()
    },
    {
        id: '2',
        studentName: 'Priya Singh',
        hostelBlock: 'B',
        roomNumber: '205',
        category: 'Water Problem',
        description: 'Leaking tap in the bathroom.',
        priority: 'high',
        status: 'Resolved',
        date: new Date(Date.now() - 86400000).toLocaleDateString(),
        adminRemarks: 'Maintenance team fixed it this morning.'
    }
];

export const issueStore = {
    getIssues: (): Issue[] => {
        if (typeof window === 'undefined') return initialIssues;
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialIssues));
            return initialIssues;
        }
        return JSON.parse(stored);
    },

    addIssue: (issue: Omit<Issue, 'id' | 'date' | 'status'>) => {
        const issues = issueStore.getIssues();
        const newIssue: Issue = {
            ...issue,
            id: Date.now().toString(),
            date: new Date().toLocaleDateString(),
            status: 'Pending'
        };
        const updatedIssues = [newIssue, ...issues]; // Add to top
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIssues));
        // Dispatch event for real-time updates across components
        window.dispatchEvent(new Event('issueStoreUpdated'));
        return newIssue;
    },

    updateStatus: (id: string, status: Issue['status']) => {
        const issues = issueStore.getIssues();
        const updatedIssues = issues.map(issue =>
            issue.id === id ? { ...issue, status } : issue
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIssues));
        window.dispatchEvent(new Event('issueStoreUpdated'));
    },

    addRemark: (id: string, remark: string) => {
        const issues = issueStore.getIssues();
        const updatedIssues = issues.map(issue =>
            issue.id === id ? { ...issue, adminRemarks: remark } : issue
        );
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedIssues));
        window.dispatchEvent(new Event('issueStoreUpdated'));
    }
};

// Hook for components to subscribe to changes
export function useIssues() {
    const [issues, setIssues] = useState<Issue[]>([]);

    useEffect(() => {
        setIssues(issueStore.getIssues());

        const handleUpdate = () => {
            setIssues(issueStore.getIssues());
        };

        window.addEventListener('issueStoreUpdated', handleUpdate);
        return () => window.removeEventListener('issueStoreUpdated', handleUpdate);
    }, []);

    return {
        issues,
        addIssue: issueStore.addIssue,
        updateStatus: issueStore.updateStatus,
        addRemark: issueStore.addRemark
    };
}
