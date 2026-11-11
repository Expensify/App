import Navigation from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {Route} from '@src/ROUTES';

/**
 * Leaves the report picker for another screen, e.g. the restricted-action page or the workspace selection for a new report.
 * The full page navigates at once. The anchored dropdown passes `onNavigateAway` to close its container, and then navigates
 * only once that container has finished closing: pushing a screen while a bottom sheet is still animating out can leave
 * the new screen never shown, or cut the dismissal short, on iOS.
 */
function navigateAwayFromReportPicker(route: Route, onNavigateAway?: () => void) {
    if (!onNavigateAway) {
        Navigation.navigate(route);
        return;
    }
    onNavigateAway();
    TransitionTracker.runAfterTransitions({
        callback: () => Navigation.navigate(route),
        waitForUpcomingTransition: true,
    });
}

export default navigateAwayFromReportPicker;
