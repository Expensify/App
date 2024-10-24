import type {NavigationState, PartialState} from '@react-navigation/native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';

let selectedPurpose: string | undefined = '';
Onyx.connect({
    key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    callback: (value) => {
        selectedPurpose = value;
    },
});

export default function getOnboardingAdaptedState(state: PartialState<NavigationState>): PartialState<NavigationState> {
    const onboardingRoute = state.routes[0];
    if (onboardingRoute.name === SCREENS.ONBOARDING.PURPOSE) {
        return state;
    }

    const routes = [];
    if (onboardingRoute.name === SCREENS.ONBOARDING.ACCOUNTING) {
        routes.push({name: SCREENS.ONBOARDING.PURPOSE});
        routes.push({name: SCREENS.ONBOARDING.EMPLOYEES});
        routes.push(onboardingRoute);
    } else {
        routes.push({name: SCREENS.ONBOARDING.PURPOSE});
        routes.push(onboardingRoute);
    }

    return {
        routes,
        index: routes.length - 1,
    };
}
