import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

import {useEffect, useRef} from 'react';

/**
 * Pre-inserts the destination report under the RHP on narrow layout for skip-confirmation
 * flows. Without this, revealRouteBeforeDismissingModal inserts the route at submit
 * time which causes a brief flash. The confirmation step handles its own pre-insertion
 * but skip-confirmation flows (PAY, track, scan, distance) never mount it.
 *
 * Uses TransitionTracker.runAfterTransitions with waitForUpcomingTransition so the insert
 * only happens after the RHP open transition completes, avoiding a brief flash of the
 * destination report behind the still-animating RHP.
 */
function useSkipConfirmationPreInsert(shouldSkipConfirmation: boolean, reportID: string | undefined) {
    const hasPreInsertedReport = useRef(false);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    useEffect(() => {
        const shouldPreInsert = shouldSkipConfirmation && !isSearchTopmostFullScreenRoute() && getIsNarrowLayout() && !!reportID;

        if (hasPreInsertedReport.current || !shouldPreInsert) {
            return;
        }
        hasPreInsertedReport.current = true;
        const cancelHandle = TransitionTracker.runAfterTransitions({
            callback: () => {
                const timer = setTimeout(() => {
                    Navigation.preInsertFullscreenUnderRHP(ROUTES.REPORT_WITH_ID.getRoute(reportID));
                }, CONST.PRE_INSERT_FULLSCREEN_DELAY);
                timerRef.current = timer;
            },
            waitForUpcomingTransition: true,
        });
        return () => {
            cancelHandle.cancel();
            if (timerRef.current !== null) {
                clearTimeout(timerRef.current);
                timerRef.current = null;
            }
            if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
                Navigation.removePreInsertedFullscreenIfNeeded();
            }
            hasPreInsertedReport.current = false;
        };
    }, [shouldSkipConfirmation, reportID]);
}

export default useSkipConfirmationPreInsert;
