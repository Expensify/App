import ReportActionsSkeletonGuard from '@pages/inbox/report/ReportActionsSkeletonGuard';

import React from 'react';

import type {ReportActionsListProps} from './types';

import ReportActionsListContent from './ReportActionsListContent';

/**
 * Public report-actions list. Thin composition that wraps the content in `ReportActionsSkeletonGuard`,
 * which owns the data pipeline + skeleton decision and only mounts the content once it is ready.
 */
function ReportActionsList({reportID, onLayout}: ReportActionsListProps) {
    return (
        <ReportActionsSkeletonGuard reportID={reportID}>
            <ReportActionsListContent
                key={reportID}
                reportID={reportID}
                onLayout={onLayout}
            />
        </ReportActionsSkeletonGuard>
    );
}

export default ReportActionsList;
