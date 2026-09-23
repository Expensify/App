import React from 'react';
import useScrollRestoration from '../../hooks/useScrollRestoration';
import ReportRow from './ReportRow';
import reports from '../../data/reports'; // placeholder import

/**
 * ReportsList component displays a list of expense reports.
 * The scroll position is now preserved when navigating back from a report view.
 */
export default function ReportsList() {
    // Use the hook with a unique key based on the current path
    const scrollRef = useScrollRestoration('reports-list');

    return (
        <div
            ref={scrollRef}
            className="overflow-y-auto h-full"
            data-testid="reports-list-container"
        >
            {reports.map((report) => (
                <ReportRow key={report.id} report={report} />
            ))}
        </div>
    );
}
