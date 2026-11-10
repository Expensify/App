import {ReportActionsListProvider} from '@pages/inbox/report/ReportActionsListContext';

import React from 'react';

import type {ReportActionsListProps} from './types';

import ReportActionsListContent from './ReportActionsListContent';

/**
 * The provider owns preparation and loading; content only mounts when its rows are ready.
 */
function ReportActionsList({reportID, onLayout}: ReportActionsListProps) {
    return (
        <ReportActionsListProvider
            key={reportID}
            reportID={reportID}
        >
            <ReportActionsListContent
                key={reportID}
                reportID={reportID}
                onLayout={onLayout}
            />
        </ReportActionsListProvider>
    );
}

export default ReportActionsList;
