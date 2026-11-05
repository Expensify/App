import type {NavigationState, PartialState} from '@react-navigation/native';

/** Narrows an unknown action payload to a reconstructed navigation state with routes. */
function isNavigationStatePayload(payload: unknown): payload is PartialState<NavigationState> {
    return !!payload && typeof payload === 'object' && 'routes' in payload && Array.isArray(payload.routes);
}

export default isNavigationStatePayload;
