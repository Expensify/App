import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {findFocusedRoute, getPathFromState, StackRouter} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import * as Localize from '@libs/Localize';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import isSideModalNavigator from '@libs/Navigation/isSideModalNavigator';
import linkingConfig from '@libs/Navigation/linkingConfig';
import createSplitNavigator from '@libs/Navigation/linkingConfig/createSplitNavigator';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {isOnboardingFlowName} from '@libs/NavigationUtils';
import * as SearchUtils from '@libs/SearchUtils';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {ResponsiveStackNavigatorRouterOptions} from './types';

function shouldPreventReset(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType) {
    if (action.type !== CONST.NAVIGATION_ACTIONS.RESET || !action?.payload) {
        return false;
    }
    const currentFocusedRoute = findFocusedRoute(state);
    const targetFocusedRoute = findFocusedRoute(action?.payload);

    // We want to prevent the user from navigating back to a non-onboarding screen if they are currently on an onboarding screen
    if (isOnboardingFlowName(currentFocusedRoute?.name) && !isOnboardingFlowName(targetFocusedRoute?.name)) {
        Welcome.setOnboardingErrorMessage(Localize.translateLocal('onboarding.purpose.errorBackButton'));
        // We reset the URL as the browser sets it in a way that doesn't match the navigation state
        // eslint-disable-next-line no-restricted-globals
        history.replaceState({}, '', getPathFromState(state, linkingConfig.config));
        return true;
    }
}

function shouldDismissSideModalNavigator(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType) {
    if (action.type !== CONST.NAVIGATION.ACTION_TYPE.PUSH) {
        return false;
    }

    const lastRoute = state.routes.at(-1);

    // If the last route is a side modal navigator and the generated minimal action want's to push a new side modal navigator that means they are different ones.
    // We want to dismiss the one that is currently on the top.
    if (isSideModalNavigator(lastRoute?.name) && isSideModalNavigator(action.payload.name)) {
        return true;
    }

    return false;
}

const SCREENS_WITH_WORKSPACE_SWITCHER: string[] = [SCREENS.SEARCH.CENTRAL_PANE, NAVIGATORS.REPORTS_SPLIT_NAVIGATOR];

// function isPushingScreenWithWorkspaceSwitcher(action: CommonActions.Action | StackActionType): action is StackActionType | {type: 'PUSH'; payload: any} {
//     if (action.type !== CONST.NAVIGATION.ACTION_TYPE.PUSH) {
//         return false;
//     }

//     // Only these screens have the workspace switcher.
//     if (SCREENS_WITH_WORKSPACE_SWITCHER.includes(action.payload.name)) {
//         return true;
//     }

//     return false;
// }

// eslint-disable-next-line rulesdir/no-inline-named-export
type CustomRootStackActionType = {
    type: 'SWITCH_POLICY_ID';
    payload: {policyID: string};
};

