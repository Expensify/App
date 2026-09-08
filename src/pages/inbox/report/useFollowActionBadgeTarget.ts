import usePrevious from '@hooks/usePrevious';

import Navigation from '@libs/Navigation/Navigation';

import type * as OnyxTypes from '@src/types/onyx';

import {useEffect, useRef} from 'react';

import shouldFollowActionBadgeTarget from './shouldFollowActionBadgeTarget';

type UseFollowActionBadgeTargetParams = {
    /** Whether the app is running in production, where this auto-scroll behavior is gated off */
    isProduction: boolean;

    /** The ID of the report whose list is being displayed */
    reportID: string;

    /** The report action the badge currently targets (the oldest preview still requiring action) */
    actionTargetReportActionID: string | undefined;

    /** Index of the current target in the rendered (inverted) list, or -1 when it is not rendered */
    actionBadgeTargetIndex: number;

    /** The rendered (inverted) report actions the list is displaying */
    renderedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Maps canonical action IDs to their rendered indices when collapsed runs hide individual actions */
    reportActionIDToDisplayIndex?: ReadonlyMap<string, number>;

    /** Scrolls the list to the current action-badge target */
    scrollToActionBadgeTarget: () => void;
};

/**
 * When the action-badge target is resolved (e.g. the user approves/pays/submits an older report preview), it advances to the next
 * preview requiring action. This hook scrolls down to follow it immediately on action.
 */
function useFollowActionBadgeTarget({
    isProduction,
    reportID,
    actionTargetReportActionID,
    actionBadgeTargetIndex,
    renderedVisibleReportActions,
    reportActionIDToDisplayIndex,
    scrollToActionBadgeTarget,
}: UseFollowActionBadgeTargetParams) {
    const prevActionTargetReportActionID = usePrevious(actionTargetReportActionID);
    // Keep the latest scroll callback in a ref so a scroll scheduled on the next frame targets the current badge index rather than a
    // stale one, in case the list shifts (new message, pagination, resolved preview collapsing) before the frame runs.
    const scrollToActionBadgeTargetRef = useRef(scrollToActionBadgeTarget);
    useEffect(() => {
        scrollToActionBadgeTargetRef.current = scrollToActionBadgeTarget;
    });
    useEffect(() => {
        const prevActionBadgeTargetIndex =
            (prevActionTargetReportActionID ? reportActionIDToDisplayIndex?.get(prevActionTargetReportActionID) : undefined) ??
            renderedVisibleReportActions.findIndex((action) => action.reportActionID === prevActionTargetReportActionID);
        if (!shouldFollowActionBadgeTarget({isProduction, actionTargetReportActionID, prevActionTargetReportActionID, actionBadgeTargetIndex, prevActionBadgeTargetIndex})) {
            return;
        }
        // Only follow the badge when the resolving action happened on this report's preview while this report is the one on
        // screen. If the target advanced because the action was done on another page (e.g. submitting inside the expense report
        // itself, or resolving it from an RHP), this report isn't the topmost/active report, so auto-scrolling it would shift the
        // list out from under the user and is confusing.
        if (Navigation.getTopmostReportId() !== reportID || !!Navigation.getReportRHPActiveRoute()) {
            return;
        }
        // Scroll to the next target on the next frame so the forward-scroll starts as soon as the user acts. The resolved preview
        // keeps animating in place while the list scrolls.
        const animationFrameID = requestAnimationFrame(() => scrollToActionBadgeTargetRef.current());
        return () => cancelAnimationFrame(animationFrameID);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionTargetReportActionID]);
}

export default useFollowActionBadgeTarget;
