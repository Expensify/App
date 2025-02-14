import SCREENS from '@src/SCREENS';
import getTopmostCentralPaneRoute from './getTopmostCentralPaneRoute';
import {navigationRef} from './Navigation';
import type {RootStackParamList, State} from './types';

const isReportScreenTopmostCentralPane = (): boolean => {
    const rootState = navigationRef.getRootState() as State<RootStackParamList>;

    if (!rootState) {
        return false;
    }

    const topmostCentralPaneRoute = getTopmostCentralPaneRoute(rootState);
    return topmostCentralPaneRoute?.name === SCREENS.REPORT;
};

export default isReportScreenTopmostCentralPane;
