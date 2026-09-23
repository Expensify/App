import React from 'react';
import ReportsList from './ReportsList';

export default function ReportsPage() {
    return (
        <div className="flex flex-col h-full">
            <h1 className="text-2xl font-semibold mb-4">Reports</h1>
            <ReportsList />
        </div>
    );
}
