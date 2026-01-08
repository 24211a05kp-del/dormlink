import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { ClipboardList, CheckCircle, XCircle, User, MapPin, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { outingService, OutingRequest } from '@/services/outingService';
import { toast } from 'sonner';

export function RequestManagement() {
    const [requests, setRequests] = useState<OutingRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = outingService.subscribeToAllOutings((data) => {
            setRequests(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleAction = async (id: string, action: 'approved' | 'rejected') => {
        try {
            await outingService.facultyAction(id, action);
            toast.success(`Request ${action}`);
        } catch (error) {
            toast.error("Failed to process action");
        }
    };

    const handleScan = async (id: string, type: 'exit' | 'entry') => {
        try {
            await outingService.recordScan(id, type);
            toast.success(`${type === 'exit' ? 'Exit' : 'Entry'} recorded`);
        } catch (error: any) {
            toast.error(error.message);
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-[#7A5C3A]">Loading requests...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                    <ClipboardList className="h-6 w-6 text-[#5A3A1E]" />
                </div>
                <div>
                    <h2 className="text-[#5A3A1E] text-2xl font-bold">Outing Request Management</h2>
                    <p className="text-sm text-[#7A5C3A]">Process student digital passes with real-time sync</p>
                </div>
            </div>

            <div className="grid gap-4">
                {requests.map((request) => (
                    <Card key={request.id} className="overflow-hidden shadow-sm border-[#EADFCC] bg-white hover:shadow-md transition-all">
                        <div className="p-6">
                            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                                <div className="flex-1 space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <User className="h-5 w-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[#5A3A1E] text-lg">{request.studentName}</h4>
                                            <div className="flex gap-2 mt-1">
                                                <Badge className={
                                                    request.status === 'requested' ? 'bg-orange-100 text-orange-700' :
                                                        request.status === 'guardian_approved' ? 'bg-blue-100 text-blue-700' :
                                                            request.status === 'faculty_approved' || request.status === 'qr_generated' || request.status === 'exited' ? 'bg-green-100 text-green-700' :
                                                                request.status === 're_entered' ? 'bg-gray-100 text-gray-700' :
                                                                    'bg-red-100 text-red-700'
                                                }>
                                                    {request.status === 'requested' ? 'AWAITING GUARDIAN APPROVAL' :
                                                        request.status === 'guardian_approved' ? 'FACULTY VIEW' :
                                                            request.status === 'faculty_approved' || request.status === 'qr_generated' || request.status === 'exited' ? 'ACTIVE' :
                                                                request.status === 're_entered' ? 'COMPLETED' :
                                                                    request.status.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                                {request.guardianApprovalStatus === 'approved' && (
                                                    <Badge variant="outline" className="border-green-200 text-green-600">GUARDIAN ✓</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[#8A6A4F] uppercase tracking-widest">Selected Guardian</p>
                                            <p className="font-bold text-[#5A3A1E]">{request.selectedGuardian?.name}</p>
                                            <p className="text-xs text-[#7A5C3A]">{request.selectedGuardian?.relation} • {request.selectedGuardian?.phone}</p>
                                            {request.status === 'requested' && request.guardianApprovalToken && (
                                                <div className="mt-2 flex flex-col gap-1">
                                                    <p className="text-[8px] font-bold text-orange-600 uppercase">Approval Link (Copy)</p>
                                                    <div className="flex gap-1">
                                                        <Input
                                                            readOnly
                                                            value={request.guardianApprovalLink || ''}
                                                            className="h-7 text-[9px] bg-orange-50/50 border-orange-200"
                                                        />
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="h-7 px-2 text-[10px] border-orange-200 text-orange-700 hover:bg-orange-100"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(request.guardianApprovalLink || '');
                                                                toast.success("Link copied!");
                                                            }}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-[#8A6A4F] uppercase tracking-widest">Schedule</p>
                                            <p className="text-sm font-bold text-[#5A3A1E]">Dep: {request.departureDate} {request.departureTime}</p>
                                            <p className="text-sm font-bold text-[#5A3A1E]">Arr: {request.arrivalDate} {request.arrivalTime}</p>
                                        </div>
                                        <div className="space-y-1 lg:col-span-1">
                                            <p className="text-[10px] font-black text-[#8A6A4F] uppercase tracking-widest">AI Summary</p>
                                            <p className="text-xs text-[#5A3A1E] italic leading-relaxed">
                                                "{request.summarizedReason}"
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2 shrink-0 min-w-[200px]">
                                    {request.status === 'guardian_approved' && (
                                        <>
                                            <Button onClick={() => handleAction(request.id!, 'approved')} className="bg-green-600 hover:bg-green-700 text-white rounded-xl h-12">
                                                <CheckCircle className="h-4 w-4 mr-2" />
                                                Approve Pass
                                            </Button>
                                            <Button variant="outline" onClick={() => handleAction(request.id!, 'rejected')} className="border-red-200 text-red-600 hover:bg-red-50 rounded-xl h-12">
                                                <XCircle className="h-4 w-4 mr-2" />
                                                Reject
                                            </Button>
                                        </>
                                    )}

                                    {(request.status === 'qr_generated' || request.status === 'faculty_approved') && (
                                        <Button onClick={() => handleScan(request.id!, 'exit')} className="bg-primary hover:bg-primary/90 rounded-xl h-12 shadow-lg">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Simulate Exit Scan
                                        </Button>
                                    )}

                                    {request.status === 'exited' && (
                                        <Button onClick={() => handleScan(request.id!, 'entry')} className="bg-primary hover:bg-primary/90 rounded-xl h-12 shadow-lg">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            Simulate Entry Scan
                                        </Button>
                                    )}

                                    {request.status === 're_entered' && (
                                        <Badge className="h-12 bg-gray-100 text-gray-600 border border-gray-200 flex items-center justify-center rounded-xl">
                                            COMPLETED
                                        </Badge>
                                    )}

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setExpandedId(expandedId === request.id ? null : request.id!)}
                                        className="mt-2 text-[#7A5C3A]"
                                    >
                                        {expandedId === request.id ? <><ChevronUp className="h-4 w-4 mr-1" /> Hide Details</> : <><ChevronDown className="h-4 w-4 mr-1" /> View Full Reason</>}
                                    </Button>
                                </div>
                            </div>

                            {expandedId === request.id && (
                                <div className="mt-6 pt-6 border-t border-[#EADFCC] space-y-4 animate-in slide-in-from-top-2">
                                    <div className="bg-[#F5EFE6] p-4 rounded-2xl">
                                        <h5 className="text-[10px] font-black text-[#8A6A4F] uppercase tracking-widest mb-2">Original Full Reason</h5>
                                        <p className="text-sm text-[#5A3A1E] leading-relaxed whitespace-pre-wrap">
                                            {request.fullReason}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        <div className="p-3 bg-white rounded-xl border border-[#EADFCC]">
                                            <p className="text-[8px] font-bold text-[#7A5C3A] uppercase">Guardian Appr.</p>
                                            <p className="text-xs font-bold text-[#5A3A1E]">{request.guardianApprovedAt ? new Date(request.guardianApprovedAt.toDate()).toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-[#EADFCC]">
                                            <p className="text-[8px] font-bold text-[#7A5C3A] uppercase">Faculty Appr.</p>
                                            <p className="text-xs font-bold text-[#5A3A1E]">{request.approvedAt ? new Date(request.approvedAt.toDate()).toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-[#EADFCC]">
                                            <p className="text-[8px] font-bold text-[#7A5C3A] uppercase">Exit Scan</p>
                                            <p className="text-xs font-bold text-[#5A3A1E]">{request.exitScanAt ? new Date(request.exitScanAt.toDate()).toLocaleString() : 'N/A'}</p>
                                        </div>
                                        <div className="p-3 bg-white rounded-xl border border-[#EADFCC]">
                                            <p className="text-[8px] font-bold text-[#7A5C3A] uppercase">Entry Scan</p>
                                            <p className="text-xs font-bold text-[#5A3A1E]">{request.entryScanAt ? new Date(request.entryScanAt.toDate()).toLocaleString() : 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>
                ))}

                {requests.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-[#EADFCC]">
                        <ClipboardList className="h-12 w-12 text-[#EADFCC] mx-auto mb-4" />
                        <h3 className="text-[#5A3A1E] font-bold text-xl">No outing requests</h3>
                        <p className="text-[#7A5C3A]">Requests will appear here as students submit them.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
