/* eslint-disable @typescript-eslint/naming-convention */
import {findFocusedRoute} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/native';
import type {RootStackParamList} from '@libs/Navigation/types';

function replacePathInNestedState(state: PartialState<NavigationState<RootStackParamList>>, path: string) {
    const found = findFocusedRoute(state);
    if (!found) {
        return;
    }

    // @ts-expect-error Updating read only property
    found.path = path;
}
export default replacePathInNestedState;
