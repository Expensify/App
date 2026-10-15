import type {NavigationState} from '@react-navigation/native';

/** Narrows an unknown action payload to a navigation state with routes. */
function isNavigationStatePayload(payload: unknown): payload is NavigationState {
    return !!payload && typeof payload === 'object' && 'routes' in payload && Array.isArray(payload.routes);
}

export default isNavigationStatePayload;
