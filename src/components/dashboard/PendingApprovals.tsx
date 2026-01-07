import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Clock, Calendar, MapPin, CheckCircle, XCircle, User } from 'lucide-react';

interface ApprovalRequest {
    id: number;
    type: 'outing';
    studentName: string;
    departureDate: string;
    departureTime: string;
    returnDate: string;
    reason: string;
    guardian: string;
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
}

interface PendingApprovalsProps {
    userName: string;
}

export function PendingApprovals({ userName }: PendingApprovalsProps) {
    const sampleRequests: ApprovalRequest[] = [
        {
            id: 1,
            type: 'outing',
            studentName: userName,
            departureDate: '2025-12-28',
            departureTime: '10:00',
            returnDate: '2025-12-28',
            reason: 'Medical appointment at City Hospital',
            guardian: 'Rajesh Kumar (Father)',
            status: 'pending',
            requestedAt: '2 hours ago'
        },
        {
            id: 2,
            type: 'outing',
            studentName: userName,
            departureDate: '2025-12-27',
            departureTime: '14:00',
            returnDate: '2025-12-27',
            reason: 'Shopping for study materials',
            guardian: 'Priya Kumar (Mother)',
            status: 'approved',
            requestedAt: '1 day ago'
        }
    ];

    const pendingCount = sampleRequests.filter(req => req.status === 'pending').length;

    return (
        <Card className="p-6 shadow-sm border-[#EADFCC] bg-white">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-3 rounded-xl">
                        <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-primary text-xl font-bold italic">Requests Status</h2>
                        <p className="text-sm text-[#7A5C3A] font-medium">
                            {pendingCount} {pendingCount === 1 ? 'request' : 'requests'} awaiting approval
                        </p>
                    </div>
                </div>
                {pendingCount > 0 && (
                    <Badge className="bg-primary text-white border-0 py-1.5 px-4 shadow-sm">
                        {pendingCount} Active
                    </Badge>
                )}
            </div>

            <div className="space-y-6">
                {sampleRequests.length === 0 ? (
                    <div className="text-center py-12 bg-[#F5EFE6] rounded-3xl border border-[#EADFCC]">
                        <Clock className="h-16 w-16 mx-auto mb-4 text-[#7A5C3A]/30" />
                        <p className="text-[#5A3A1E] font-bold">No approval requests yet</p>
                    </div>
                ) : (
                    sampleRequests.map((request) => (
                        <div
                            key={request.id}
                            className={`p-6 rounded-[2rem] border-2 transition-all ${request.status === 'pending'
                                ? 'border-orange-200 bg-orange-50/20'
                                : request.status === 'approved'
                                    ? 'border-green-200 bg-green-50/20'
                                    : 'border-red-200 bg-red-50/20'
                                }`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3 flex-wrap">
                                        <div className="flex items-center gap-2 bg-white/60 px-3 py-1.5 rounded-full border border-[#EADFCC]">
                                            <User className="h-4 w-4 text-primary" />
                                            <span className="text-[11px] font-bold text-[#5A3A1E] uppercase tracking-wider">{request.studentName}</span>
                                        </div>
                                        <Badge variant="outline" className={`py-1 ${request.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                                            request.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                            {request.status.toUpperCase()}
                                        </Badge>
                                    </div>
                                    <h4 className="text-lg font-bold text-[#5A3A1E] mb-1">Outing Request</h4>
                                    <p className="text-sm text-[#7A5C3A] font-medium pr-4">{request.reason}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6 bg-white/40 p-4 rounded-2xl border border-[#EADFCC]/50">
                                <div className="flex items-center gap-2 text-xs font-bold text-[#7A5C3A]">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="opacity-60 uppercase">Dep:</span>
                                    <span className="text-[#5A3A1E]">{new Date(request.departureDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                    <span className="text-[#5A3A1E]/60">at</span>
                                    <span className="text-[#5A3A1E]">{request.departureTime}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#7A5C3A]">
                                    <Calendar className="h-4 w-4 text-primary" />
                                    <span className="opacity-60 uppercase">Ret:</span>
                                    <span className="text-[#5A3A1E]">{new Date(request.returnDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-[#EADFCC]">
                                <p className="text-[10px] font-bold text-[#7A5C3A] uppercase tracking-widest">
                                    Guardian: <span className="text-[#5A3A1E] ml-1">{request.guardian}</span>
                                </p>
                                <p className="text-[10px] font-bold text-[#7A5C3A]/60">{request.requestedAt}</p>
                            </div>

                            {request.status === 'pending' && (
                                <div className="mt-4 p-3 bg-white/60 rounded-xl border border-orange-200">
                                    <p className="text-[10px] font-bold text-orange-800 leading-tight">
                                        ⏳ Awaiting SMS confirmation from guardian before digital pass is issued.
                                    </p>
                                </div>
                            )}

                            {request.status === 'approved' && (
                                <div className="mt-4 p-3 bg-green-100/60 rounded-xl border border-green-200">
                                    <p className="text-[10px] font-bold text-green-800 leading-tight">
                                        ✓ Your Digital Pass is ready! You can find it in the Request Digital Pass section.
                                    </p>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </Card>
    );
}
