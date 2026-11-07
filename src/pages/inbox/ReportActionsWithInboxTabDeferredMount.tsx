/** Defer mounting report actions until the initial Inbox tab transition settles. */
import NavigationDeferredMount from '@components/NavigationDeferredMount';

import CONST from '@src/CONST';

import React from 'react';

import ReportActionsLoadingSkeleton from './report/ReportActionsLoadingSkeleton';
import ReportActions from './ReportActions';

type ReportActionsWithInboxTabDeferredMountProps = {
    /** The report ID used by the deferred loading skeleton */
    reportID: string | undefined;

    /** Whether to defer mounting report actions during the initial Inbox tab navigation */
    shouldDefer: boolean;
};

function ReportActionsWithInboxTabDeferredMount({reportID, shouldDefer}: ReportActionsWithInboxTabDeferredMountProps) {
    if (!shouldDefer) {
        return <ReportActions />;
    }

    return (
        <NavigationDeferredMount
            waitForUpcomingTransition={false}
            placeholder={
                // Deferral, not a data wait. Closing the span here would time the defer and tag a cached report cold.
                <ReportActionsLoadingSkeleton
                    reportID={reportID}
                    skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.INBOX_TAB_DEFER}
                    shouldMarkOpenReportEnd={false}
                />
            }
        >
            <ReportActions />
        </NavigationDeferredMount>
    );
}

export default ReportActionsWithInboxTabDeferredMount;
