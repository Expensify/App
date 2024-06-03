import type {InitialState} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import SCREENS from '@src/SCREENS';

function extractPolicyIDsFromState(state: InitialState) {
    const focusedRoute = findFocusedRoute(state);
    if (focusedRoute && focusedRoute.name === SCREENS.SEARCH.CENTRAL_PANE && focusedRoute.params && 'policyIDs' in focusedRoute.params) {
        return focusedRoute.params.policyIDs as string;
    }
    return undefined;
}

export default extractPolicyIDsFromState;
