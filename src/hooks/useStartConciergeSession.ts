import {useLayoutEffect} from 'react';
import {useConciergeSessionActions} from '@pages/inbox/ConciergeSessionContext';
import {useCurrentReportIDState} from './useCurrentReportID';
import type {ReportActionsReadinessSignals} from './useReportActionsListModel';

type UseStartConciergeSessionParams = Pick<ReportActionsReadinessSignals, 'isConciergeMainDM' | 'oldestUnreadReportAction' | 'hasOnceLoadedReportActions'> & {
    /** The ID of the report to display actions for */
    reportID: string;

    /** The report's lastReadTime, used as the unread boundary when starting the session */
    lastReadTime: string | undefined;

    /** Whether actions are already cached, excluding the synthetic CREATED action */
    hasCachedReportActions: boolean;
};

/**
 * Starts the Concierge main-DM session. Subscribes to currentReportID/startSession itself so the pipeline
 * doesn't carry them; currentReportID re-renders the guard but never the list.
 */
function useStartConciergeSession({reportID, lastReadTime, isConciergeMainDM, oldestUnreadReportAction, hasOnceLoadedReportActions, hasCachedReportActions}: UseStartConciergeSessionParams) {
    const {currentReportID} = useCurrentReportIDState();
    const {startSession} = useConciergeSessionActions();

    // hasOnceLoadedReportActions is RAM-only and resets to falsy on a page
    // refresh, but cached report actions persist in Onyx. Gating the session
    // start on it alone would leave sessionStartTime null until openReport
    // returns, during which filterActions collapses the cached history down to
    // just the synthetic CREATED action (an almost-empty chat flash). Start the
    // session as soon as cached actions exist so messages render immediately on
    // refresh, matching the concierge skeleton condition.
    const canStartConciergeSession = !!hasOnceLoadedReportActions || hasCachedReportActions;

    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession) {
            return;
        }
        startSession(oldestUnreadReportAction ? lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- startSession is stable; captured values at mount only
    }, [isConciergeMainDM, startSession, canStartConciergeSession]);

    // On native the component stays mounted in the navigation stack, so the
    // effect above never re-fires (its isConciergeMainDM dep is always true).
    // Re-trigger startSession when the globally-focused report matches this
    // report so the session age check runs after navigating away and back.
    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession || currentReportID !== reportID) {
            return;
        }
        startSession(oldestUnreadReportAction ? lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to currentReportID returning to this report
    }, [currentReportID, reportID, isConciergeMainDM, canStartConciergeSession, startSession]);
}

export default useStartConciergeSession;
