import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {findFocusedRoute, getPathFromState, StackActions, StackRouter} from '@react-navigation/native';
import type {ParamListBase} from '@react-navigation/routers';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import isSideModalNavigator from '@libs/Navigation/isSideModalNavigator';
import linkingConfig from '@libs/Navigation/linkingConfig';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import {isOnboardingFlowName} from '@libs/NavigationUtils';
import * as SearchUtils from '@libs/SearchUtils';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {ResponsiveStackNavigatorRouterOptions} from './types';

const MODAL_ROUTES_TO_DISMISS: string[] = [
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS.LEFT_MODAL_NAVIGATOR,
    NAVIGATORS.RIGHT_MODAL_NAVIGATOR,
    NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR,
    NAVIGATORS.FEATURE_TRANING_MODAL_NAVIGATOR,
    SCREENS.NOT_FOUND,
    SCREENS.ATTACHMENTS,
    SCREENS.TRANSACTION_RECEIPT,
    SCREENS.PROFILE_AVATAR,
    SCREENS.WORKSPACE_AVATAR,
    SCREENS.REPORT_AVATAR,
    SCREENS.CONCIERGE,
];

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
        // @TODO is it working? Maybe we should split it for platforms.
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

type CustomRootStackActionType =
    | {
          type: 'SWITCH_POLICY_ID';
          payload: {
              policyID: string;
          };
      }
    | {type: 'DISMISS_MODAL'};

function CustomRouter(options: ResponsiveStackNavigatorRouterOptions) {
    const stackRouter = StackRouter(options);
    const {setActiveWorkspaceID} = useActiveWorkspace();

    // @TODO: Make sure that everything works fine without compareAndAdaptState function
    return {
        ...stackRouter,
        getStateForAction(state: StackNavigationState<ParamListBase>, action: CommonActions.Action | StackActionType | CustomRootStackActionType, configOptions: RouterConfigOptions) {
            if (action.type === CONST.NAVIGATION.ACTION_TYPE.SWITCH_POLICY_ID) {
                const lastRoute = state.routes.at(-1);
                if (lastRoute?.name === SCREENS.SEARCH.CENTRAL_PANE) {
                    const currentParams = lastRoute.params as RootStackParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
                    const queryJSON = SearchUtils.buildSearchQueryJSON(currentParams.q);
                    if (!queryJSON) {
                        return null;
                    }

                    if (action.payload.policyID) {
                        queryJSON.policyID = action.payload.policyID;
                    } else {
                        delete queryJSON.policyID;
                    }

                    const newAction = StackActions.push(SCREENS.SEARCH.CENTRAL_PANE, {
                        ...currentParams,
                        q: SearchUtils.buildSearchQueryString(queryJSON),
                    });

                    setActiveWorkspaceID(action.payload.policyID);
                    return stackRouter.getStateForAction(state, newAction, configOptions);
                }
                if (lastRoute?.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                    const newAction = StackActions.push(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, {policyID: action.payload.policyID});

                    setActiveWorkspaceID(action.payload.policyID);
                    return stackRouter.getStateForAction(state, newAction, configOptions);
                }
                // We don't have other navigators that should handle switch policy action.
                return null;
            }

            if (action.type === 'DISMISS_MODAL') {
                const lastRoute = state.routes.at(-1);
                const newAction = StackActions.pop();

                if (!lastRoute?.name || !MODAL_ROUTES_TO_DISMISS.includes(lastRoute?.name)) {
                    Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
                    return;
                }

                return stackRouter.getStateForAction(state, newAction, configOptions);
            }

            // Don't let the user navigate back to a non-onboarding screen if they are currently on an onboarding screen and it's not finished.
            if (shouldPreventReset(state, action)) {
                return state;
            }

            if (action.type === 'PUSH' && action.payload.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
                const haveParamsPolicyID = action.payload.params && 'policyID' in action.payload.params;
                let policyID;

                if (haveParamsPolicyID) {
                    policyID = (action.payload.params as Record<string, string | undefined>)?.policyID;
                    setActiveWorkspaceID(policyID);
                } else {
                    policyID = getPolicyIDFromState(state as State<RootStackParamList>);
                }

                const modifiedAction = {
                    ...action,
                    payload: {
                        ...action.payload,
                        params: {
                            ...action.payload.params,
                            policyID,
                        },
                    },
                };

                return stackRouter.getStateForAction(state, modifiedAction, configOptions);
            }

            if (action.type === 'PUSH' && action.payload.name === SCREENS.SEARCH.CENTRAL_PANE) {
                const policyID = getPolicyIDFromState(state as State<RootStackParamList>);
                const currentParams = action.payload.params as RootStackParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
                const queryJSON = SearchUtils.buildSearchQueryJSON(currentParams.q);

                if (!queryJSON) {
                    return null;
                }

                if (policyID) {
                    queryJSON.policyID = policyID;
                } else {
                    delete queryJSON.policyID;
                }

                const modifiedAction = {
                    ...action,
                    payload: {
                        ...action.payload,
                        params: {
                            ...action.payload.params,
                            q: SearchUtils.buildSearchQueryString(queryJSON),
                        },
                    },
                };

                return stackRouter.getStateForAction(state, modifiedAction, configOptions);
            }

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
