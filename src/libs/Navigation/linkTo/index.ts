import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import omitBy from 'lodash/omitBy';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportOpenInRHP from '@libs/Navigation/isReportOpenInRHP';
import {isCentralPaneName} from '@libs/NavigationUtils';
import shallowCompare from '@libs/ObjectUtils';
import {extractPolicyIDFromPath, getPathWithoutPolicyID} from '@libs/PolicyUtils';
import getActionsFromPartialDiff from '@navigation/AppNavigator/getActionsFromPartialDiff';
import getPartialStateDiff from '@navigation/AppNavigator/getPartialStateDiff';
import dismissModal from '@navigation/dismissModal';
import extractPolicyIDFromQuery from '@navigation/extractPolicyIDFromQuery';
import extrapolateStateFromParams from '@navigation/extrapolateStateFromParams';
import getPolicyIDFromState from '@navigation/getPolicyIDFromState';
import getStateFromPath from '@navigation/getStateFromPath';
import getTopmostBottomTabRoute from '@navigation/getTopmostBottomTabRoute';
import getTopmostCentralPaneRoute from '@navigation/getTopmostCentralPaneRoute';
import getTopmostReportId from '@navigation/getTopmostReportId';
import isSideModalNavigator from '@navigation/isSideModalNavigator';
import linkingConfig from '@navigation/linkingConfig';
import getAdaptedStateFromPath from '@navigation/linkingConfig/getAdaptedStateFromPath';
import getMatchingBottomTabRouteForState from '@navigation/linkingConfig/getMatchingBottomTabRouteForState';
import getMatchingCentralPaneRouteForState from '@navigation/linkingConfig/getMatchingCentralPaneRouteForState';
import replacePathInNestedState from '@navigation/linkingConfig/replacePathInNestedState';
import type {NavigationRoot, RootStackParamList, StackNavigationAction, State} from '@navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import getActionForBottomTabNavigator from './getActionForBottomTabNavigator';
import getMinimalAction from './getMinimalAction';
import type {ActionPayloadParams} from './types';

