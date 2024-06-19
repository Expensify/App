import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import findLastIndex from 'lodash/findLastIndex';
import type {OnyxEntry} from 'react-native-onyx';
import Log from '@libs/Log';
import {isCentralPaneName} from '@libs/NavigationUtils';
import getPolicyEmployeeAccountIDs from '@libs/PolicyEmployeeListUtils';
import {doesReportBelongToWorkspace} from '@libs/ReportUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getPolicyIDFromState from './getPolicyIDFromState';
import getStateFromPath from './getStateFromPath';
import getTopmostReportId from './getTopmostReportId';
import linkingConfig from './linkingConfig';
import type {RootStackParamList, StackNavigationAction, State} from './types';

// This function is in a separate file than Navigation.ts to avoid cyclic dependency.

/**
 * Dismisses the last modal stack if there is any
 *
 * @param targetReportID - The reportID to navigate to after dismissing the modal
 */
function dismissModalWithReport(targetReport: OnyxEntry<Report>, navigationRef: NavigationContainerRef<RootStackParamList>) {
    if (!navigationRef.isReady()) {
        return;
    }

    const state = navigationRef.getState();
    const lastRoute = state.routes.at(-1);
    switch (lastRoute?.name) {
        case NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR:
        case NAVIGATORS.LEFT_MODAL_NAVIGATOR:
        case NAVIGATORS.RIGHT_MODAL_NAVIGATOR:
        case SCREENS.NOT_FOUND:
        case SCREENS.ATTACHMENTS:
        case SCREENS.TRANSACTION_RECEIPT:
        case SCREENS.PROFILE_AVATAR:
        case SCREENS.WORKSPACE_AVATAR:
        case SCREENS.REPORT_AVATAR:
        case SCREENS.CONCIERGE:
            // If we are not in the target report, we need to navigate to it after dismissing the modal
            if (targetReport?.reportID !== getTopmostReportId(state)) {
                const reportState = getStateFromPath(ROUTES.REPORT_WITH_ID.getRoute(targetReport?.reportID ?? '-1'));
                const policyID = getPolicyIDFromState(state as State<RootStackParamList>);
                const policyMemberAccountIDs = getPolicyEmployeeAccountIDs(policyID);
                const shouldOpenAllWorkspace = isEmptyObject(targetReport) ? true : !doesReportBelongToWorkspace(targetReport, policyMemberAccountIDs, policyID);

                // @TODO Handle dismissing modal with switching a policyID

                // if (shouldOpenAllWorkspace) {
                //     switchPolicyID(navigationRef, {route: ROUTES.HOME});
                // } else {
                //     switchPolicyID(navigationRef, {policyID, route: ROUTES.HOME});
                // }

                const action: StackNavigationAction = getActionFromState(reportState, linkingConfig.config);
                if (action) {
                    action.type = 'REPLACE';
                    navigationRef.dispatch(action);
                }
                // If not-found page is in the route stack, we need to close it
            } else if (state.routes.some((route) => route.name === SCREENS.NOT_FOUND)) {
                const lastRouteIndex = state.routes.length - 1;
                const centralRouteIndex = findLastIndex(state.routes, (route) => isCentralPaneName(route.name));
                navigationRef.dispatch({...StackActions.pop(lastRouteIndex - centralRouteIndex), target: state.key});
            } else {
                navigationRef.dispatch({...StackActions.pop(), target: state.key});
            }
            break;
        default: {
            Log.hmmm('[Navigation] dismissModalWithReport failed because there is no modal stack to dismiss');
        }
    }
}

export default dismissModalWithReport;
