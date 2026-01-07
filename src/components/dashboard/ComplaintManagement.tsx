import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, MessageSquare, CheckCircle2, Clock, Filter, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { useIssues, Issue } from '@/utils/issueStore';
import { Textarea } from '../ui/textarea';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "../ui/dialog";
import { Input } from '../ui/input';

export function ComplaintManagement() {
    const { issues, updateStatus, addRemark } = useIssues();
    const [filter, setFilter] = useState<'all' | 'Pending' | 'In Progress' | 'Resolved'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [remarkText, setRemarkText] = useState('');

    const filteredIssues = issues.filter(issue => {
        const matchesFilter = filter === 'all' || issue.status === filter;
        const matchesSearch =
            issue.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            issue.roomNumber.includes(searchTerm) ||
            issue.description.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'In Progress': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Resolved': return 'bg-green-100 text-green-800 border-green-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const handleAddRemark = (id: string) => {
        if (remarkText.trim()) {
            addRemark(id, remarkText);
            setRemarkText('');
            setSelectedIssue(null); // Close dialog if open
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                        <AlertCircle className="h-6 w-6 text-[#5A3A1E]" />
                    </div>
                    <div>
                        <h2 className="text-[#5A3A1E] text-2xl font-bold">Issue Management</h2>
                        <p className="text-sm text-[#7A5C3A]">Track and resolve student issues</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search student, room..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 w-full sm:w-[200px]"
                        />
                    </div>
                    <div className="flex gap-2 bg-white p-1 rounded-xl border border-[#EADFCC]">
                        {(['all', 'Pending', 'In Progress', 'Resolved'] as const).map(status => (
                            <Button
                                key={status}
                                variant={filter === status ? 'default' : 'ghost'}
                                onClick={() => setFilter(status)}
                                size="sm"
                                className={`rounded-lg capitalize py-1 h-8 ${filter === status ? 'bg-[#5A3A1E] text-white hover:bg-[#3D2614]' : 'text-[#5A3A1E] hover:bg-[#5A3A1E]/10'}`}
                            >
                                {status}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards - Optional quick view */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-yellow-50 border-yellow-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-yellow-800 uppercase">Pending</p>
                        <p className="text-2xl font-bold text-yellow-900">{issues.filter(i => i.status === 'Pending').length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-yellow-200" />
                </Card>
                <Card className="p-4 bg-blue-50 border-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-blue-800 uppercase">In Progress</p>
                        <p className="text-2xl font-bold text-blue-900">{issues.filter(i => i.status === 'In Progress').length}</p>
                    </div>
                    <AlertCircle className="h-8 w-8 text-blue-200" />
                </Card>
                <Card className="p-4 bg-green-50 border-green-100 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-green-800 uppercase">Resolved</p>
                        <p className="text-2xl font-bold text-green-900">{issues.filter(i => i.status === 'Resolved').length}</p>
                    </div>
                    <CheckCircle2 className="h-8 w-8 text-green-200" />
                </Card>
            </div>

            {/* Issues List */}
            <div className="space-y-4">
                {filteredIssues.map(issue => (
                    <Card key={issue.id} className="p-5 shadow-sm border-[#EADFCC] hover:shadow-md transition-shadow">
                        <div className="flex flex-col md:flex-row gap-6">

                            {/* Image Preview */}
                            {issue.image && (
                                <div className="w-full md:w-48 h-48 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
                                    <img src={issue.image} alt="Issue" className="w-full h-full object-cover" />
                                </div>
                            )}

                            <div className="flex-1 space-y-4">
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <Badge variant="outline" className="bg-[#EADFCC]/30 text-[#5A3A1E] border-[#EADFCC]">
                                                {issue.category}
                                            </Badge>
                                            <span className="text-xs text-[#7A5C3A] font-medium">{issue.date}</span>
                                        </div>
                                        <h4 className="text-xl font-bold text-[#5A3A1E] mb-1">{issue.description}</h4>
                                        <div className="flex items-center gap-4 text-sm text-[#6B4F3A]">
                                            <span className="font-semibold">{issue.studentName}</span>
                                            <span>•</span>
                                            <span className="font-medium bg-gray-100 px-2 py-0.5 rounded">
                                                Block {issue.hostelBlock} - {issue.roomNumber}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Badge className={`${issue.priority === 'high' ? 'bg-red-100 text-red-800' : issue.priority === 'medium' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'} uppercase text-[10px]`}>
                                            {issue.priority}
                                        </Badge>
                                        <Badge variant="outline" className={getStatusColor(issue.status)}>
                                            {issue.status}
                                        </Badge>
                                    </div>
                                </div>

                                {/* Remarks Section */}
                                {issue.adminRemarks && (
                                    <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Admin Remarks</p>
                                        <p className="text-sm text-gray-700">{issue.adminRemarks}</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                {issue.status !== 'Resolved' && (
                                    <div className="flex flex-wrap gap-3 pt-2 border-t border-dashed border-[#EADFCC]">
                                        {issue.status === 'Pending' && (
                                            <Button
                                                onClick={() => updateStatus(issue.id, 'In Progress')}
                                                size="sm"
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                                            >
                                                Mark In Progress
                                            </Button>
                                        )}
                                        {issue.status === 'In Progress' && (
                                            <Button
                                                onClick={() => updateStatus(issue.id, 'Resolved')}
                                                size="sm"
                                                className="bg-green-600 hover:bg-green-700 text-white rounded-lg"
                                            >
                                                Mark Resolved
                                            </Button>
                                        )}

                                        <Dialog>
                                            <DialogTrigger asChild>
                                                <Button variant="outline" size="sm" className="border-[#EADFCC] text-[#5A3A1E]">
                                                    {issue.adminRemarks ? 'Edit Remark' : 'Add Remark'}
                                                </Button>
                                            </DialogTrigger>
                                            <DialogContent>
                                                <DialogHeader>
                                                    <DialogTitle>Add Admin Remark</DialogTitle>
                                                    <DialogDescription>
                                                        Add notes about the resolution process for the student to see.
                                                    </DialogDescription>
                                                </DialogHeader>
                                                <div className="py-4">
                                                    <Textarea
                                                        value={remarkText}
                                                        onChange={(e) => setRemarkText(e.target.value)}
                                                        placeholder="Enter remarks..."
                                                    />
                                                </div>
                                                <DialogFooter>
                                                    <Button onClick={() => handleAddRemark(issue.id)}>Save Remark</Button>
                                                </DialogFooter>
                                            </DialogContent>
                                        </Dialog>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}

                {filteredIssues.length === 0 && (
                    <Card className="p-12 text-center shadow-sm border-[#EADFCC] bg-white">
                        <AlertCircle className="h-12 w-12 text-[#7A5C3A]/30 mx-auto mb-4" />
                        <p className="text-[#7A5C3A] font-medium">No issues found matching your criteria</p>
                    </Card>
                )}
            </div>
        </div>
    );
}
