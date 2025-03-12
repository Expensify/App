import type {EventArg, NavigationContainerEventMap} from '@react-navigation/native';
import type {OnyxEntry} from 'react-native-onyx';
import type {NavigationPartialRoute, NavigationRef, NavigationRoute, SplitNavigatorBySidebar, SplitNavigatorSidebarScreen, State} from '@libs/Navigation/types';
import type {LinkToOptions} from '@navigation/helpers/linkTo/types';
import type {HybridAppRoute, Route} from '@src/ROUTES';
import type {Report} from '@src/types/onyx';

type GoBackOptions = {
    /**
     * If we should compare params when searching for a route in state to go up to.
     * There are situations where we want to compare params when going up e.g. goUp to a specific report.
     * Sometimes we want to go up and update params of screen e.g. country picker.
     * In that case we want to goUp to a country picker with any params so we don't compare them.
     */
    compareParams?: boolean;

    /**
     * Specifies whether goBack should pop to top when invoked.
     * Additionaly, to execute popToTop, set the value of the global variable ShouldPopAllStateOnUP to true using the setShouldPopAllStateOnUP function.
     */
    shouldPopToTop?: boolean;
};

type NavigateToReportWithPolicyCheckPayload = {report?: OnyxEntry<Report>; reportID?: string; reportActionID?: string; referrer?: string; policyIDToCheck?: string};

type Navigation = {
    setShouldPopAllStateOnUP: (shouldPopAllStateFlag: boolean) => void;
    navigate: (route: Route, options?: LinkToOptions) => void;
    setParams: (params: Record<string, unknown>, routeKey?: string) => void;
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
export type {GoBackOptions, NavigateToReportWithPolicyCheckPayload};
