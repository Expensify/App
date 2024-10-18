import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import linkingConfig from '@libs/Navigation/linkingConfig';
import getAdaptedStateFromPath from '@libs/Navigation/linkingConfig/getAdaptedStateFromPath';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import type {NavigationPartialRoute, RootStackParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type Onboarding from '@src/types/onyx/Onboarding';

let selectedPurpose: string | undefined = '';
Onyx.connect({
    key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    callback: (value) => {
        selectedPurpose = value;
    },
});

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
        onboardingValues = value as Onboarding;
    },
});

/**
 * Build the correct stack order for `onboardingModalNavigator`,
 * based on onboarding data (currently from the selected purpose).
 * The correct stack order will ensure that navigation and
 * the `goBack` navigatoin work properly.
 */
function adaptOnboardingRouteState() {
    const currentRoute: NavigationPartialRoute | undefined = navigationRef.getCurrentRoute();
    if (!currentRoute || currentRoute?.name === SCREENS.ONBOARDING.PURPOSE) {
        return;
    }

    const rootState = navigationRef.getRootState();
    const adaptedState = rootState;
    const lastRouteIndex = (adaptedState?.routes?.length ?? 0) - 1;
    const onBoardingModalNavigatorState = adaptedState?.routes.at(lastRouteIndex)?.state;
    if (!onBoardingModalNavigatorState || onBoardingModalNavigatorState?.routes?.length > 1 || lastRouteIndex === -1) {
        return;
    }

    let adaptedOnboardingModalNavigatorState = {} as Readonly<PartialState<NavigationState>>;
    if (currentRoute?.name === SCREENS.ONBOARDING.ACCOUNTING && selectedPurpose === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
        adaptedOnboardingModalNavigatorState = {
            index: 2,
            routes: [
                {
                    name: SCREENS.ONBOARDING.PURPOSE,
                    params: currentRoute?.params,
                },
                {
                    name: SCREENS.ONBOARDING.EMPLOYEES,
                    params: currentRoute?.params,
                },
                {...currentRoute},
            ],
        } as Readonly<PartialState<NavigationState>>;
    } // TODO change stack for isPrivateDomain && !selectedPurpose 
    else {
        adaptedOnboardingModalNavigatorState = {
            index: 1,
            routes: [
                {
                    name: SCREENS.ONBOARDING.PURPOSE,
                    params: currentRoute?.params,
                },        
                {...currentRoute},
            ],
        } as Readonly<PartialState<NavigationState>>;
    }

    const route = adaptedState.routes.at(lastRouteIndex);

    if (route) {
        route.state = adaptedOnboardingModalNavigatorState;
    }
    navigationRef.resetRoot(adaptedState);
}

/**
 * Start a new onboarding flow or continue from the last visited onboarding page.
 */
function startOnboardingFlow(isPrivateDomain?: boolean) {
    const currentRoute = navigationRef.getCurrentRoute();
    const {adaptedState} = getAdaptedStateFromPath(getOnboardingInitialPath(isPrivateDomain), linkingConfig.config, false);
    const focusedRoute = findFocusedRoute(adaptedState as PartialState<NavigationState<RootStackParamList>>);
    if (focusedRoute?.name === currentRoute?.name) {
        return;
    }
    navigationRef.resetRoot(adaptedState);
}

function getOnboardingInitialPath(isPrivateDomain?: boolean): string {
    const state = getStateFromPath(onboardingInitialPath, linkingConfig.config);
    const isVsb = onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;

    if (isVsb) {
        Onyx.set(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, CONST.ONBOARDING_CHOICES.MANAGE_TEAM);
        return `/${ROUTES.ONBOARDING_EMPLOYEES.route}`;
    }
    const isIndividual = onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.INDIVIDUAL;
    if (isPrivateDomain) {
        return `/${ROUTES.ONBOARDING_PERSONAL_DETAILS.route}`;
    }
    if (isIndividual) {
        Onyx.set(ONYXKEYS.ONBOARDING_CUSTOM_CHOICES, [CONST.ONBOARDING_CHOICES.PERSONAL_SPEND, CONST.ONBOARDING_CHOICES.EMPLOYER, CONST.ONBOARDING_CHOICES.CHAT_SPLIT]);
    }
    if (state?.routes?.at(-1)?.name !== NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR) {
        return `/${ROUTES.ONBOARDING_ROOT.route}`;
    }

    return onboardingInitialPath;
}

function clearInitialPath() {
    onboardingInitialPath = '';
}

/**
 * Onboarding flow: Go back to the previous page.
 * Since there is no `initialRoute` for `onBoardingModalNavigator`,
 * firstly, adjust the current onboarding modal navigator to establish the correct stack order.
 * Then, navigate to the previous onboarding page using the usual `goBack` function.
 */
function goBack() {
    adaptOnboardingRouteState();
    Navigation.isNavigationReady().then(() => {
        Navigation.goBack();
    });
}

export {getOnboardingInitialPath, startOnboardingFlow, clearInitialPath, goBack};
