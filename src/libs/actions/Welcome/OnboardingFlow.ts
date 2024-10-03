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
import Onboarding from '@src/types/onyx/Onboarding';

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
        if (value !== undefined) {
            onboardingValues = value as Onboarding;
        }
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
    if (currentRoute?.name === SCREENS.ONBOARDING.PERSONAL_DETAILS && selectedPurpose === CONST.ONBOARDING_CHOICES.MANAGE_TEAM) {
        adaptedOnboardingModalNavigatorState = {
            index: 2,
            routes: [
                {
                    name: SCREENS.ONBOARDING.PURPOSE,
                    params: currentRoute?.params,
                },
                {
                    name: SCREENS.ONBOARDING.WORK,
                    params: currentRoute?.params,
                },
                {...currentRoute},
            ],
        } as Readonly<PartialState<NavigationState>>;
    } else {
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
function startOnboardingFlow() {
    const currentRoute = navigationRef.getCurrentRoute();
    const {adaptedState} = getAdaptedStateFromPath(getOnboardingInitialPath(), linkingConfig.config, false);
    const focusedRoute = findFocusedRoute(adaptedState as PartialState<NavigationState<RootStackParamList>>);
    if (focusedRoute?.name === currentRoute?.name) {
        return;
    }
    navigationRef.resetRoot(adaptedState);
}

function getOnboardingInitialPath(): string {
    const state = getStateFromPath(onboardingInitialPath, linkingConfig.config);
    const showBusinessModal = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;

    if (showBusinessModal) {
        return `/${ROUTES.ONBOARDING_WORK.route}`;
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
