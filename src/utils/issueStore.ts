import { useState, useEffect } from 'react';
import { issueService, Issue } from '@/services/issueService';

export type { Issue };

export function useIssues() {
    const [issues, setIssues] = useState<Issue[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = issueService.subscribeToIssues((data) => {
            setIssues(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    return {
        issues,
        loading,
        addIssue: issueService.addIssue,
        updateStatus: issueService.updateStatus,
        addRemark: issueService.addRemark
    };
}