export default function linkTo(navigation: NavigationContainerRef<RootStackParamList> | null, path: Route, type?: string, isActiveRoute?: boolean) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }
    let root: NavigationRoot = navigation;
    let current: NavigationRoot | undefined;
    // Traverse up to get the root navigation
    // eslint-disable-next-line no-cond-assign
    while ((current = root.getParent())) {
        root = current;
    }

    const pathWithoutPolicyID = getPathWithoutPolicyID(`/${path}`) as Route;
    const rootState = navigation.getRootState() as NavigationState<RootStackParamList>;
    const stateFromPath = getStateFromPath(pathWithoutPolicyID) as PartialState<NavigationState<RootStackParamList>>;
    // Creating path with /w/ included if necessary.
    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);

    const extractedPolicyID = extractPolicyIDFromPath(`/${path}`);
    const policyIDFromState = getPolicyIDFromState(rootState);
    const policyID = extractedPolicyID ?? policyIDFromState;
    const lastRoute = rootState?.routes?.at(-1);

    const isNarrowLayout = getIsNarrowLayout();

    const isWorkspaceScreenOnTop = lastRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR;

    // policyID on SCREENS.SEARCH.CENTRAL_PANE can be present only as part of SearchQuery, while on other pages it's stored in the url in the format: /w/:policyID/
    if (policyID && !isWorkspaceScreenOnTop && !policyIDFromState) {
        // The stateFromPath doesn't include proper path if there is a policy passed with /w/id.
        // We need to replace the path in the state with the proper one.
        // To avoid this hacky solution we may want to create custom getActionFromState function in the future.
        replacePathInNestedState(stateFromPath, `/w/${policyID}${pathWithoutPolicyID}`);
    }

    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    const isReportInRhpOpened = isReportOpenInRHP(rootState);

    // If action type is different than NAVIGATE we can't change it to the PUSH safely
    if (action?.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        const actionPayloadParams = action.payload.params as ActionPayloadParams;

        const topRouteName = lastRoute?.name;

        // CentralPane screens aren't nested in any navigator, if actionPayloadParams?.screen is undefined, it means the screen name and parameters have to be read directly from action.payload
        const targetName = actionPayloadParams?.screen ?? action.payload.name;
        const targetParams = actionPayloadParams?.params ?? actionPayloadParams;
        const isTargetNavigatorOnTop = topRouteName === action.payload.name;

        const isTargetScreenDifferentThanCurrent = !!(!topmostCentralPaneRoute || topmostCentralPaneRoute.name !== targetName);
        const areParamsDifferent =
            targetName === SCREENS.REPORT
                ? getTopmostReportId(rootState) !== getTopmostReportId(stateFromPath)
                : !shallowCompare(
                      omitBy(topmostCentralPaneRoute?.params as Record<string, unknown> | undefined, (value) => value === undefined),
                      omitBy(targetParams as Record<string, unknown> | undefined, (value) => value === undefined),
                  );

        // If this action is navigating to the report screen and the top most navigator is different from the one we want to navigate - PUSH the new screen to the top of the stack by default
        if (isCentralPaneName(action.payload.name) && (isTargetScreenDifferentThanCurrent || areParamsDifferent)) {
            // We need to push a tab if the tab doesn't match the central pane route that we are going to push.
            const topmostBottomTabRoute = getTopmostBottomTabRoute(rootState);

            const focusedRoute = findFocusedRoute(stateFromPath);
            const policyIDFromQuery = extractPolicyIDFromQuery(focusedRoute);
            const matchingBottomTabRoute = getMatchingBottomTabRouteForState(stateFromPath, policyID ?? policyIDFromQuery);
            const isOpeningSearch = matchingBottomTabRoute.name === SCREENS.SEARCH.BOTTOM_TAB;
            const isNewPolicyID =
                ((topmostBottomTabRoute?.params as Record<string, string | undefined>)?.policyID ?? '') !==
                ((matchingBottomTabRoute?.params as Record<string, string | undefined>)?.policyID ?? '');

            if (topmostBottomTabRoute && (topmostBottomTabRoute.name !== matchingBottomTabRoute.name || isNewPolicyID || isOpeningSearch)) {
                root.dispatch({
                    type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                    payload: matchingBottomTabRoute,
                });
            }

            if (type === CONST.NAVIGATION.TYPE.UP) {
                action.type = CONST.NAVIGATION.ACTION_TYPE.REPLACE;
            } else {
                action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
            }

            // If the type is UP, we deeplinked into one of the RHP flows and we want to replace the current screen with the previous one in the flow
            // and at the same time we want the back button to go to the page we were before the deeplink
        } else if (type === CONST.NAVIGATION.TYPE.UP) {
            if (!areParamsDifferent && isSideModalNavigator(lastRoute?.name) && topmostCentralPaneRoute?.name === targetName) {
                dismissModal(navigation);
                return;
            }
            action.type = CONST.NAVIGATION.ACTION_TYPE.REPLACE;

            // If this action is navigating to ModalNavigator or WorkspaceNavigator and the last route on the root navigator is not already opened Navigator then push
        } else if ((action.payload.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || isSideModalNavigator(action.payload.name)) && !isTargetNavigatorOnTop) {
            if (isSideModalNavigator(topRouteName)) {
                dismissModal(navigation);
            }

            // If this RHP has mandatory central pane and bottom tab screens defined we need to push them.
            const {adaptedState, metainfo} = getAdaptedStateFromPath(path, linkingConfig.config);
            if (adaptedState && (metainfo.isCentralPaneAndBottomTabMandatory || metainfo.isWorkspaceNavigatorMandatory)) {
                const diff = getPartialStateDiff(rootState, adaptedState as State<RootStackParamList>, metainfo);
                const diffActions = getActionsFromPartialDiff(diff);
                for (const diffAction of diffActions) {
                    root.dispatch(diffAction);
                }
            }
            // All actions related to FullScreenNavigator on wide screen are pushed when comparing differences between rootState and adaptedState.
            if (action.payload.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
                return;
            }
            action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;

            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        } else if (action.payload.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR) {
            // If path contains a policyID, we should invoke the navigate function
            const shouldNavigate = !!extractedPolicyID;
            const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState, policyID, shouldNavigate);

            if (!actionForBottomTabNavigator) {
                return;
            }

            root.dispatch(actionForBottomTabNavigator);

            // If the layout is wide we need to push matching central pane route to the stack.
            if (!isNarrowLayout) {
                // stateFromPath should always include bottom tab navigator state, so getMatchingCentralPaneRouteForState will be always defined.
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(stateFromPath, rootState)!;
                if (matchingCentralPaneRoute && 'name' in matchingCentralPaneRoute) {
                    root.dispatch({
                        type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
                        payload: {
                            name: matchingCentralPaneRoute.name,
                            params: matchingCentralPaneRoute.params,
                        },
                    });
                }
            } else {
                // If the layout is small we need to pop everything from the central pane so the bottom tab navigator is visible.
                root.dispatch({
                    type: 'POP_TO_TOP',
                    target: rootState.key,
                });
            }
            return;
        }
    }

    if (action && 'payload' in action && action.payload && 'name' in action.payload && isSideModalNavigator(action.payload.name)) {
        // Information about the state may be in the params.
        const currentFocusedRoute = findFocusedRoute(extrapolateStateFromParams(rootState));
        const targetFocusedRoute = findFocusedRoute(stateFromPath);

        // If the current focused route is the same as the target focused route, we don't want to navigate.
        if (
            currentFocusedRoute?.name === targetFocusedRoute?.name &&
            shallowCompare(currentFocusedRoute?.params as Record<string, string | undefined>, targetFocusedRoute?.params as Record<string, string | undefined>)
        ) {
            return;
        }

        const minimalAction = getMinimalAction(action, navigation.getRootState());
        if (minimalAction) {
            // There are situations where a route already exists on the current navigation stack
            // But we want to push the same route instead of going back in the stack
            // Which would break the user navigation history
            if (!isActiveRoute && type === CONST.NAVIGATION.ACTION_TYPE.PUSH) {
                minimalAction.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
            }
            root.dispatch(minimalAction);
            return;
        }
    }

    // When we navigate from the ReportScreen opened in RHP, this page shouldn't be removed from the navigation state to allow users to go back to it.
    if (isReportInRhpOpened && action) {
        action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }

    if (action !== undefined) {
        root.dispatch(action);
    } else {
        root.reset(stateFromPath);
    }
}
