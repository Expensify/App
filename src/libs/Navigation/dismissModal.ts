import {getActionFromState, StackActions} from '@react-navigation/native';
import {findLastIndex} from 'lodash';
import Log from '@libs/Log';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';
import getTopmostReportId from './getTopmostReportId';
import linkingConfig from './linkingConfig';
import navigationRef from './navigationRef';
import {StackNavigationAction} from './types';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Dismisses the last modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModal(targetReportID?: string) {
    // if (!canNavigate('dismissModal')) {
    //     return;
    // }
    const rootState = navigationRef.getRootState();
    const lastRoute = rootState.routes.at(-1);
    switch (lastRoute?.name) {
        case NAVIGATORS.LEFT_MODAL_NAVIGATOR:
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.REPORT_ATTACHMENTS:
            // if we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReportID && targetReportID !== getTopmostReportId(rootState)) {
                const state = getStateFromPath(ROUTES.REPORT_WITH_ID.getRoute(targetReportID));

                const action: StackNavigationAction = getActionFromState(state, linkingConfig.config);
                if (action) {
                    action.type = 'REPLACE';
                    navigationRef.current?.dispatch(action);
                }
                // If not-found page is in the route stack, we need to close it
            } else if (targetReportID && rootState.routes.some((route) => route.name === SCREENS.NOT_FOUND)) {
                const lastRouteIndex = rootState.routes.length - 1;
                const centralRouteIndex = findLastIndex(rootState.routes, (route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
                navigationRef.current?.dispatch({...StackActions.pop(lastRouteIndex - centralRouteIndex), target: rootState.key});
            } else {
                navigationRef.current?.dispatch({...StackActions.pop(), target: rootState.key});
            }
            break;
        default: {
            Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        }
    }
}

export default dismissModal;
