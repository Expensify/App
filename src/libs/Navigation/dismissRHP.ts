import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import type {RootStackParamList} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Dismisses the RHP modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissRHP(navigationRef: NavigationContainerRef<RootStackParamList>) {
    if (!navigationRef.isReady()) {
        return;
    }

    const state = navigationRef.getState();
    const lastRoute = state.routes.at(-1);
    if (lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        navigationRef.dispatch({...StackActions.pop(), target: state.key});
    }
}

export default dismissRHP;
