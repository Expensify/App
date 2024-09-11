import {getActionFromState} from '@react-navigation/core';
import type {NavigationContainerRef, NavigationState, PartialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import {shallowCompare} from '@libs/ObjectUtils';
import {getPathWithoutPolicyID} from '@libs/PolicyUtils';
import getStateFromPath from '@navigation/getStateFromPath';
import linkingConfig from '@navigation/linkingConfig';
import type {RootStackParamList, StackNavigationAction} from '@navigation/types';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import getMinimalAction from './getMinimalAction';

function shouldDispatchAction(currentState: NavigationState<RootStackParamList>, stateFromPath: PartialState<NavigationState<RootStackParamList>>) {
    const currentFocusedRoute = findFocusedRoute(currentState);
    const targetFocusedRoute = findFocusedRoute(stateFromPath);

    const areNamesEqual = currentFocusedRoute?.name === targetFocusedRoute?.name;
    const areParamsEqual = shallowCompare(currentFocusedRoute?.params as Record<string, unknown> | undefined, targetFocusedRoute?.params as Record<string, unknown> | undefined);

    if (areNamesEqual && areParamsEqual) {
        return false;
    }

    return true;
}

export default function linkTo(navigation: NavigationContainerRef<RootStackParamList> | null, path: Route, type?: string, isActiveRoute?: boolean) {
    if (!navigation) {
        throw new Error("Couldn't find a navigation object. Is your component inside a screen in a navigator?");
    }

    const pathWithoutPolicyID = getPathWithoutPolicyID(`/${path}`) as Route;

    // This is the state generated with the default getStateFromPath function.
    // It won't include the whole state that will be generated for this path but the focused route will be correct.
    // It is necessary because getActionFromState will generate RESET action for whole state generated with our custom getStateFromPath function.
    const stateFromPath = getStateFromPath(pathWithoutPolicyID) as PartialState<NavigationState<RootStackParamList>>;
    const currentState = navigation.getRootState() as NavigationState<RootStackParamList>;
    const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    // We don't want to dispatch action to push/replace with exactly the same route that is already focused.
    if (!shouldDispatchAction(currentState, stateFromPath)) {
        return;
    }

    // If there is no action, just reset the whole state.
    if (!action) {
        navigation.resetRoot(stateFromPath);
        return;
    }

    if (action.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
        // We want to PUSH by default to add entries to the browser history.
        action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    }

    if (!shouldDispatchAction(currentState, stateFromPath)) {
        return;
    }

    const minimalAction = getMinimalAction(action, navigation.getRootState());
    navigation.dispatch(minimalAction);

    // const pathWithoutPolicyID = getPathWithoutPolicyID(`/${path}`) as Route;
    // const rootState = navigation.getRootState() as NavigationState<RootStackParamList>;
    // const stateFromPath = getStateFromPath(pathWithoutPolicyID) as PartialState<NavigationState<RootStackParamList>>;
    // // Creating path with /w/ included if necessary.
    // const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);
    // const policyIDs = !!topmostCentralPaneRoute?.params && 'policyIDs' in topmostCentralPaneRoute.params ? (topmostCentralPaneRoute?.params?.policyIDs as string) : '';
    // const extractedPolicyID = extractPolicyIDFromPath(`/${path}`);
    // const policyIDFromState = getPolicyIDFromState(rootState);
    // const policyID = extractedPolicyID ?? policyIDFromState ?? policyIDs;
    // const lastRoute = rootState?.routes?.at(-1);

    // const isNarrowLayout = getIsNarrowLayout();

    // const isWorkspaceScreenOnTop = lastRoute?.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR;

    // // policyIDs is present only on SCREENS.SEARCH.CENTRAL_PANE and it's displayed in the url as a query param, on the other pages this parameter is called policyID and it's shown in the url in the format: /w/:policyID
    // if (policyID && !isWorkspaceScreenOnTop && !policyIDs) {
    //     // The stateFromPath doesn't include proper path if there is a policy passed with /w/id.
    //     // We need to replace the path in the state with the proper one.
    //     // To avoid this hacky solution we may want to create custom getActionFromState function in the future.
    //     replacePathInNestedState(stateFromPath, `/w/${policyID}${pathWithoutPolicyID}`);
    // }

    // const action: StackNavigationAction = getActionFromState(stateFromPath, linkingConfig.config);

    // const isReportInRhpOpened = isReportOpenInRHP(rootState);

    // // If action type is different than NAVIGATE we can't change it to the PUSH safely
    // if (action?.type === CONST.NAVIGATION.ACTION_TYPE.NAVIGATE) {
    //     const actionPayloadParams = action.payload.params as ActionPayloadParams;

    //     const topRouteName = lastRoute?.name;

    //     // CentralPane screens aren't nested in any navigator, if actionPayloadParams?.screen is undefined, it means the screen name and parameters have to be read directly from action.payload
    //     const targetName = actionPayloadParams?.screen ?? action.payload.name;
    //     const targetParams = actionPayloadParams?.params ?? actionPayloadParams;
    //     const isTargetNavigatorOnTop = topRouteName === action.payload.name;

    //     const isTargetScreenDifferentThanCurrent = !!(!topmostCentralPaneRoute || topmostCentralPaneRoute.name !== targetName);
    //     const areParamsDifferent =
    //         targetName === SCREENS.REPORT
    //             ? getTopmostReportId(rootState) !== getTopmostReportId(stateFromPath)
    //             : !shallowCompare(
    //                   omitBy(topmostCentralPaneRoute?.params as Record<string, unknown> | undefined, (value) => value === undefined),
    //                   omitBy(targetParams as Record<string, unknown> | undefined, (value) => value === undefined),
    //               );

    //     // If this action is navigating to the report screen and the top most navigator is different from the one we want to navigate - PUSH the new screen to the top of the stack by default
    //     if (isCentralPaneName(action.payload.name) && (isTargetScreenDifferentThanCurrent || areParamsDifferent)) {
    //         // We need to push a tab if the tab doesn't match the central pane route that we are going to push.
    //         const topmostBottomTabRoute = getTopmostBottomTabRoute(rootState);
    //         const policyIDsFromState = extractPolicyIDsFromState(stateFromPath);
    //         const matchingBottomTabRoute = getMatchingBottomTabRouteForState(stateFromPath, policyID || policyIDsFromState);
    //         const isOpeningSearch = matchingBottomTabRoute.name === SCREENS.SEARCH.BOTTOM_TAB;
    //         const isNewPolicyID =
    //             ((topmostBottomTabRoute?.params as Record<string, string | undefined>)?.policyID ?? '') !==
    //             ((matchingBottomTabRoute?.params as Record<string, string | undefined>)?.policyID ?? '');

    //         if (topmostBottomTabRoute && (topmostBottomTabRoute.name !== matchingBottomTabRoute.name || isNewPolicyID || isOpeningSearch)) {
    //             root.dispatch({
    //                 type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
    //                 payload: matchingBottomTabRoute,
    //             });
    //         }

    //         if (type === CONST.NAVIGATION.TYPE.UP) {
    //             action.type = CONST.NAVIGATION.ACTION_TYPE.REPLACE;
    //         } else {
    //             action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    //         }

    //         // If we navigate to SCREENS.SEARCH.CENTRAL_PANE, it's necessary to pass the current policyID, but we have to remember that this param is called policyIDs on this page
    //         if (targetName === SCREENS.SEARCH.CENTRAL_PANE && targetParams && policyID) {
    //             (targetParams as Record<string, string | undefined>).policyIDs = policyID;
    //         }

    //         // If the type is UP, we deeplinked into one of the RHP flows and we want to replace the current screen with the previous one in the flow
    //         // and at the same time we want the back button to go to the page we were before the deeplink
    //     } else if (type === CONST.NAVIGATION.TYPE.UP) {
    //         action.type = CONST.NAVIGATION.ACTION_TYPE.REPLACE;

    //         // If this action is navigating to ModalNavigator or WorkspaceNavigator and the last route on the root navigator is not already opened Navigator then push
    //     } else if ((action.payload.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR || isSideModalNavigator(action.payload.name)) && !isTargetNavigatorOnTop) {
    //         if (isSideModalNavigator(topRouteName)) {
    //             dismissModal(navigation);
    //         }

    //         // If this RHP has mandatory central pane and bottom tab screens defined we need to push them.
    //         const {adaptedState, metainfo} = getAdaptedStateFromPath(path, linkingConfig.config);
    //         if (adaptedState && (metainfo.isCentralPaneAndBottomTabMandatory || metainfo.isWorkspaceNavigatorMandatory)) {
    //             const diff = getPartialStateDiff(rootState, adaptedState as State<RootStackParamList>, metainfo);
    //             const diffActions = getActionsFromPartialDiff(diff);
    //             for (const diffAction of diffActions) {
    //                 root.dispatch(diffAction);
    //             }
    //         }
    //         // All actions related to FullScreenNavigator on wide screen are pushed when comparing differences between rootState and adaptedState.
    //         if (action.payload.name === NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR) {
    //             return;
    //         }
    //         action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;

    //         // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //     } else if (action.payload.name === NAVIGATORS.BOTTOM_TAB_NAVIGATOR) {
    //         // If path contains a policyID, we should invoke the navigate function
    //         const shouldNavigate = !!extractedPolicyID;
    //         const actionForBottomTabNavigator = getActionForBottomTabNavigator(action, rootState, policyID, shouldNavigate);

    //         if (!actionForBottomTabNavigator) {
    //             return;
    //         }

    //         root.dispatch(actionForBottomTabNavigator);

    //         // If the layout is wide we need to push matching central pane route to the stack.
    //         if (!isNarrowLayout) {
    //             // stateFromPath should always include bottom tab navigator state, so getMatchingCentralPaneRouteForState will be always defined.
    //             // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    //             const matchingCentralPaneRoute = getMatchingCentralPaneRouteForState(stateFromPath, rootState)!;
    //             if (matchingCentralPaneRoute && 'name' in matchingCentralPaneRoute) {
    //                 root.dispatch({
    //                     type: CONST.NAVIGATION.ACTION_TYPE.PUSH,
    //                     payload: {
    //                         name: matchingCentralPaneRoute.name,
    //                         params: matchingCentralPaneRoute.params,
    //                     },
    //                 });
    //             }
    //         } else {
    //             // If the layout is small we need to pop everything from the central pane so the bottom tab navigator is visible.
    //             root.dispatch({
    //                 type: 'POP_TO_TOP',
    //                 target: rootState.key,
    //             });
    //         }
    //         return;
    //     }
    // }

    // if (action && 'payload' in action && action.payload && 'name' in action.payload && isSideModalNavigator(action.payload.name)) {
    //     // Information about the state may be in the params.
    //     const currentFocusedRoute = findFocusedRoute(extrapolateStateFromParams(rootState));
    //     const targetFocusedRoute = findFocusedRoute(stateFromPath);

    //     // If the current focused route is the same as the target focused route, we don't want to navigate.
    //     if (
    //         currentFocusedRoute?.name === targetFocusedRoute?.name &&
    //         shallowCompare(currentFocusedRoute?.params as Record<string, string | undefined>, targetFocusedRoute?.params as Record<string, string | undefined>)
    //     ) {
    //         return;
    //     }

    //     const minimalAction = getMinimalAction(action, navigation.getRootState());
    //     if (minimalAction) {
    //         // There are situations where a route already exists on the current navigation stack
    //         // But we want to push the same route instead of going back in the stack
    //         // Which would break the user navigation history
    //         if (!isActiveRoute && type === CONST.NAVIGATION.ACTION_TYPE.PUSH) {
    //             minimalAction.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    //         }
    //         root.dispatch(minimalAction);
    //         return;
    //     }
    // }

    // // When we navigate from the ReportScreen opened in RHP, this page shouldn't be removed from the navigation state to allow users to go back to it.
    // if (isReportInRhpOpened && action) {
    //     action.type = CONST.NAVIGATION.ACTION_TYPE.PUSH;
    // }

    // if (action !== undefined) {
    //     root.dispatch(action);
    // } else {
    //     root.reset(stateFromPath);
    // }
}
