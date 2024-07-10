import {findFocusedRoute, useNavigationState} from '@react-navigation/native';
import type {PublicScreensParamList, RootStackParamList} from '@libs/Navigation/types';
import SCREENS from '@src/SCREENS';

export default function useExitTo() {
    const activeRouteParams = useNavigationState<RootStackParamList, PublicScreensParamList[typeof SCREENS.TRANSITION_BETWEEN_APPS] | undefined>((state) => {
        const focusedRoute = findFocusedRoute(state);

        if (focusedRoute?.name !== SCREENS.TRANSITION_BETWEEN_APPS) {
            return undefined;
        }

        return focusedRoute?.params as PublicScreensParamList[typeof SCREENS.TRANSITION_BETWEEN_APPS];
    });

    return activeRouteParams?.exitTo;
}
