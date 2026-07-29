import type {RootNavigatorParamList} from '@libs/Navigation/types';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';

function replacePathInNestedState(state: PartialState<NavigationState<RootNavigatorParamList>>, path: string) {
    const found = findFocusedRoute(state);
    if (!found) {
        return;
    }

    found.path = path;
}
export default replacePathInNestedState;
