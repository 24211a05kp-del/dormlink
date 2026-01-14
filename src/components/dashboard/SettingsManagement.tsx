import { useState, useEffect } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Settings, Save, Loader2, Users } from 'lucide-react';
import { settingsService, AppSettings } from '@/services/settingsService';
import { toast } from 'sonner';

export function SettingsManagement() {
    const [settings, setSettings] = useState<AppSettings | null>(null);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setLoading(true);
        const unsubscribe = settingsService.subscribeToSettings((data) => {
            setSettings(data);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setSaving(true);
        try {
            await settingsService.updateSettings(settings);
            toast.success("Settings updated successfully");
        } catch (error) {
            toast.error("Failed to update settings");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>;

    return (
        <Card className="p-6 shadow-sm border-[#EADFCC] bg-white">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-[#5A3A1E]/10 p-3 rounded-xl">
                    <Settings className="h-6 w-6 text-[#5A3A1E]" />
                </div>
                <div>
                    <h2 className="text-[#5A3A1E] text-2xl font-bold">Global Settings</h2>
                    <p className="text-sm text-[#7A5C3A]">Configure application-wide limits and rules</p>
                </div>
            </div>

            <div className="space-y-6 max-w-md">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-[#5A3A1E] flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Maximum Guardians per Student
                    </label>
                    <div className="flex gap-4">
                        <Input
                            type="number"
                            min="1"
                            max="10"
                            value={settings?.maxGuardians || 3}
                            onChange={(e) => setSettings(prev => prev ? { ...prev, maxGuardians: parseInt(e.target.value) } : null)}
                            className="rounded-xl border-[#EADFCC] focus:ring-primary"
                        />
                        <Button
                            onClick={handleSave}
                            disabled={saving}
                            className="rounded-xl px-8 shadow-md"
                        >
                            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                            Save
                        </Button>
                    </div>
                    <p className="text-xs text-[#7A5C3A] italic">
                        * This limit applies to all students. Existing guardians will not be removed if the limit is lowered.
                    </p>
                </div>
            </div>
        </Card>
    );
}
