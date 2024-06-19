import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import Log from '@libs/Log';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {RootStackParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Dismisses the last modal stack if there is any
 */
function dismissModal(navigationRef: NavigationContainerRef<RootStackParamList>) {
    if (!navigationRef.isReady()) {
        return;
    }

    const state = navigationRef.getState();
    const lastRoute = state.routes.at(-1);
    switch (lastRoute?.name) {
        case NAVIGATORS.WORKSPACE_NAVIGATOR:
        case NAVIGATORS.LEFT_MODAL_NAVIGATOR:
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR:
        case NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.ATTACHMENTS:
        case SCREENS.TRANSACTION_RECEIPT:
        case SCREENS.PROFILE_AVATAR:
        case SCREENS.WORKSPACE_AVATAR:
        case SCREENS.REPORT_AVATAR:
        case SCREENS.CONCIERGE:
            navigationRef.dispatch({...StackActions.pop(), target: state.key});
            break;
        default: {
            Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        }
    }
}

export default dismissModal;
