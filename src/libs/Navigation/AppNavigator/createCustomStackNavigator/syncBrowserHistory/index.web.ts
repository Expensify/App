import type {ParamListBase, StackNavigationState} from '@react-navigation/native';
import {getPathFromState} from '@react-navigation/native';
import linkingConfig from '@libs/Navigation/linkingConfig';

function syncBrowserHistory(state: StackNavigationState<ParamListBase>) {
    // We reset the URL as the browser sets it in a way that doesn't match the navigation state
    // eslint-disable-next-line no-restricted-globals
    history.replaceState({}, '', getPathFromState(state, linkingConfig.config));
}

export default syncBrowserHistory;
