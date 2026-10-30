import ReportActionsSkeletonGuard from '@pages/inbox/report/ReportActionsSkeletonGuard';

/** Keeps the report-data readiness guard outside the scrollable message list. */
import React from 'react';

import type {ReportActionsListProps} from './types';

import ReportActionsListContent from './ReportActionsListContent';

/**
 * Public report-actions list. Thin composition that wraps the content in `ReportActionsSkeletonGuard`,
 * which owns the data pipeline + skeleton decision and only mounts the content once it is ready.
 */
function ReportActionsList({reportID, conciergeChat, onLayout}: ReportActionsListProps) {
    return (
        <ReportActionsSkeletonGuard
            key={reportID}
            reportID={reportID}
        >
            <ReportActionsListContent
                key={reportID}
                reportID={reportID}
                conciergeChat={conciergeChat}
                onLayout={onLayout}
            />
        </ReportActionsSkeletonGuard>
    );
}

export default ReportActionsList;
