import { useIssues } from '@/utils/issueStore';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';

interface MyIssuesListProps {
    userName: string;
}

export function MyIssuesList({ userName }: MyIssuesListProps) {
    const { issues } = useIssues();

    // In a real app, we'd filter by user ID. Here we filter by name for demo purposes.
    // If userName is generic/empty (like initially), show all for demo visibility, 
    // or strictly filter. Let's strictly filter to simulate reality, assuming ReportForm uses same name.
    const myIssues = issues.filter(issue => issue.studentName === userName);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityBadge = (priority: string) => {
        switch (priority) {
            case 'high': return <Badge variant="destructive" className="uppercase text-[10px]">High</Badge>;
            case 'medium': return <Badge className="bg-orange-500 hover:bg-orange-600 uppercase text-[10px]">Medium</Badge>;
            case 'low': return <Badge variant="secondary" className="bg-gray-200 text-gray-700 uppercase text-[10px]">Low</Badge>;
            default: return null;
        }
    };

    if (myIssues.length === 0) {
        return (
            <div className="text-center py-12 bg-muted/20 rounded-3xl border-2 border-dashed border-muted-foreground/20">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <h3 className="text-lg font-bold text-muted-foreground">No Issues Reported</h3>
                <p className="text-sm text-muted-foreground/80">You haven't reported any issues yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {myIssues.map((issue) => (
                <Card key={issue.id} className="p-5 overflow-hidden transition-all hover:shadow-md border-border">
                    <div className="flex flex-col sm:flex-row gap-4">
                        {/* Image Thumbnail */}
                        {issue.image ? (
                            <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-muted rounded-lg overflow-hidden">
                                <img src={issue.image} alt="Issue" className="w-full h-full object-cover" />
                            </div>
                        ) : (
                            <div className="w-full sm:w-24 h-24 flex-shrink-0 bg-primary/5 rounded-lg flex items-center justify-center">
                                <AlertTriangle className="h-10 w-10 text-primary/20" />
                            </div>
                        )}

                        <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Badge variant="outline" className="text-primary border-primary/20">{issue.category}</Badge>
                                        <span className="text-xs text-muted-foreground">{issue.date}</span>
                                    </div>
                                    <h3 className="font-bold text-lg text-foreground line-clamp-1">{issue.description}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                    <Badge className={`${getStatusColor(issue.status)} border px-3`}>
                                        {issue.status}
                                    </Badge>
                                    {getPriorityBadge(issue.priority)}
                                </div>
                            </div>

                            <div className="flex items-center text-xs text-muted-foreground font-medium">
                                <MapPin className="h-3.5 w-3.5 mr-1" />
                                Block {issue.hostelBlock}, Room {issue.roomNumber}
                            </div>

                            {/* Admin Remarks */}
                            {issue.adminRemarks && (
                                <div className="mt-3 p-3 bg-muted/50 rounded-lg text-sm border border-border">
                                    <p className="font-bold text-xs uppercase text-muted-foreground mb-1">Admin Remarks:</p>
                                    <p className="text-foreground/90">{issue.adminRemarks}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );
}
