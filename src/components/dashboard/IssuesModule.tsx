import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ReportIssueForm } from './ReportIssueForm';
import { MyIssuesList } from './MyIssuesList';
import { AlertTriangle, List } from 'lucide-react';

interface IssuesModuleProps {
    userName: string;
}

export function IssuesModule({ userName }: IssuesModuleProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="bg-red-50 p-3 rounded-xl border border-red-100">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                </div>
                <div>
                    <h2 className="text-primary text-2xl font-bold">Issues & Support</h2>
                    <p className="text-sm text-muted-foreground">Report and track maintenance issues</p>
                </div>
            </div>

            <Tabs defaultValue="report" className="space-y-6">
                <TabsList className="bg-card border border-border p-1 rounded-2xl shadow-sm w-full md:w-auto h-auto">
                    <TabsTrigger
                        value="report"
                        className="rounded-xl flex-1 px-8 py-3 data-[state=active]:bg-red-600 data-[state=active]:text-white transition-all"
                    >
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Report Issue
                    </TabsTrigger>
                    <TabsTrigger
                        value="my-issues"
                        className="rounded-xl flex-1 px-8 py-3 data-[state=active]:bg-primary data-[state=active]:text-white transition-all"
                    >
                        <List className="h-4 w-4 mr-2" />
                        My Issues
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="report">
                    <div className="max-w-2xl">
                        <ReportIssueForm />
                    </div>
                </TabsContent>

                <TabsContent value="my-issues">
                    <div className="max-w-3xl">
                        <MyIssuesList />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
