/** Keep chat effects unmounted during app loading, except for the Concierge welcome screen. */
import {useIsAppLoadPending} from '@hooks/useInFlightRequests';
import useInitial from '@hooks/useInitial';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {isConciergeChatReport} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';

import React from 'react';

import ReportActionsList from './report/ReportActionsList';
import ReportActionsLoadingSkeleton from './report/ReportActionsLoadingSkeleton';
import UserTypingEventListener from './report/UserTypingEventListener';

type ChatReportActionsProps = {
    report: Report;
};

function ChatReportActions({report}: ChatReportActionsProps) {
    const {isOffline} = useNetwork();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isAppLoadPending = useIsAppLoadPending();
    const isConciergeMainDM = isConciergeChatReport(report, conciergeReportID);
    const hasRenderedReportActions = useInitial(isOffline || !isAppLoadPending || isConciergeMainDM ? true : undefined);

    if (!hasRenderedReportActions) {
        return (
            <ReportActionsLoadingSkeleton
                reportID={report.reportID}
                skeletonName={CONST.TELEMETRY.CANCELED_BY_SKELETON.REPORT_ACTIONS_APP_LOAD}
            />
        );
    }

    return (
        <>
            <ReportActionsList
                key={report.reportID}
                reportID={report.reportID}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ChatReportActions;
