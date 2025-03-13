import navigationRef from '@navigation/navigationRef';
import type NavigationType from './types';

const Navigation: NavigationType = {
    setShouldPopAllStateOnUP: () => false,
    navigate: () => {},
    setParams: () => {},
    dismissModal: () => {},
    dismissModalWithReport: () => {},
    isActiveRoute: () => false,
    getActiveRoute: () => '',
    getActiveRouteWithoutParams: () => '',
    getReportRHPActiveRoute: () => '',
    goBack: () => {},
    isNavigationReady: () => Promise.resolve(),
    setIsNavigationReady: () => {},
    getTopmostReportId: () => undefined,
    getRouteNameFromStateEvent: () => undefined,
    getTopmostReportActionId: () => undefined,
    waitForProtectedRoutes: () => Promise.resolve(),
    parseHybridAppUrl: () => '',
    resetToHome: () => {},
    goBackToHome: () => {},
    closeRHPFlow: () => {},
    setNavigationActionToMicrotaskQueue: () => {},
    navigateToReportWithPolicyCheck: () => {},
    popToTop: () => {},
    removeScreenFromNavigationState: () => {},
    removeScreenByKey: () => {},
    getReportRouteByID: () => null,
    switchPolicyID: () => {},
    replaceWithSplitNavigator: () => {},
};

export default Navigation;
export {navigationRef};
