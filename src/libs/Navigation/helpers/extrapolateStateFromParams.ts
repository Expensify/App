import type {InitialState} from '@react-navigation/native';

/**
 * It's possible that information from params about which screen we want to open is not in the state yet.
 * In that case this function will state with information from params.
 * This will help us with comparing one state to another.
 * e.g. making sure that we are not navigating to the same screen twice.
 * @param state - react-navigation state
 */
function extrapolateStateFromParams(state: InitialState) {
    let current: InitialState | undefined = state;

    while (current?.routes != null) {
        const topRoute: InitialState['routes'][0] = current.routes[current.index ?? 0];
        const params = topRoute?.params;
        if (topRoute.state != null) {
            current = topRoute.state;
        } else if (params != null && 'screen' in params && typeof params.screen === 'string') {
            // eslint-disable-next-line @typescript-eslint/ban-types
            topRoute.state = {routes: [{name: params.screen, params: 'params' in params ? (params.params as object) : undefined}]};
            current = topRoute.state;
        } else {
            break;
        }
    }

    return state;
}

export default extrapolateStateFromParams;
