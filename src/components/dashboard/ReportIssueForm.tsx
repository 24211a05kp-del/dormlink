import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { AlertCircle, Upload, CheckCircle2 } from 'lucide-react';
import { useIssues } from '@/utils/issueStore';
import { issueService, Issue } from '@/services/issueService';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

interface ReportIssueFormProps {
    onSuccess?: () => void;
}

export function ReportIssueForm({ onSuccess }: ReportIssueFormProps) {
    const { user } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<Omit<Issue, 'id' | 'createdAt' | 'status' | 'adminRemarks' | 'studentId' | 'studentName'>>();

    const onSubmit = async (data: any) => {
        console.log("Form submission triggered", data);
        setSubmitError(null);

        if (!user) {
            console.error("No user found in auth context");
            setSubmitError("You must be logged in to submit an issue.");
            return;
        }
        setSubmitting(true);
        try {
            let downloadUrl = undefined;
            if (selectedFile) {
                console.log("Uploading file...", selectedFile.name);
                const storageRef = ref(storage, `issues/${user.uid}/${Date.now()}_${selectedFile.name}`);
                const snapshot = await uploadBytes(storageRef, selectedFile);
                downloadUrl = await getDownloadURL(snapshot.ref);
                console.log("File uploaded, URL:", downloadUrl);
            }

            console.log("Saving issue to Firestore...");

            const issueData = {
                ...data,
                studentId: user.uid,
                studentName: user.displayName || 'Student',
                ...(downloadUrl && { imageUrl: downloadUrl })
            };

            await issueService.addIssue(issueData);
            console.log("Issue saved successfully!");

            setSubmitting(false);
            setSuccess(true);
            reset();
            setImagePreview(null);
            setSelectedFile(null);

            if (onSuccess) {
                setTimeout(onSuccess, 2000);
            }
        } catch (error: any) {
            console.error("Failed to submit issue", error);
            setSubmitting(false);
            setSubmitError(`Failed to submit: ${error.message || 'Unknown error'}`);
        }
    };

    const onError = (errors: any) => {
        console.error("Form validation failed", errors);
        setSubmitError("Please check the form for errors.");
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    if (success) {
        return (
            <Card className="p-8 text-center bg-green-50/50 border-green-200">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Issue Reported!</h3>
                <p className="text-green-700 mb-6">Your issue has been successfully submitted and is now pending review.</p>
                <Button onClick={() => setSuccess(false)} className="bg-green-600 hover:bg-green-700 text-white">
                    Submit Another Issue
                </Button>
            </Card>
        );
    }

    return (
        <Card className="p-6 md:p-8 bg-white shadow-sm border-border">
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-primary mb-2">Report an Issue</h2>
                <p className="text-muted-foreground">Fill in the details below to report a maintenance or facility issue.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
                {submitError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {submitError}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="issueCategory">Issue Category</Label>
                        <Select onValueChange={(val) => setValue('issueCategory', val as any)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Room Maintenance">Room Maintenance</SelectItem>
                                <SelectItem value="Water Problem">Water Problem</SelectItem>
                                <SelectItem value="Electricity">Electricity</SelectItem>
                                <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                                <SelectItem value="Wi-Fi">Wi-Fi</SelectItem>
                                <SelectItem value="Security">Security</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Priority */}
                    <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select onValueChange={(val) => setValue('priority', val as any)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="low">Low - Can wait a few days</SelectItem>
                                <SelectItem value="medium">Medium - Needs attention soon</SelectItem>
                                <SelectItem value="high">High - Urgent / Emergency</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Hostel Block */}
                    <div className="space-y-2">
                        <Label htmlFor="hostelBlock">Hostel Block</Label>
                        <Select onValueChange={(val) => setValue('hostelBlock', val as any)} required>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Block" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="A">Block A</SelectItem>
                                <SelectItem value="B">Block B</SelectItem>
                                <SelectItem value="C">Block C</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Room Number */}
                    <div className="space-y-2">
                        <Label htmlFor="roomNumber">Room Number</Label>
                        <Input
                            {...register('roomNumber', { required: true })}
                            placeholder="e.g. 101"
                        />
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <Label htmlFor="description">Issue Description</Label>
                    <Textarea
                        {...register('description', { required: true })}
                        placeholder="Describe the issue in detail..."
                        className="min-h-[120px]"
                    />
                </div>

                {/* Error Message Display */}
                {errors.root && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        {errors.root.message}
                    </div>
                )}
                {Object.keys(errors).length > 0 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Please fill in all required fields correctly.
                    </div>
                )}

                {/* Image Upload */}
                <div className="space-y-2">
                    <Label>Upload Image (Optional)</Label>
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-xl p-6 text-center hover:bg-muted/30 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={handleImageChange}
                        />
                        {imagePreview ? (
                            <div className="relative h-40 w-full flex items-center justify-center">
                                <img src={imagePreview} alt="Preview" className="h-full object-contain rounded-lg" />
                                <p className="absolute bottom-0 bg-black/50 text-white text-xs px-2 py-1 rounded-full mb-2">Click to change</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <Upload className="h-8 w-8" />
                                <p className="text-sm">Click or drag image here</p>
                            </div>
                        )}
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 text-lg font-bold" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Report'}
                </Button>
            </form>
        </Card>
    );
}