// function extractPolicyIDFromState(state: StackNavigationState<ParamListBase>) {
//     for (let i = state.routes.length - 1; i >= 0; i--) {
//         const route = state.routes[i];
//         if (route.name === SCREENS.SEARCH.CENTRAL_PANE) {
//             return extractPolicyIDFromQuery(route as NavigationPartialRoute);
//         }
//         if (route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
//             const params = route.params ? (route.params as RootStackParamList[typeof NAVIGATORS.REPORTS_SPLIT_NAVIGATOR]) : undefined;
//             return params?.policyID;
//         }
//     }
// }

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);

    // @TODO: Make sure that everything works fine without compareAndAdaptState function
    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType | CustomRootStackActionType, configOptions: RouterConfigOptions) {
            // TODO: Put this into const;
            if (action.type === 'SWITCH_POLICY_ID') {
                const lastRoute = state.routes.at(-1);
                if (lastRoute?.name === SCREENS.SEARCH.CENTRAL_PANE) {
                    const currentParams = lastRoute.params as RootStackParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
                    const queryJSON = SearchUtils.buildSearchQueryJSON(currentParams.q);
                    let newParams = null;

                    if (!queryJSON) {
                        return;
                    }

                    if (action.payload.policyID) {
                        queryJSON.policyID = action.payload.policyID;
                    } else {
                        delete queryJSON.policyID;
                    }

                    newParams = {...currentParams, q: SearchUtils.buildSearchQueryString(queryJSON)};
                    const newRoutes = [...state.routes, {...lastRoute, params: newParams}];
                    return {...state, routes: newRoutes, index: newRoutes.length - 1};
                }
                if (lastRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                    // TODO: handle change policy id of reports navigator.

                    const splitNavigatorMainScreen = getIsNarrowLayout() ? undefined : {name: SCREENS.REPORT, params: {reportID: ''}};

                    const newRoute = createSplitNavigator(
                        {
                            name: SCREENS.HOME,
                        },
                        splitNavigatorMainScreen,
                        {
                            policyID: action.payload.policyID,
                        },
                    );
                    const newRoutes = [...state.routes, newRoute];
                    return {...state, stale: true, routes: newRoutes, index: newRoutes.length - 1};
                }
                // In other cases, do nothing.
                return null;
            }

            // Don't let the user navigate back to a non-onboarding screen if they are currently on an onboarding screen and it's not finished.
            if (shouldPreventReset(state, action)) {
                return state;
            }

            if (action.type === 'PUSH' && action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                const policyID = getPolicyIDFromState(state as State<RootStackParamList>);
                const currentParams = {...action.payload.params};
                action.payload.params = {...currentParams, policyID};
            }

            if (action.type === 'PUSH' && action.payload.name === SCREENS.SEARCH.CENTRAL_PANE) {
                const policyID = getPolicyIDFromState(state as State<RootStackParamList>);
                const currentParams = action.payload.params as RootStackParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
                const queryJSON = SearchUtils.buildSearchQueryJSON(currentParams.q);
                if (!queryJSON) {
                    return;
                }
                if (policyID) {
                    queryJSON.policyID = policyID;
                } else {
                    delete queryJSON.policyID;
                }

                action.payload.params = {q: SearchUtils.buildSearchQueryString(queryJSON), isCustomQuery: false};
            }

            // TODO: I don't remember if the code below makes sense Wojtek :D but it's possible.
            // One part seems redundant to the lines 102-108 above
            //
            // Copy existing policyID to the new screen.
            // TODO: Can't figure out the types for
            // if (action.type === 'PUSH' && isPushingScreenWithWorkspaceSwitcher(action)) {
            //     const policyID = extractPolicyIDFromState(state);

            //     // If there is no policyID, continue with the default behavior.
            //     if (!policyID) {
            //         return stackRouter.getStateForAction(state, action, configOptions);
            //     }

            //     // If there is, we need to add it to the new screen.
            //     //
            //     const modifiedAction = {...action};

            //     if (action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
            //         modifiedAction.payload.params = {...action.payload.params, policyID};
            //     }

            //     if (action.payload.name === SCREENS.SEARCH.CENTRAL_PANE) {
            //         if (policyID) {
            //             const queryJSON = SearchUtils.buildSearchQueryJSON(params.q);
            //             if (queryJSON) {
            //                 queryJSON.policyID = policyID;
            //                 params.q = SearchUtils.buildSearchQueryString(queryJSON);
            //             }
            //         } else {
            //             const queryJSON = SearchUtils.buildSearchQueryJSON(params.q);
            //             if (queryJSON) {
            //                 delete queryJSON.policyID;
            //                 params.q = SearchUtils.buildSearchQueryString(queryJSON);
            //             }
            //         }
            //         action.payload.params = {...action.payload.params, policyID: extractPolicyIDFromState(state)};
            //     }

            //     // This shouldn't happen, but if it does, we don't want to break the app.
            //     console.error('Unhandled screen with workspace switcher:', action.payload.name);
            //     return;
            // }

            if (shouldDismissSideModalNavigator(state, action)) {
                const modifiedState = {...state, routes: state.routes.slice(0, -1), index: state.index !== 0 ? state.index - 1 : 0};
                return stackRouter.getStateForAction(modifiedState, action, configOptions);
            }

            return stackRouter.getStateForAction(state, action, configOptions);
        },
    };
}

export default CustomRouter;
export type {CustomRootStackActionType};
