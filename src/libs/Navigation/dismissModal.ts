import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import {findLastIndex} from 'lodash';
import Log from '@libs/Log';
import getPolicyMemberAccountIDs from '@libs/PolicyMembersUtils';
import {doesReportBelongToWorkspace, getReport} from '@libs/ReportUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getPolicyIdFromState from './getPolicyIdFromState';
import getStateFromPath from './getStateFromPath';
import getTopmostReportId from './getTopmostReportId';
import linkingConfig from './linkingConfig';
import switchPolicyID from './switchPolicyID';
import type {RootStackParamList, StackNavigationAction, State} from './types';

// This function is in a separate file than Navigation.js to avoid cyclic dependency.

/**
 * Dismisses the last modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModal(targetReportID: string, navigationRef: NavigationContainerRef<RootStackParamList>) {
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
            // if we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReportID && targetReportID !== getTopmostReportId(state)) {
                const reportState = getStateFromPath(ROUTES.REPORT_WITH_ID.getRoute(targetReportID));
                const policyID = getPolicyIdFromState(state as State<RootStackParamList>);
                const policyMemberAccountIDs = getPolicyMemberAccountIDs(policyID);
                const targetReport = getReport(targetReportID);
                // If targetReport is an empty object, it means that it's a new report, so it can't belong to any workspace
                const shouldOpenAllWorkspace = isEmptyObject(targetReport) ? true : !doesReportBelongToWorkspace(targetReport, policyID, policyMemberAccountIDs);
                if (shouldOpenAllWorkspace) {
                    switchPolicyID(navigationRef, {route: ROUTES.HOME});
                } else {
                    switchPolicyID(navigationRef, {policyID, route: ROUTES.HOME});
                }

                const action: StackNavigationAction = getActionFromState(reportState, linkingConfig.config);
                if (action) {
                    action.type = 'REPLACE';
                    navigationRef.dispatch(action);
                }
                // If not-found page is in the route stack, we need to close it
            } else if (targetReportID && state.routes.some((route) => route.name === SCREENS.NOT_FOUND)) {
                const lastRouteIndex = state.routes.length - 1;
                const centralRouteIndex = findLastIndex(state.routes, (route) => route.name === NAVIGATORS.CENTRAL_PANE_NAVIGATOR);
                navigationRef.dispatch({...StackActions.pop(lastRouteIndex - centralRouteIndex), target: state.key});
            } else {
                navigationRef.dispatch({...StackActions.pop(), target: state.key});
            }
            break;
        default: {
            Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        }
    }
}

export default dismissModal;
