import {useLayoutEffect} from 'react';
import {useConciergeSessionActions} from '@pages/inbox/ConciergeSessionContext';
import {useCurrentReportIDState} from './useCurrentReportID';
import type {ReportActionsReadinessSignals} from './useReportActionsListModel';

type UseStartConciergeSessionParams = Pick<ReportActionsReadinessSignals, 'isConciergeMainDM' | 'oldestUnreadReportAction' | 'hasOnceLoadedReportActions'> & {
    /** The ID of the report to display actions for */
    reportID: string;

    /** Whether actions are already cached, excluding the synthetic CREATED action */
    hasCachedReportActions: boolean;
};

/**
 * Starts the Concierge main-DM session. Subscribes to currentReportID/startSession itself so the pipeline
 * doesn't carry them; currentReportID re-renders the guard but never the list.
 */
function useStartConciergeSession({reportID, isConciergeMainDM, oldestUnreadReportAction, hasOnceLoadedReportActions, hasCachedReportActions}: UseStartConciergeSessionParams) {
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
        // Anchor the session to the unread action's created time, a stable pre-read
        // boundary, rather than the live report.lastReadTime which readNewestAction
        // bumps to `now` when the report opens. Re-runs when oldestUnreadReportAction
        // resolves so a session that locked to `now` before the anchor loaded is
        // pulled back to keep the unread message visible.
        startSession(oldestUnreadReportAction?.created);
    }, [isConciergeMainDM, startSession, canStartConciergeSession, oldestUnreadReportAction?.created]);

    // On native the component stays mounted in the navigation stack, so the
    // effect above never re-fires (its isConciergeMainDM dep is always true).
    // Re-trigger startSession when the globally-focused report matches this
    // report so the session age check runs after navigating away and back.
    useLayoutEffect(() => {
        if (!isConciergeMainDM || !canStartConciergeSession || currentReportID !== reportID) {
            return;
        }
        startSession(oldestUnreadReportAction?.created);
    }, [currentReportID, reportID, isConciergeMainDM, canStartConciergeSession, startSession, oldestUnreadReportAction?.created]);
}

export default useStartConciergeSession;
