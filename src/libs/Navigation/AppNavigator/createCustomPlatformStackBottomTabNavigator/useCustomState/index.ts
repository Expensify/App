import type {CustomStateHookProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {NavigationStateRoute} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

function useCustomState({state}: CustomStateHookProps) {
    const routesToRender = [state.routes.at(-1)] as NavigationStateRoute[];

    // We need to render at least one HOME screen to make sure everything load properly. This may be not necessary after changing how IS_SIDEBAR_LOADED is handled.
    // Currently this value will be switched only after the first HOME screen is rendered.
    if (routesToRender.at(0)?.name !== SCREENS.HOME) {
        const routeToRender = state.routes.find((route) => route.name === SCREENS.HOME);
        if (routeToRender) {
            routesToRender.unshift(routeToRender);
        }
    }

    return {stateToRender: {...state, routes: routesToRender, index: routesToRender.length - 1}};
}

export default useCustomState;
