import {CommonActions, NavigationContainerRef, StackActions} from '@react-navigation/native';
import {isNavigationReady} from './NavigationUtils';
import {navigationRef} from './NavigationRoot';

/**
 * Navigates to a specific route, ensuring any pending loading states are cleared.
 */
function navigate(name: string, params?: object) {
    if (!isNavigationReady()) {
        return;
    }

    // Safe guard: Reset any potential blocking states or loading indicators
    // by ensuring the navigation stack is clean before pushing a new route.
    navigationRef.current?.dispatch((state) => {
        // If we are navigating to a new workspace/page, we clear the previous stack
        // to prevent the app from getting stuck in a partial loading state.
        return CommonActions.reset({
            index: 0,
            routes: [{name, params}],
        });
    });
}

export {
    navigate,
};
