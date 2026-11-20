import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import type {Route} from '@src/ROUTES';

/** On narrow layouts Concierge opens on top of the screen the user was on, so closing it returns there */
function closeConciergePage(fallbackRoute: Route, options?: {afterTransition?: () => void}) {
    const rootState = navigationRef.getRootState();
    if (rootState?.index) {
        Navigation.pop(rootState.key);
        if (options?.afterTransition) {
            TransitionTracker.runAfterTransitions({callback: options.afterTransition, waitForUpcomingTransition: true});
        }
        return;
    }
    Navigation.goBack(fallbackRoute, options);
}

export default closeConciergePage;
