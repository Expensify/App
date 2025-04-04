import type {NavigationState, PartialState} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';

/**
 * When we open the application via deeplink to a specific onboarding screen, we want the previous onboarding screens to be able to go back to them.
 * Therefore, the routes of the previous screens are added here.
 */
export default function getOnboardingAdaptedState(state: PartialState<NavigationState>): PartialState<NavigationState> {
    const onboardingRoute = state.routes.at(0);
    if (!onboardingRoute || onboardingRoute.name === SCREENS.ONBOARDING.PURPOSE) {
        return state;
    }

    const routes = [];
    routes.push({name: SCREENS.ONBOARDING.PURPOSE});
    if (onboardingRoute.name === SCREENS.ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS.ONBOARDING.EMPLOYEES});
    }
    routes.push(onboardingRoute);

    return {
        routes,
        index: routes.length - 1,
    };
}
