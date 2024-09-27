import SCREENS from '@src/SCREENS';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import {navigationRef} from './Navigation';
import type {RootStackParamList, State} from './types';

const isSearchTopmostCentralPane = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootStackParamList>;

    if (!rootState) {
        return false;
    }

    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);

    if (topmostCentralPaneRoute?.name === SCREENS.SEARCH.CENTRAL_PANE) {
        return true;
    }

    return false;
};

export default isSearchTopmostCentralPane;
