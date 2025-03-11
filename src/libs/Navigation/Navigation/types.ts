import type {HybridAppRoute, Route} from '@src/ROUTES';
import type {LinkToOptions} from '@navigation/helpers/linkTo/types';
import type {OnyxEntry} from 'react-native-onyx';
import type {Report} from '@src/types/onyx';
import type {EventArg, NavigationContainerEventMap} from '@react-navigation/native';
import type {
    NavigationPartialRoute,
    NavigationRef,
    NavigationRoute, SplitNavigatorBySidebar,
    SplitNavigatorSidebarScreen,
    State
} from '@libs/Navigation/types';

type Navigation = {
    setShouldPopAllStateOnUP: (shouldPopAllStateFlag: boolean) => boolean;
    navigate: (route: Route, options?: LinkToOptions) => void;
    setParams: (params: Record<string, unknown>, routeKey = '') => void;
    dismissModal: (reportID?: string, ref?: NavigationRef) => void;
    dismissModalWithReport: (report: OnyxEntry<Report>, ref?: NavigationRef) => void;
    isActiveRoute: (routePath: Route) => boolean;
    getActiveRoute: () => string;
    getActiveRouteWithoutParams: () => string;
    getReportRHPActiveRoute: () => string;
    goBack: (backToRoute?: Route, options?: GoBackOptions) => void;
    isNavigationReady: () => Promise<void>;
    setIsNavigationReady: () => void;
    getTopmostReportId: (state: State) => string | undefined;
    getTopmostReportActionId: (state: State) => string | undefined;
    getRouteNameFromStateEvent: (event: EventArg<'state', false, NavigationContainerEventMap['state']['data']>) => string | undefined;
    waitForProtectedRoutes: () => Promise<void>;
    parseHybridAppUrl: (url: HybridAppRoute | Route) => Route;
    resetToHome: () => void;
    goBackToHome: () => void;
    closeRHPFlow: (ref: NavigationRef) => void;
    setNavigationActionToMicrotaskQueue: (navigationAction: () => void) => void;
    navigateToReportWithPolicyCheck: (payload: NavigateToReportWithPolicyCheckPayload, ref?: NavigationRef) => void;
    popToTop: () => void;
    removeScreenFromNavigationState: (screen: string) => void;
    removeScreenByKey: (key: string) => void;
    getReportRouteByID: (reportID?: string, routes?: NavigationRoute[]) => NavigationRoute | null;
    switchPolicyID: (newPolicyID: string | undefined) => void;
    replaceWithSplitNavigator: <T extends SplitNavigatorSidebarScreen>(splitNavigatorState: NavigationPartialRoute<SplitNavigatorBySidebar<T>>) => void;
};

export default Navigation;
