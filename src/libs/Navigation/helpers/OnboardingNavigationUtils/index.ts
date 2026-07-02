import {StackActions} from '@react-navigation/native';
import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import navigationRef from '@libs/Navigation/navigationRef';
import NAVIGATORS from '@src/NAVIGATORS';

function dismissOnboardingModalBeforeExit() {}

function getOnboardingExitNavigationOptions(): LinkToOptions | undefined {
    return {forceReplace: true};
}

/**
 * Pops the nested OnboardingModalNavigator stack back to its first route so useLinking
 * unwinds per-step browser history entries before onboarding completes and the modal unmounts.
 */
function resetOnboardingStackToRoot() {
    if (!navigationRef.isReady()) {
        return;
    }

    const rootState = navigationRef.getRootState();
    const onboardingRoute = rootState?.routes.find((route) => route.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);
    const nestedState = onboardingRoute?.state;

    if (!nestedState?.key || nestedState.routes.length <= 1) {
        return;
    }

    const routesToPop = nestedState.routes.length - 1;
    navigationRef.dispatch({
        ...StackActions.pop(routesToPop),
        target: nestedState.key,
    });
}

export {dismissOnboardingModalBeforeExit, getOnboardingExitNavigationOptions, resetOnboardingStackToRoot};
