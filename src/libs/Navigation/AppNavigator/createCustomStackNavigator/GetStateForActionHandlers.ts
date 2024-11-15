import type {CommonActions, RouterConfigOptions, StackActionType, StackNavigationState} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import type {ParamListBase, Router} from '@react-navigation/routers';
import Log from '@libs/Log';
import getPolicyIDFromState from '@libs/Navigation/getPolicyIDFromState';
import type {RootStackParamList, State} from '@libs/Navigation/types';
import * as SearchQueryUtils from '@libs/SearchQueryUtils';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';
import type {DismissModalActionType, PushActionType, SwitchPolicyIdActionType} from './types';

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

function handleSwitchPolicyID(
    state: StackNavigationState<ParamListBase>,
    action: SwitchPolicyIdActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
    const lastRoute = state.routes.at(-1);
    if (lastRoute?.name === SCREENS.SEARCH.CENTRAL_PANE) {
        const currentParams = lastRoute.params as RootStackParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
        const queryJSON = SearchQueryUtils.buildSearchQueryJSON(currentParams.q);
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
            q: SearchQueryUtils.buildSearchQueryString(queryJSON),
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

function handlePushReportAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
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

function handlePushSearchPageAction(
    state: StackNavigationState<ParamListBase>,
    action: PushActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
    setActiveWorkspaceID: (workspaceID: string | undefined) => void,
) {
    const currentParams = action.payload.params as RootStackParamList[typeof SCREENS.SEARCH.CENTRAL_PANE];
    const queryJSON = SearchQueryUtils.buildSearchQueryJSON(currentParams.q);

    if (!queryJSON) {
        return null;
    }

    if (!queryJSON.policyID) {
        const policyID = getPolicyIDFromState(state as State<RootStackParamList>);

        if (policyID) {
            queryJSON.policyID = policyID;
        } else {
            delete queryJSON.policyID;
        }
    } else {
        setActiveWorkspaceID(queryJSON.policyID);
    }

    const modifiedAction = {
        ...action,
        payload: {
            ...action.payload,
            params: {
                ...action.payload.params,
                q: SearchQueryUtils.buildSearchQueryString(queryJSON),
            },
        },
    };

    return stackRouter.getStateForAction(state, modifiedAction, configOptions);
}

function handleDismissModalAction(
    state: StackNavigationState<ParamListBase>,
    action: DismissModalActionType,
    configOptions: RouterConfigOptions,
    stackRouter: Router<StackNavigationState<ParamListBase>, CommonActions.Action | StackActionType>,
) {
    const lastRoute = state.routes.at(-1);
    const newAction = StackActions.pop();
    action;
    if (!lastRoute?.name || !MODAL_ROUTES_TO_DISMISS.includes(lastRoute?.name)) {
        Log.hmmm('[Navigation] dismissModal failed because there is no modal stack to dismiss');
        return null;
    }

    return stackRouter.getStateForAction(state, newAction, configOptions);
}

export {handleDismissModalAction, handlePushReportAction, handlePushSearchPageAction, handleSwitchPolicyID};
