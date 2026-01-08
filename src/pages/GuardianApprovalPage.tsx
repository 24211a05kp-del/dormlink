import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { outingService, OutingRequest } from '@/services/outingService';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, ShieldCheck, Calendar, Clock, MapPin, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function GuardianApprovalPage() {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [request, setRequest] = useState<OutingRequest | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        const fetchRequest = async () => {
            if (!token) return;
            try {
                const data = await outingService.getOutingByToken(token);
                if (data) {
                    setRequest(data);
                } else {
                    setError("Invalid or expired link");
                }
            } catch (err: any) {
                setError(err.message || "Failed to load request");
            } finally {
                setLoading(false);
            }
        };
        fetchRequest();
    }, [token]);

    const handleAction = async (action: 'approved' | 'rejected') => {
        if (!token) return;
        setActionLoading(true);
        try {
            await outingService.guardianActionByToken(token, action);
            setSuccessMessage(action === 'approved' ? "Outing Approved Successfully" : "Outing Rejected");
            toast.success(action === 'approved' ? "Approved!" : "Rejected!");
        } catch (err: any) {
            toast.error(err.message || "Action failed");
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-[#5A3A1E]" />
            </div>
        );
    }

    if (error || !request) {
        return (
            <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-white shadow-lg border-2 border-red-100 rounded-3xl">
                    <div className="mx-auto w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                    </div>
                    <h1 className="text-xl font-bold text-red-700 mb-2">Unavailable</h1>
                    <p className="text-[#7A5C3A]">{error || "Request not found"}</p>
                </Card>
            </div>
        );
    }

    if (successMessage) {
        return (
            <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4">
                <Card className="max-w-md w-full p-8 text-center bg-white shadow-lg border-2 border-green-100 rounded-3xl">
                    <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                    </div>
                    <h1 className="text-2xl font-bold text-green-800 mb-2">Done!</h1>
                    <p className="text-[#7A5C3A] font-medium">{successMessage}</p>
                    <p className="text-sm text-[#7A5C3A]/70 mt-4">You may close this window.</p>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F5EFE6] flex items-center justify-center p-4 font-sans">
            <Card className="max-w-lg w-full bg-white shadow-xl rounded-[2rem] overflow-hidden border-[#EADFCC]">
                {/* Header */}
                <div className="bg-[#5A3A1E] p-8 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                    <ShieldCheck className="h-12 w-12 mx-auto mb-4 opacity-90" />
                    <h1 className="text-2xl font-bold">Guardian Approval</h1>
                    <p className="text-white/80 text-sm mt-1">Dormlink Security System</p>
                </div>

                <div className="p-8 space-y-8">
                    <div className="text-center">
                        <p className="text-xs font-bold text-[#7A5C3A] uppercase tracking-widest mb-2">Student Request</p>
                        <h2 className="text-3xl font-black text-[#5A3A1E] mb-1">{request.studentName}</h2>
                        <p className="text-sm text-[#7A5C3A] italic">"{request.selectedGuardian?.relation}"</p>
                    </div>

                    <div className="bg-[#F5EFE6]/50 p-6 rounded-3xl border border-[#EADFCC] space-y-4">
                        <div className="flex items-start gap-4">
                            <Calendar className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-[#7A5C3A] uppercase">Departure</p>
                                <p className="font-bold text-[#5A3A1E]">{request.departureDate} at {request.departureTime}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Clock className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-[#7A5C3A] uppercase">Arrival</p>
                                <p className="font-bold text-[#5A3A1E]">{request.arrivalDate} at {request.arrivalTime}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                            <div>
                                <p className="text-xs font-bold text-[#7A5C3A] uppercase">Reason</p>
                                <p className="font-medium text-[#5A3A1E] leading-relaxed">"{request.fullReason}"</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button
                            onClick={() => handleAction('approved')}
                            disabled={actionLoading}
                            className="h-14 text-lg font-bold rounded-2xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                        >
                            <CheckCircle className="mr-2 h-5 w-5" />
                            Approve Request
                        </Button>
                        <Button
                            onClick={() => handleAction('rejected')}
                            disabled={actionLoading}
                            variant="outline"
                            className="h-14 text-lg font-bold rounded-2xl border-2 border-red-100 text-red-600 hover:bg-red-50"
                        >
                            <XCircle className="mr-2 h-5 w-5" />
                            Reject Request
                        </Button>
                    </div>
                </div>
                <div className="p-4 text-center bg-gray-50 text-[10px] text-gray-400 font-medium">
                    SECURED BY DORMLINK • {new Date().getFullYear()}
                </div>
            </Card>
        </div>
    );
}
