import {isRecord} from '@libs/ObjectUtils';

import type {NavigationState, PartialState} from '@react-navigation/native';

/** Whether an unknown value, such as a RESET payload or a route's nested state, is a navigation state with routes to look through */
function isNavigationStateWithRoutes(state: unknown): state is PartialState<NavigationState> {
    return isRecord(state) && Array.isArray(state.routes);
}

export default isNavigationStateWithRoutes;
