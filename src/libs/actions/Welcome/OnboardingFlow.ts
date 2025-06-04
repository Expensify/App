import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {navigationRef} from '@libs/Navigation/Navigation';
import type {RootNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type Onboarding from '@src/types/onyx/Onboarding';

let onboardingInitialPath = '';
const onboardingLastVisitedPathConnection = Onyx.connect({
    key: ONYXKEYS.ONBOARDING_LAST_VISITED_PATH,
    callback: (value) => {
        if (value === undefined) {
            return;
        }
        onboardingInitialPath = value;
        Onyx.disconnect(onboardingLastVisitedPathConnection);
    },
});

let onboardingValues: Onboarding;
Onyx.connect({
    key: ONYXKEYS.NVP_ONBOARDING,
    callback: (value) => {
        if (value === undefined) {
            return;
        }
        onboardingValues = value;
    },
});

type GetOnboardingInitialPathParamsType = {
    isUserFromPublicDomain: boolean;
    hasAccessiblePolicies: boolean;
    onboardingValuesParam?: Onboarding;
};

/**
 * Start a new onboarding flow or continue from the last visited onboarding page.
 */
function startOnboardingFlow(startOnboardingFlowParams: GetOnboardingInitialPathParamsType) {
    const currentRoute = navigationRef.getCurrentRoute();
    const adaptedState = getAdaptedStateFromPath(getOnboardingInitialPath(startOnboardingFlowParams), linkingConfig.config, false);
    const focusedRoute = findFocusedRoute(adaptedState as PartialState<NavigationState<RootNavigatorParamList>>);
    if (focusedRoute?.name === currentRoute?.name) {
        return;
    }
    navigationRef.resetRoot({
        ...navigationRef.getRootState(),
        ...adaptedState,
        stale: true,
    } as PartialState<NavigationState>);
}

function getOnboardingInitialPath(getOnboardingInitialPathParams: GetOnboardingInitialPathParamsType): string {
    const {isUserFromPublicDomain, hasAccessiblePolicies, onboardingValuesParam} = getOnboardingInitialPathParams;
    const state = getStateFromPath(onboardingInitialPath, linkingConfig.config);
    const currentOnboardingValues = onboardingValuesParam ?? onboardingValues;
    const isVsb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const isIndividual = currentOnboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL;

    if (isVsb) {
        Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        Onyx.set(ONYXKEYS.ONBOARDING_COMPANY_SIZE, CONST.ONBOARDING_COMPANY_SIZE.MICRO);
    }
    if (isSmb) {
        Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
    }

    if (isIndividual) {
        Onyx.set(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES, [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND, CONST.ONBOARDING_CHOICES.EMPLOYER, CONST.ONBOARDING_CHOICES.CHAT_SPLIT]);
    }
    if (isUserFromPublicDomain && !onboardingValuesParam?.isMergeAccountStepCompleted) {
        return `/${ROUTES.ONBOARDING_WORK_EMAIL.route}`;
    }

    if (!isUserFromPublicDomain && hasAccessiblePolicies) {
        return `/${ROUTES.ONBOARDING_PERSONAL_DETAILS.route}`;
    }

    if (isVsb) {
        return `/${ROUTES.ONBOARDING_ACCOUNTING.route}`;
    }
    if (isSmb) {
        return `/${ROUTES.ONBOARDING_EMPLOYEES.route}`;
    }

    if (state?.routes?.at(-1)?.name !== NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR) {
        return `/${ROUTES.ONBOARDING_ROOT.route}`;
    }

    return onboardingInitialPath;
}

function clearInitialPath() {
    onboardingInitialPath = '';
}

export {getOnboardingInitialPath, startOnboardingFlow, clearInitialPath};
