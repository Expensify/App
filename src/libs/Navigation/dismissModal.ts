import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import Log from '@libs/Log';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {RootStackParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Dismisses the last modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModal(navigationRef: NavigationContainerRef<RootStackParamList>) {
    if (!navigationRef.isReady()) {
        return;
    }

    const state = navigationRef.getState();
    const lastRoute = state.routes.at(-1);
    switch (lastRoute?.name) {
        case NAVIGATORS.FULL_SCREEN_NAVIGATOR:
        case NAVIGATORS.LEFT_MODAL_NAVIGATOR:
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.REPORT_ATTACHMENTS:
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
