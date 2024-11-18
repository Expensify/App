import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import type {RootStackParamList} from '@libs/Navigation/types';
import {shallowCompare} from '@libs/ObjectUtils';

// Compare this and next state to determine if focused route names and params are equal.
function areNamesAndParamsEqual(currentState: NavigationState<RootStackParamList>, stateFromPath: PartialState<NavigationState<RootStackParamList>>) {
    const currentFocusedRoute = findFocusedRoute(currentState);
    const targetFocusedRoute = findFocusedRoute(stateFromPath);

    const areNamesEqual = currentFocusedRoute?.name === targetFocusedRoute?.name;
    const areParamsEqual = shallowCompare(currentFocusedRoute?.params as Record<string, unknown> | undefined, targetFocusedRoute?.params as Record<string, unknown> | undefined);

    return areNamesEqual && areParamsEqual;
}
export default areNamesAndParamsEqual;
