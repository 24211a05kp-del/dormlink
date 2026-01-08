import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import QRCode from 'react-qr-code';
import { Button } from '../ui/button';
import { Clock, CheckCircle, XCircle, QrCode, CreditCard, Calendar, Loader2, UserPlus, Trash2, Users } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { outingService, OutingRequest } from '@/services/outingService';
import { userService, Guardian } from '@/services/userService';
import { aiService } from '@/utils/ai';
import { toast } from 'sonner';

export function OutingApproval() {
    const { user } = useAuth();
    const [userGuardians, setUserGuardians] = useState<Guardian[]>([]);
    const [selectedGuardian, setSelectedGuardian] = useState<Guardian | null>(null);
    const [activeRequest, setActiveRequest] = useState<OutingRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [isAddingGuardian, setIsAddingGuardian] = useState(false);

    // New Guardian Form
    const [newGuardian, setNewGuardian] = useState<Guardian>({ name: '', relation: '', phone: '', email: '' });

    // Request Form fields
    const [departureDate, setDepartureDate] = useState("");
    const [departureTime, setDepartureTime] = useState('');
    const [arrivalDate, setArrivalDate] = useState('');
    const [arrivalTime, setArrivalTime] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (!user) return;

        // Fetch user profile for guardians
        const fetchProfile = async () => {
            const profile = await userService.getUserProfile(user.uid);
            if (profile?.guardians) {
                setUserGuardians(profile.guardians);
            }
        };
        fetchProfile();

        const unsubscribe = outingService.subscribeToUserOutings(user.uid, (outings) => {
            const ongoing = outings.find(o => o.status !== 're_entered' && o.status !== 'rejected');
            setActiveRequest(ongoing || null);

            if (ongoing) {
                setDepartureDate(ongoing.departureDate);
                setDepartureTime(ongoing.departureTime);
                setArrivalDate(ongoing.arrivalDate);
                setArrivalTime(ongoing.arrivalTime);
                setReason(ongoing.fullReason);
                if (ongoing.selectedGuardian) setSelectedGuardian(ongoing.selectedGuardian);
            } else {
                // Reset form if no active request (e.g. after cancellation or completion)
                setDepartureDate('');
                setDepartureTime('');
                setArrivalDate('');
                setArrivalTime('');
                setReason('');
                setSelectedGuardian(null);
            }
        });

        return () => unsubscribe();
    }, [user]);

    const handleAddGuardian = async () => {
        if (!user || !newGuardian.name || !newGuardian.phone) return;
        setLoading(true);
        try {
            await userService.addGuardian(user.uid, newGuardian);
            const profile = await userService.getUserProfile(user.uid);
            setUserGuardians(profile?.guardians || []);
            setNewGuardian({ name: '', relation: '', phone: '', email: '' });
            setIsAddingGuardian(false);
            toast.success("Guardian added successfully");
        } catch (error: any) {
            toast.error(error.message || "Failed to add guardian");
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveGuardian = async (index: number) => {
        if (!user) return;
        try {
            await userService.removeGuardian(user.uid, index);
            const profile = await userService.getUserProfile(user.uid);
            setUserGuardians(profile?.guardians || []);
            if (selectedGuardian === userGuardians[index]) setSelectedGuardian(null);
            toast.success("Guardian removed");
        } catch (error) {
            toast.error("Failed to remove guardian");
        }
    };

    const handleRequestPass = async () => {
        if (!departureDate || !departureTime || !arrivalDate || !arrivalTime || !reason) {
            alert("Please fill all date, time, and reason fields");
            return;
        }

        if (!selectedGuardian) {
            alert("Please select a guardian");
            return;
        }

        setLoading(true);
        try {
            // AI Summarization
            const summarized = await aiService.summarizeReason(reason);

            await outingService.requestOuting({
                uid: user.uid,
                studentName: user.displayName || 'Unknown',
                departureDate,
                departureTime,
                arrivalDate,
                arrivalTime,
                fullReason: reason,
                summarizedReason: summarized,
                selectedGuardian,
                guardians: userGuardians // Snapshot of guardians at request time
            });
            toast.success("Request submitted successfully!");
        } catch (error) {
            console.error("Failed to request outing", error);
            toast.error("Failed to submit request");
        } finally {
            setLoading(false);
        }
    };

    const isFormValid = selectedGuardian && departureTime && arrivalDate && arrivalTime && reason;
    const status = activeRequest?.status || 'idle';

    // Fallback link generation if missing in DB
    const approvalLink = activeRequest?.guardianApprovalLink ||
        (activeRequest?.guardianApprovalToken && typeof window !== 'undefined'
            ? `${window.location.origin}/guardian/approve/${activeRequest.guardianApprovalToken}`
            : '');

    return (
        <Card className="p-6 shadow-sm border-[#EADFCC] bg-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/10 p-3 rounded-xl">
                    <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-primary text-2xl font-bold">Request Digital Pass</h2>
                    <p className="text-sm text-[#7A5C3A]">Get approval for outing</p>
                </div>
            </div>

            {/* Guardians Section */}
            <div className="mb-8 p-6 bg-[#F5EFE6]/50 rounded-2xl border border-[#EADFCC]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-[#5A3A1E]">
                        Your Guardians (Max 5)
                    </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {userGuardians.map((g, index) => (
                        <div key={index} className="relative group">
                            <button
                                onClick={() => setSelectedGuardian(g)}
                                className={`w-full p-4 rounded-xl text-left transition-all border-2 ${selectedGuardian?.phone === g.phone
                                    ? 'bg-primary border-primary shadow-md'
                                    : 'bg-[#d7c3a8] border-transparent hover:bg-[#cbb292]'
                                    }`}
                            >
                                <div className="flex flex-col gap-1">
                                    <h4 className={`font-bold text-sm ${selectedGuardian?.phone === g.phone ? 'text-white' : 'text-[#5A3A1E]'}`}>{g.name}</h4>
                                    <p className={`text-[10px] ${selectedGuardian?.phone === g.phone ? 'text-white/80' : 'text-[#7A5C3A]'}`}>{g.relation}</p>
                                    <p className={`text-[10px] ${selectedGuardian?.phone === g.phone ? 'text-white/70' : 'text-[#7A5C3A]'}`}>{g.phone}</p>
                                </div>
                                {selectedGuardian?.phone === g.phone && (
                                    <CheckCircle className="absolute top-2 right-2 h-4 w-4 text-white" />
                                )}
                            </button>
                            {status === 'idle' && (
                                <button
                                    onClick={() => handleRemoveGuardian(index)}
                                    className="absolute -top-2 -right-2 p-1.5 bg-red-100 text-red-600 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                >
                                    <Trash2 className="h-3 w-3" />
                                </button>
                            )}
                        </div>
                    ))}

                    {userGuardians.length < 5 && !isAddingGuardian && (
                        <button
                            onClick={() => setIsAddingGuardian(true)}
                            className="w-full p-4 rounded-xl border-2 border-dashed border-[#EADFCC] bg-white hover:bg-[#F5EFE6] transition-all flex flex-col items-center justify-center gap-2 group min-h-[100px]"
                        >
                            <div className="p-2 bg-[#F5EFE6] rounded-full group-hover:bg-primary/10 transition-colors">
                                <UserPlus className="h-4 w-4 text-[#7A5C3A] group-hover:text-primary" />
                            </div>
                            <span className="text-xs font-bold text-[#7A5C3A] group-hover:text-primary">+ Add Guardian</span>
                        </button>
                    )}
                </div>

                {isAddingGuardian && (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 p-4 bg-white rounded-xl border-2 border-primary/20 animate-in fade-in slide-in-from-top-2">
                        <Input
                            placeholder="Guardian Name *"
                            value={newGuardian.name}
                            onChange={e => setNewGuardian({ ...newGuardian, name: e.target.value })}
                            className="border-primary/20"
                        />
                        <Input
                            placeholder="Relation (e.g. Father) *"
                            value={newGuardian.relation}
                            onChange={e => setNewGuardian({ ...newGuardian, relation: e.target.value })}
                            className="border-primary/20"
                        />
                        <Input
                            placeholder="Phone Number *"
                            value={newGuardian.phone}
                            onChange={e => setNewGuardian({ ...newGuardian, phone: e.target.value })}
                            className="border-primary/20"
                        />
                        <Input
                            placeholder="Email (Optional)"
                            value={newGuardian.email}
                            onChange={e => setNewGuardian({ ...newGuardian, email: e.target.value })}
                            className="border-primary/20"
                        />

                        <div className="flex gap-2 col-span-1 md:col-span-2 mt-2">
                            <Button
                                onClick={handleAddGuardian}
                                disabled={loading || !newGuardian.name || !newGuardian.phone || !newGuardian.relation}
                                className="bg-primary text-white flex-1"
                            >
                                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save Guardian"}
                            </Button>
                            <Button
                                onClick={() => setIsAddingGuardian(false)}
                                variant="outline"
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Outing Details Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Departure Details */}
                <div className="bg-white p-4 rounded-xl shadow border border-[#EADFCC]">
                    <h4 className="font-medium mb-3 text-[#5A3A1E]">Departure Details</h4>

                    <label className="text-sm block mb-1 text-[#7A5C3A]">Departure Date</label>
                    <input
                        type="date"
                        value={departureDate}
                        onChange={(e) => setDepartureDate(e.target.value)}
                        className="w-full border border-[#EADFCC] rounded-lg p-2 mb-3 outline-none focus:border-primary"
                    />

                    <label className="text-sm block mb-1 text-[#7A5C3A]">Departure Time</label>
                    <input
                        type="time"
                        value={departureTime}
                        onChange={(e) => setDepartureTime(e.target.value)}
                        className="w-full border border-[#EADFCC] rounded-lg p-2 outline-none focus:border-primary"
                    />
                </div>

                {/* Arrival Details */}
                <div className="bg-white p-4 rounded-xl shadow border border-[#EADFCC]">
                    <h4 className="font-medium mb-3 text-[#5A3A1E]">Arrival Details</h4>

                    <label className="text-sm block mb-1 text-[#7A5C3A]">Arrival Date</label>
                    <input
                        type="date"
                        value={arrivalDate}
                        onChange={(e) => setArrivalDate(e.target.value)}
                        className="w-full border border-[#EADFCC] rounded-lg p-2 mb-3 outline-none focus:border-primary"
                    />

                    <label className="text-sm block mb-1 text-[#7A5C3A]">Arrival Time</label>
                    <input
                        type="time"
                        value={arrivalTime}
                        onChange={(e) => setArrivalTime(e.target.value)}
                        className="w-full border border-[#EADFCC] rounded-lg p-2 outline-none focus:border-primary"
                    />
                </div>
            </div>

            {/* Reason for Outing */}
            <div className="mt-6 mb-8">
                <label className="text-sm font-medium text-[#5A3A1E]">Reason for Routing</label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Enter detailed reason for routing..."
                    rows={4}
                    className="w-full border border-[#EADFCC] rounded-lg p-3 mt-2 outline-none focus:border-primary resize-none"
                />
            </div>

            {/* Status Display */}
            {/* Status Display */}
            {status !== 'idle' && (
                <div className="mb-8 p-6 bg-[#F5EFE6] rounded-3xl border-2 border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-sm font-bold text-[#5A3A1E]">Live Status</span>
                        <Badge className={`px-4 py-1.5 rounded-full ${status === 'requested' ? 'bg-orange-100 text-orange-700' :
                            status === 'guardian_approved' ? 'bg-blue-100 text-blue-700' :
                                status === 'faculty_approved' || status === 'qr_generated' || status === 'exited' ? 'bg-green-100 text-green-700' :
                                    status === 'rejected' ? 'bg-red-100 text-red-700' :
                                        'bg-gray-100 text-gray-700'
                            }`}>
                            {status === 'requested' ? 'AWAITING GUARDIAN APPROVAL' :
                                status === 'guardian_approved' ? 'FACULTY VIEW' :
                                    status === 'qr_generated' || status === 'faculty_approved' || status === 'exited' ? 'ACTIVE' :
                                        status === 'rejected' ? 'REJECTED' :
                                            status === 're_entered' ? 'COMPLETED' : status}
                        </Badge>
                    </div>

                    {status === 'requested' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-white/60 rounded-2xl border border-orange-200">
                                <Clock className="h-5 w-5 text-orange-600 shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-bold text-orange-800">Awaiting Guardian Approval</p>
                                    <p className="text-xs text-orange-700 italic">Your guardian ({activeRequest?.selectedGuardian?.name}) must click the link sent to them.</p>
                                </div>
                            </div>
                            <div className="p-5 bg-white rounded-2xl border-2 border-primary/10 shadow-sm">
                                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Copy Approval Link:</p>
                                <div className="flex gap-2">
                                    <Input readOnly value={approvalLink} className="h-10 text-xs bg-muted/30 border-primary/20 rounded-xl" />
                                    <Button onClick={() => { navigator.clipboard.writeText(approvalLink); toast.success("Copied!"); }} size="sm" className="rounded-xl px-4">
                                        Copy Link
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            if (!activeRequest?.id) return;
                                            if (confirm("Are you sure you want to cancel this request?")) {
                                                setLoading(true);
                                                try {
                                                    await outingService.cancelRequest(activeRequest.id);
                                                    toast.success("Request cancelled");
                                                    setActiveRequest(null);
                                                } catch (e) {
                                                    toast.error("Failed to cancel");
                                                } finally {
                                                    setLoading(false);
                                                }
                                            }
                                        }}
                                        size="sm"
                                        variant="destructive"
                                        className="rounded-xl px-4 bg-red-100 text-red-600 hover:bg-red-200"
                                    >
                                        Cancel Request
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'guardian_approved' && (
                        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                            <CheckCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-bold text-blue-800">Ready for Faculty View</p>
                                <p className="text-xs text-blue-700">Waiting for Faculty to authorize your pass.</p>
                            </div>
                        </div>
                    )}

                    {(status === 'qr_generated' || status === 'faculty_approved' || status === 'exited') && (
                        <div className="mt-8 perspective-1000">
                            <div className="relative overflow-hidden bg-white rounded-3xl shadow-2xl border border-gray-100 animate-in zoom-in-50 duration-500 ease-out">
                                {/* Header Branding */}
                                <div className="bg-gradient-to-r from-primary to-[#8A6A4F] p-6 text-white text-center relative overflow-hidden">
                                    <div className="absolute inset-0 bg-white/10 opacity-30 animate-[shimmer_2s_infinite]"></div>
                                    <h3 className="font-black text-xl tracking-[0.2em] uppercase relative z-10">DormLink</h3>
                                    <p className="text-[10px] font-medium tracking-widest opacity-90 uppercase relative z-10">Digital Campus Pass</p>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col items-center gap-6 relative">
                                    {/* User Info */}
                                    <div className="text-center space-y-1">
                                        <h4 className="text-2xl font-bold text-[#5A3A1E]">{activeRequest?.studentName || "Student"}</h4>
                                        <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 uppercase text-[10px] tracking-widest px-3 py-1">
                                            Official Outing
                                        </Badge>
                                    </div>

                                    {/* Dynamic QR Code */}
                                    <div className="p-4 bg-white rounded-2xl shadow-inner border border-gray-100 relative group">
                                        <div className="absolute -inset-1 bg-gradient-to-tr from-primary/20 via-transparent to-orange-400/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl"></div>
                                        <QRCode
                                            value={activeRequest?.qrData || "INVALID-DATA"}
                                            size={200}
                                            className="h-auto w-full max-w-[200px]"
                                            viewBox={`0 0 256 256`}
                                            fgColor="#5A3A1E"
                                        />
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4 w-full text-center">
                                        <div className="p-3 bg-[#F5EFE6]/50 rounded-xl border border-[#EADFCC]/50">
                                            <p className="text-[9px] font-bold text-[#8A6A4F] uppercase tracking-wider mb-1">Departure</p>
                                            <p className="font-bold text-[#5A3A1E] text-sm">{activeRequest?.departureDate}</p>
                                            <p className="text-xs text-[#7A5C3A] font-medium">{activeRequest?.departureTime}</p>
                                        </div>
                                        <div className="p-3 bg-[#F5EFE6]/50 rounded-xl border border-[#EADFCC]/50">
                                            <p className="text-[9px] font-bold text-[#8A6A4F] uppercase tracking-wider mb-1">Return By</p>
                                            <p className="font-bold text-[#5A3A1E] text-sm">{activeRequest?.arrivalDate}</p>
                                            <p className="text-xs text-[#7A5C3A] font-medium">{activeRequest?.arrivalTime}</p>
                                        </div>
                                    </div>

                                    {/* Status Footer */}
                                    <div className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm tracking-wide ${status === 'exited' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'
                                        }`}>
                                        {status === 'exited' ? (
                                            <>
                                                <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                                                OUT OF CAMPUS
                                            </>
                                        ) : (
                                            <>
                                                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                                                ACTIVE & AUTHORIZED
                                            </>
                                        )}
                                    </div>

                                    <p className="text-[10px] text-center text-gray-400 font-mono break-all max-w-[80%]">
                                        ID: {activeRequest?.qrData}
                                    </p>

                                    {/* Gate Simulation Buttons for Testing/Demo Flow */}
                                    <div className="flex gap-2 w-full pt-4 border-t border-dashed border-gray-200">
                                        {(status === 'faculty_approved' || status === 'qr_generated') && (
                                            <Button
                                                onClick={async () => {
                                                    if (!activeRequest?.id) return;
                                                    setLoading(true);
                                                    try {
                                                        await outingService.recordScan(activeRequest.id, 'exit');
                                                        toast.success("Exit Scanned Successfully");
                                                    } catch (e) {
                                                        toast.error("Scan Failed");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="w-full bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-200"
                                            >
                                                📍 Simulate Gate Exit
                                            </Button>
                                        )}
                                        {status === 'exited' && (
                                            <Button
                                                onClick={async () => {
                                                    if (!activeRequest?.id) return;
                                                    setLoading(true);
                                                    try {
                                                        await outingService.recordScan(activeRequest.id, 'entry');
                                                        toast.success("Return Scanned - Outing Complete");
                                                        // This will switch status to 're_entered', 
                                                        // which removes it from 'ongoing' and resets the form.
                                                    } catch (e) {
                                                        toast.error("Scan Failed");
                                                    } finally {
                                                        setLoading(false);
                                                    }
                                                }}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-200"
                                            >
                                                🏠 Simulate Gate Return
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )
            }

            {/* Action Buttons */}
            {
                status === 'idle' && (
                    <div className="space-y-3">
                        <Button
                            onClick={handleRequestPass}
                            disabled={!isFormValid || loading}
                            className="w-full rounded-2xl py-7 font-black text-lg shadow-xl shadow-primary/20 hover:scale-[1.01] transition-all"
                        >
                            {loading ? <Loader2 className="h-6 w-6 mr-3 animate-spin" /> : <CreditCard className="h-6 w-6 mr-3" />}
                            Generate Digital Pass
                        </Button>
                        {!selectedGuardian && userGuardians.length > 0 && (
                            <p className="text-center text-xs text-orange-600 font-bold mt-2">
                                ⚠️ Please select a guardian to approve your request
                            </p>
                        )}


                    </div>
                )
            }


        </Card >
    );
}
