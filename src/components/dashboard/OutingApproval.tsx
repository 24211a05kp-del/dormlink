import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { MapPin, Clock, CheckCircle, XCircle, QrCode, CreditCard, Calendar } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

type ApprovalStatus = 'idle' | 'pending' | 'approved' | 'rejected';

interface Guardian {
    id: number;
    name: string;
    relation: string;
    phone: string;
}

const guardians: Guardian[] = [
    { id: 1, name: 'Rajesh Kumar', relation: 'Father', phone: '+91 98765 43210' },
    { id: 2, name: 'Priya Kumar', relation: 'Mother', phone: '+91 98765 43211' },
    { id: 3, name: 'Amit Sharma', relation: 'Local Guardian', phone: '+91 98765 43212' }
];

export function OutingApproval() {
    const [selectedGuardian, setSelectedGuardian] = useState<number | null>(null);
    const [status, setStatus] = useState<ApprovalStatus>('idle');
    const [showQR, setShowQR] = useState(false);

    // Form fields
    const [departureDate, setDepartureDate] = useState(new Date().toISOString().split('T')[0]);
    const [departureTime, setDepartureTime] = useState('');
    const [returnDate, setReturnDate] = useState('');
    const [reason, setReason] = useState('');

    const handleRequestPass = () => {
        if (!selectedGuardian || !departureTime || !returnDate || !reason) return;

        setStatus('pending');
        // Simulate approval process
        setTimeout(() => {
            setStatus('approved');
            setShowQR(true);
        }, 2000);
    };

    const isFormValid = selectedGuardian && departureTime && returnDate && reason;

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

            {/* Outing Details Form */}
            <div className="mb-8 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Departure Date */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-[#7A5C3A]">
                            Departure Date
                        </label>
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A3A1E]" />
                            <Input
                                type="date"
                                value={departureDate}
                                onChange={(e) => setDepartureDate(e.target.value)}
                                disabled={status === 'pending' || status === 'approved'}
                                className="pl-10"
                            />
                        </div>
                    </div>

                    {/* Departure Time */}
                    <div>
                        <label className="block mb-2 text-sm font-semibold text-[#7A5C3A]">
                            Departure Time
                        </label>
                        <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A3A1E]" />
                            <Input
                                type="time"
                                value={departureTime}
                                onChange={(e) => setDepartureTime(e.target.value)}
                                disabled={status === 'pending' || status === 'approved'}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </div>

                {/* Return Date */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-[#7A5C3A]">
                        Return Date
                    </label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#5A3A1E]" />
                        <Input
                            type="date"
                            value={returnDate}
                            onChange={(e) => setReturnDate(e.target.value)}
                            disabled={status === 'pending' || status === 'approved'}
                            min={departureDate}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Reason for Outing */}
                <div>
                    <label className="block mb-2 text-sm font-semibold text-[#7A5C3A]">
                        Reason for Outing
                    </label>
                    <Textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={status === 'pending' || status === 'approved'}
                        placeholder="Enter the reason for your outing..."
                        rows={3}
                        className="bg-[#F5EFE6]/30"
                    />
                </div>
            </div>

            {/* Guardian Selection */}
            <div className="mb-8">
                <label className="block mb-4 text-sm font-semibold text-[#7A5C3A]">Select Guardian for Approval</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {guardians.map((guardian) => (
                        <button
                            key={guardian.id}
                            onClick={() => setSelectedGuardian(guardian.id)}
                            disabled={status === 'pending' || status === 'approved'}
                            className={`p-4 rounded-2xl text-left transition-all border-2 ${selectedGuardian === guardian.id
                                ? 'bg-primary border-primary shadow-md'
                                : 'bg-[#F5EFE6] hover:bg-[#EADFCC] border-transparent'
                                } ${(status === 'pending' || status === 'approved') ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <div className="flex flex-col h-full justify-between gap-3">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className={`font-bold text-sm ${selectedGuardian === guardian.id ? 'text-white' : 'text-[#5A3A1E]'}`}>{guardian.name}</h4>
                                        <p className={`text-[10px] font-medium ${selectedGuardian === guardian.id ? 'text-white/80' : 'text-[#7A5C3A]'}`}>{guardian.relation}</p>
                                    </div>
                                    {selectedGuardian === guardian.id && (
                                        <CheckCircle className="h-4 w-4 text-white" />
                                    )}
                                </div>
                                <p className={`text-[10px] ${selectedGuardian === guardian.id ? 'text-white/70' : 'text-[#7A5C3A]'}`}>{guardian.phone}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Status Display */}
            {status !== 'idle' && (
                <div className="mb-8 p-6 bg-[#F5EFE6] rounded-2xl border border-[#EADFCC]">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-bold text-[#5A3A1E]">Request Status</span>
                        {status === 'pending' && (
                            <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200 py-1">
                                <Clock className="h-3 w-3 mr-1.5" />
                                Awaiting Approval
                            </Badge>
                        )}
                        {status === 'approved' && (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 py-1">
                                <CheckCircle className="h-3 w-3 mr-1.5" />
                                Approved
                            </Badge>
                        )}
                        {status === 'rejected' && (
                            <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 py-1">
                                <XCircle className="h-3 w-3 mr-1.5" />
                                Rejected
                            </Badge>
                        )}
                    </div>

                    {status === 'pending' && (
                        <p className="text-sm text-orange-700 font-medium">
                            Waiting for guardian approval via SMS...
                        </p>
                    )}

                    {status === 'approved' && (
                        <div className="space-y-4">
                            <p className="text-sm text-green-700 font-bold">
                                Your digital pass has been approved! Show the QR code at the gate.
                            </p>
                            <div className="bg-white p-4 rounded-xl border border-[#EADFCC] grid grid-cols-2 gap-y-2 text-[10px] font-medium text-[#7A5C3A]">
                                <div>Departure: <span className="text-[#5A3A1E]">{departureDate} at {departureTime}</span></div>
                                <div>Return: <span className="text-[#5A3A1E]">{returnDate}</span></div>
                                <div className="col-span-2">Reason: <span className="text-[#5A3A1E]">{reason}</span></div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* QR Code Preview */}
            {showQR && status === 'approved' && (
                <div className="mb-8 p-8 bg-white rounded-[2rem] text-center border-2 border-[#EADFCC] shadow-lg animate-in fade-in zoom-in duration-500">
                    <h3 className="mb-6 text-[#5A3A1E] font-bold text-xl uppercase tracking-widest">Digital Entry Pass</h3>
                    <div className="inline-block p-8 bg-[#F5EFE6] rounded-3xl border border-[#EADFCC]">
                        <QrCode className="h-40 w-40 text-[#5A3A1E] mx-auto" />
                    </div>
                    <div className="mt-8 space-y-2">
                        <p className="text-sm text-green-600 font-bold italic">✓ Verified by {guardians.find(g => g.id === selectedGuardian)?.name}</p>
                        <p className="text-[10px] text-[#7A5C3A] font-bold">Valid until {returnDate} • #DP{Date.now().toString().slice(-6)}</p>
                    </div>
                </div>
            )}

            {/* Request Button */}
            {status === 'idle' && (
                <Button
                    onClick={handleRequestPass}
                    disabled={!isFormValid}
                    className="w-full rounded-2xl py-6 font-bold text-lg shadow-xl shadow-primary/20"
                >
                    <CreditCard className="h-5 w-5 mr-3" />
                    Request Digital Pass
                </Button>
            )}

            {status === 'pending' && (
                <Button
                    disabled
                    className="w-full bg-[#7A5C3A] text-white rounded-2xl py-6 opacity-80"
                >
                    <Clock className="h-5 w-5 mr-3 animate-pulse" />
                    Requesting Approval...
                </Button>
            )}
        </Card>
    );
}
