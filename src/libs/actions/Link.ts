import * as API from '@libs/API';
import type {GenerateSpotnanaTokenParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import asyncOpenURL from '@libs/asyncOpenURL';
import * as Environment from '@libs/Environment/Environment';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isPublicScreenRoute from '@libs/isPublicScreenRoute';
import Log from '@libs/Log';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import swapBackgroundTabForRHPTarget from '@libs/Navigation/helpers/swapBackgroundTabForRHPTarget';
import willRouteNavigateToRHP from '@libs/Navigation/helpers/willRouteNavigateToRHP';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import REPORT_LINK_ROUTE_PARAMS from '@libs/Navigation/reportLinkRouteParams';
import {getIsOffline} from '@libs/NetworkState';
import {findLastAccessedReport, getReportIDFromLink, getReportOrDraftReport, getRouteFromLink, isMoneyRequestReport} from '@libs/ReportUtils';
import shouldSkipDeepLinkNavigation from '@libs/shouldSkipDeepLinkNavigation';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import * as Url from '@libs/Url';
import addTrailingForwardSlash from '@libs/UrlUtils';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';
import type {Beta, IntroSelected, Report} from '@src/types/onyx';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {findFocusedRoute} from '@react-navigation/native';
import Onyx from 'react-native-onyx';

import {doneCheckingPublicRoom, navigateToConciergeChat, openReport} from './Report';
import {canAnonymousUserAccessRoute, isAnonymousUser, signOutAndRedirectToSignIn, waitForUserSignIn} from './Session';
import {setOnboardingErrorMessage} from './Welcome';

let currentUserEmail = '';
let currentUserAccountID = -1;
// Use connectWithoutView since this is to open an external link and doesn't affect any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        currentUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

function buildOldDotURL(url: string, shortLivedAuthToken?: string): Promise<string> {
    const hashIndex = url.lastIndexOf('#');
    const hasHashParams = hashIndex !== -1;
    const hasURLParams = url.indexOf('?') !== -1;
    let originURL = url;
    let hashParams = '';
    if (hasHashParams) {
        originURL = url.substring(0, hashIndex);
        hashParams = url.substring(hashIndex);
    }

    const authTokenParam = shortLivedAuthToken ? `authToken=${shortLivedAuthToken}` : '';
    const emailParam = `email=${encodeURIComponent(currentUserEmail)}`;
    const paramsArray = [authTokenParam, emailParam];
    const params = paramsArray.filter(Boolean).join('&');

    return Environment.getOldDotEnvironmentURL().then((environmentURL) => {
        const oldDotDomain = addTrailingForwardSlash(environmentURL);

        // If the URL contains # or ?, we can assume they don't need to have the `?` token to start listing url parameters.
        return `${oldDotDomain}${originURL}${hasURLParams ? '&' : '?'}${params}${hashParams}`;
    });
}

/**
 * @param shouldSkipCustomSafariLogic When true, we will use `Linking.openURL` even if the browser is Safari.
 */
function openExternalLink(url: string, shouldSkipCustomSafariLogic = false, shouldOpenInSameTab = false) {
    asyncOpenURL(Promise.resolve(), url, shouldSkipCustomSafariLogic, shouldOpenInSameTab);
}

function openOldDotLink(url: string, shouldOpenInSameTab = false) {
    if (getIsOffline()) {
        buildOldDotURL(url).then((oldDotURL) => openExternalLink(oldDotURL, undefined, shouldOpenInSameTab));
        return;
    }

    // If shortLivedAuthToken is not accessible, fallback to opening the link without the token.
    asyncOpenURL(
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, {}, {})
            .then((response) => (response ? buildOldDotURL(url, response.shortLivedAuthToken) : buildOldDotURL(url)))
            .catch(() => buildOldDotURL(url)),
        (oldDotURL) => oldDotURL,
        undefined,
        shouldOpenInSameTab,
    );
}

function buildTravelDotURL(spotnanaToken: string, isTestAccount: boolean, postLoginPath?: string): string {
    const environmentURL = isTestAccount ? CONST.STAGING_TRAVEL_DOT_URL : CONST.TRAVEL_DOT_URL;
    const tmcID = isTestAccount ? CONST.STAGING_SPOTNANA_TMC_ID : CONST.SPOTNANA_TMC_ID;

    const authCode = `authCode=${spotnanaToken}`;
    const tmcIDParam = `tmcId=${tmcID}`;
    const redirectURL = postLoginPath ? `redirectUrl=${encodeURIComponent(Url.addLeadingForwardSlash(postLoginPath))}` : '';

    const paramsArray = [authCode, tmcIDParam, redirectURL];
    const params = paramsArray.filter(Boolean).join('&');
    const travelDotDomain = addTrailingForwardSlash(environmentURL);
    return `${travelDotDomain}auth/code?${params}`;
}

/**
 * @param postLoginPath When provided, we will redirect the user to this path post login on travelDot. eg: 'trips/:tripID'
 */
function openTravelDotLink(policyID: OnyxEntry<string>, postLoginPath?: string) {
    if (policyID === null || policyID === undefined) {
        return;
    }

    const parameters: GenerateSpotnanaTokenParams = {
        policyID,
    };

    return new Promise((resolve, reject) => {
        const error = new Error('Failed to generate spotnana token.');

        asyncOpenURL(
            // eslint-disable-next-line rulesdir/no-api-side-effects-method
            API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GENERATE_SPOTNANA_TOKEN, parameters, {})
                .then((response) => {
                    if (!response?.spotnanaToken) {
                        reject(error);
                        throw error;
                    }
                    const travelURL = buildTravelDotURL(response.spotnanaToken, response.isTestAccount ?? false, postLoginPath);
                    resolve(undefined);
                    return travelURL;
                })
                .catch(() => {
                    reject(error);
                    throw error;
                }),
            (travelDotURL) => travelDotURL ?? '',
        );
    });
}

function getInternalNewExpensifyPath(href: string) {
    if (!href) {
        return '';
    }
    const attrPath = Url.getPathFromURL(href);
    return (Url.hasSameExpensifyOrigin(href, CONST.NEW_EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONST.STAGING_NEW_EXPENSIFY_URL) || href.startsWith(CONST.DEV_NEW_EXPENSIFY_URL)) &&
        !CONST.PATHS_TO_TREAT_AS_EXTERNAL.find((path) => attrPath.startsWith(path))
        ? attrPath
        : '';
}

function getInternalExpensifyPath(href: string) {
    if (!href) {
        return '';
    }

    const attrPath = Url.getPathFromURL(href);
    const hasExpensifyOrigin = Url.hasSameExpensifyOrigin(href, CONFIG.EXPENSIFY.EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONFIG.EXPENSIFY.STAGING_API_ROOT);
    if (!hasExpensifyOrigin || attrPath.startsWith(CONFIG.EXPENSIFY.CONCIERGE_URL_PATHNAME) || attrPath.startsWith(CONFIG.EXPENSIFY.DEVPORTAL_URL_PATHNAME)) {
        return '';
    }

    return attrPath;
}

type ReportLinkRouteParams = {
    reportID: string;
    reportActionID?: string;
    route: Route;
    isLegacyNewDotReportLink?: boolean;
};

type NavigationRouteWithState = {
    key?: string;
    name?: string;
    params?: unknown;
    state?: {
        key?: string;
        index?: number;
        routes?: NavigationRouteWithState[];
    };
};

type FocusedSearchReportActionRoute = {
    routeKey: string;
    navigatorKey: string;
};

function isReportRoute(route: string): route is Route {
    return route.startsWith(addTrailingForwardSlash(ROUTES.REPORT));
}

function getReportRouteParamValues(params: unknown): {reportID: string; reportActionID?: string} | undefined {
    if (!params || typeof params !== 'object' || !('reportID' in params) || typeof params.reportID !== 'string') {
        return;
    }

    const reportActionID = 'reportActionID' in params && typeof params.reportActionID === 'string' ? params.reportActionID : undefined;
    return {reportID: params.reportID, reportActionID};
}

function getLegacyNewDotReportID(href: string, hasExpensifyOrigin: boolean): string | undefined {
    if (!hasExpensifyOrigin || !href.includes('newdotreport?reportID=')) {
        return;
    }

    try {
        return new URL(href).searchParams.get('reportID') ?? undefined;
    } catch {
        return href.split('newdotreport?reportID=').pop()?.split(/[&#]/).at(0);
    }
}

function getReportRouteParamsFromRoute(route: string): ReportLinkRouteParams | undefined {
    const normalizedRoute = route.startsWith('/') ? route.slice(1) : route;
    if (!isReportRoute(normalizedRoute)) {
        return;
    }

    const reportID = getReportIDFromLink(normalizedRoute);
    if (!reportID) {
        return;
    }

    try {
        const state = getStateFromPath(normalizedRoute);
        const focusedRoute = findFocusedRoute(state);
        if (focusedRoute?.name !== SCREENS.REPORT) {
            return;
        }

        const params = getReportRouteParamValues(focusedRoute.params);
        if (!params) {
            return;
        }

        return {
            reportID: params.reportID,
            reportActionID: params.reportActionID,
            route: normalizedRoute,
        };
    } catch {
        return undefined;
    }
}

function getReportLinkRouteParams(href: string, internalNewExpensifyPath: string, hasSameOrigin: boolean, hasExpensifyOrigin: boolean): ReportLinkRouteParams | undefined {
    const legacyNewDotReportID = getLegacyNewDotReportID(href, hasExpensifyOrigin);
    const legacyNewDotReportRouteParams: ReportLinkRouteParams | undefined = legacyNewDotReportID
        ? {
              reportID: legacyNewDotReportID,
              route: ROUTES.REPORT_WITH_ID.getRoute(legacyNewDotReportID),
              isLegacyNewDotReportLink: true,
          }
        : undefined;
    const internalNewExpensifyReportRouteParams = internalNewExpensifyPath && hasSameOrigin ? getReportRouteParamsFromRoute(internalNewExpensifyPath) : undefined;

    return legacyNewDotReportRouteParams ?? internalNewExpensifyReportRouteParams;
}

function getFocusedRoute(route: NavigationRouteWithState | undefined): NavigationRouteWithState | undefined {
    let focusedRoute = route;
    while (focusedRoute?.state?.routes?.length) {
        const {routes, index} = focusedRoute.state;
        focusedRoute = routes.at(index ?? routes.length - 1);
    }

    return focusedRoute;
}

function getFocusedCentralReportRoute(currentState: ReturnType<typeof navigationRef.getRootState>): NavigationRouteWithState | undefined {
    const rootRoutes = currentState?.routes as NavigationRouteWithState[] | undefined;
    const focusedRootIndex = currentState?.index ?? (rootRoutes?.length ?? 0) - 1;
    const focusedRootRoute = focusedRootIndex >= 0 ? rootRoutes?.at(focusedRootIndex) : undefined;
    const focusedRoute = getFocusedRoute(focusedRootRoute);
    if (focusedRoute?.name === SCREENS.REPORT) {
        return focusedRoute;
    }

    if (focusedRootRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return;
    }

    const tabNavigatorRoute = rootRoutes?.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = tabNavigatorRoute?.state;
    const activeTabRoute = tabState?.routes?.at(tabState.index ?? 0);
    if (activeTabRoute?.name !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) {
        return;
    }

    return getFocusedRoute(activeTabRoute);
}

function isFocusedCentralReport(reportID: string, currentState: ReturnType<typeof navigationRef.getRootState>): boolean {
    const focusedRoute = getFocusedCentralReportRoute(currentState);
    if (focusedRoute?.name !== SCREENS.REPORT) {
        return false;
    }

    return getReportRouteParamValues(focusedRoute.params)?.reportID === reportID;
}

function getFocusedSearchReportActionRoute(
    reportRouteParams: ReportLinkRouteParams | undefined,
    currentState: ReturnType<typeof navigationRef.getRootState>,
): FocusedSearchReportActionRoute | undefined {
    if (!reportRouteParams?.reportActionID) {
        return;
    }

    const focusedRootRoute = currentState?.routes?.at(currentState.index ?? (currentState.routes.length ? currentState.routes.length - 1 : -1)) as NavigationRouteWithState | undefined;
    if (focusedRootRoute?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
        return;
    }

    const rhpState = focusedRootRoute.state;
    const focusedRHPRoute = rhpState?.routes?.at(rhpState.index ?? (rhpState.routes.length ? rhpState.routes.length - 1 : -1));
    if (focusedRHPRoute?.name !== SCREENS.RIGHT_MODAL.SEARCH_REPORT || !focusedRHPRoute.key || !rhpState?.key) {
        return;
    }

    const focusedRHPReportParams = getReportRouteParamValues(focusedRHPRoute.params);
    if (focusedRHPReportParams?.reportID !== reportRouteParams.reportID) {
        return;
    }

    return {
        routeKey: focusedRHPRoute.key,
        navigatorKey: rhpState.key,
    };
}

function getReportLinkRoute(
    reportRouteParams: ReportLinkRouteParams | undefined,
    isNarrowLayout: boolean,
    currentState: ReturnType<typeof navigationRef.getRootState>,
    shouldKeepReportRoute = false,
): Route | undefined {
    if (!reportRouteParams) {
        return;
    }

    // On narrow layouts (e.g. mobile web) the RHP is full-screen, so preserving the background Inbox does not apply
    // and report links are kept on the standard navigation as a safeguard. Regular internal report links return
    // undefined so they fall through to the standard internal-link handling, exactly as before this feature. Legacy
    // Concierge (`newdotreport`) links have no internal path that can be parsed, so they keep the explicit report
    // route to stay on the pre-existing internal navigation instead of falling back to OldDot link handling.
    if (isNarrowLayout) {
        return reportRouteParams.isLegacyNewDotReportLink ? reportRouteParams.route : undefined;
    }

    if (shouldKeepReportRoute || isFocusedCentralReport(reportRouteParams.reportID, currentState)) {
        return reportRouteParams.route;
    }

    const backTo = Navigation.getActiveRoute();
    const report = getReportOrDraftReport(reportRouteParams.reportID);
    if (!reportRouteParams.reportActionID && isMoneyRequestReport(report)) {
        return ROUTES.EXPENSE_REPORT_RHP.getRoute({reportID: reportRouteParams.reportID, backTo});
    }

    const searchReportRoute = ROUTES.SEARCH_REPORT.getRoute({
        reportID: reportRouteParams.reportID,
        reportActionID: reportRouteParams.reportActionID,
        backTo,
    });

    if (!report && !reportRouteParams.reportActionID) {
        return Url.appendParam(searchReportRoute, REPORT_LINK_ROUTE_PARAMS.SHOULD_REPLACE_WITH_EXPENSE_REPORT_RHP, 'true');
    }

    return searchReportRoute;
}

function openLink(href: string, environmentURL: string, isAttachment = false) {
    const hasSameOrigin = Url.hasSameExpensifyOrigin(href, environmentURL);
    const hasExpensifyOrigin = Url.hasSameExpensifyOrigin(href, CONFIG.EXPENSIFY.EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONFIG.EXPENSIFY.STAGING_API_ROOT);
    const internalNewExpensifyPath = getInternalNewExpensifyPath(href);
    const internalExpensifyPath = getInternalExpensifyPath(href);

    const isNarrowLayout = getIsNarrowLayout();
    const currentState = navigationRef.getRootState();
    const reportLinkRouteParams = getReportLinkRouteParams(href, internalNewExpensifyPath, hasSameOrigin, hasExpensifyOrigin);
    const reportLinkRoute = getReportLinkRoute(reportLinkRouteParams, isNarrowLayout, currentState, isAnonymousUser());
    const focusedSearchReportActionRoute = getFocusedSearchReportActionRoute(reportLinkRouteParams, currentState);
    const routeToNavigate = reportLinkRoute ?? internalNewExpensifyPath;
    const isRHPOpen = currentState?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
    let shouldCloseRHP = false;
    if (!isNarrowLayout && isRHPOpen && !focusedSearchReportActionRoute) {
        const targetWillNavigateToRHP = willRouteNavigateToRHP(routeToNavigate as Route);
        if (!targetWillNavigateToRHP) {
            shouldCloseRHP = true;
        } else if (hasSameOrigin) {
            // Cross-tab RHP→RHP: swap the background tab in place so the RHP stays mounted and the
            // user sees only the RHP content update + the underlying tab animate, no close+reopen
            // flicker (issue: https://github.com/Expensify/App/issues/89710).
            swapBackgroundTabForRHPTarget(currentState, routeToNavigate as Route);
        }
    }

    if (reportLinkRoute) {
        if (internalNewExpensifyPath && hasSameOrigin && isAnonymousUser() && !canAnonymousUserAccessRoute(internalNewExpensifyPath)) {
            signOutAndRedirectToSignIn();
            return;
        }
        if (focusedSearchReportActionRoute && reportLinkRouteParams?.reportActionID) {
            Navigation.setParams({reportActionID: reportLinkRouteParams.reportActionID}, focusedSearchReportActionRoute.routeKey, focusedSearchReportActionRoute.navigatorKey);
            return;
        }
        if (shouldCloseRHP) {
            Navigation.closeRHPFlow();
        }
        Navigation.navigate(reportLinkRoute);
        return;
    }

    // If we are handling a New Expensify link then we will assume this should be opened by the app internally. This ensures that the links are opened internally via react-navigation
    // instead of in a new tab or with a page refresh (which is the default behavior of an anchor tag)
    if (internalNewExpensifyPath && hasSameOrigin) {
        if (isAnonymousUser() && !canAnonymousUserAccessRoute(internalNewExpensifyPath)) {
            signOutAndRedirectToSignIn();
            return;
        }
        if (shouldCloseRHP) {
            Navigation.closeRHPFlow();
        }
        Navigation.navigate(internalNewExpensifyPath as Route);
        return;
    }
    // If we are handling an old dot Expensify link we need to open it with openOldDotLink() so we can navigate to it with the user already logged in.
    // As attachments also use expensify.com we don't want it working the same as links.
    const isPublicOldDotURL = (Object.values(CONST.OLD_DOT_PUBLIC_URLS) as string[]).includes(href);
    if (internalExpensifyPath && !isAttachment && !isPublicOldDotURL) {
        openOldDotLink(internalExpensifyPath);
        return;
    }

    openExternalLink(href);
}

function openReportFromDeepLink(
    url: string,
    reports: OnyxCollection<Report>,
    isAuthenticated: boolean,
    conciergeReportID: string | undefined,
    introSelected: OnyxEntry<IntroSelected>,
    isSelfTourViewed: boolean | undefined,
    betas: OnyxEntry<Beta[]>,
) {
    const reportID = getReportIDFromLink(url);

    if (reportID && !isAuthenticated) {
        // Start span for public room API call
        startSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_API, {
            name: CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_API,
            op: CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_API,
            parentSpan: getSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_CHECK),
        });

        // Call the OpenReport command to check in the server if it's a public room. If so, we'll open it as an anonymous user
        openReport({
            reportID,
            introSelected,
            parentReportActionID: '0',
            isFromDeepLink: true,
            betas,
        });

        // Show the sign-in page if the app is offline
        if (getIsOffline()) {
            endSpan(CONST.TELEMETRY.SPAN_BOOTSPLASH.PUBLIC_ROOM_API);
            doneCheckingPublicRoom();
        }
    } else {
        // If we're not opening a public room (no reportID) or the user is authenticated, we unblock the UI (hide splash screen)
        doneCheckingPublicRoom();
    }

    let route = getRouteFromLink(url);

    // Bing search results still link to /signin when searching for “Expensify”, but the /signin route no longer exists in our repo, so we redirect it to the home page to avoid showing a Not Found page.
    if (normalizePath(route) === CONST.SIGNIN_ROUTE) {
        route = '';
    }

    // React Navigation generates /Home (capitalized) for the root URL because PublicScreens uses SCREENS.HOME ('Home')
    // at the root level without a path mapping. Treat it as empty route to avoid showing a “not found” page after sign-in.
    if (normalizePath(route) === `/${SCREENS.HOME}`) {
        route = '';
    }

    // If we are not authenticated and are navigating to a public screen, we don't want to navigate again to the screen after sign-in/sign-up
    if (!isAuthenticated && isPublicScreenRoute(route)) {
        return;
    }

    // If the route is the transition route, we don't want to navigate and start the onboarding flow
    if (route?.includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
        return;
    }

    // The Plaid OAuth redirect URI is handled by the native Plaid SDK on iOS — skip navigation to avoid showing NotFound
    if (route?.includes(CONST.PLAID.OAUTH_REDIRECT_PATH_IOS)) {
        return;
    }

    // Navigate to the report after sign-in/sign-up.
    waitForUserSignIn().then(() => {
        // `false` when the user still had to onboard as this deep link was captured (fresh sign-up, or a
        // stale react-native-web URL); honoring it after onboarding flashes the "Not here" page (#91437).
        let initialHasCompletedGuidedSetupFlow: boolean | undefined;
        // Subscribe to onboarding data using connectWithoutView to determine if user has completed the onboarding flow without affecting UI
        const connection = Onyx.connectWithoutView({
            key: ONYXKEYS.NVP_ONBOARDING,
            callback: (val) => {
                if (!val && !isAnonymousUser()) {
                    return;
                }

                // Capture once. Use the raw flag, not the selector, which returns `true` for the empty NVP a fresh sign-up briefly has.
                if (!isAuthenticated && initialHasCompletedGuidedSetupFlow === undefined && val && !isAnonymousUser()) {
                    initialHasCompletedGuidedSetupFlow = val.hasCompletedGuidedSetupFlow;
                }

                Navigation.waitForProtectedRoutes().then(() => {
                    if (route && isAnonymousUser() && !canAnonymousUserAccessRoute(route)) {
                        signOutAndRedirectToSignIn(true);
                        return;
                    }

                    // We don't want to navigate to the exitTo route when creating a new workspace from a deep link,
                    // because we already handle creating the optimistic policy and navigating to it in App.setUpPoliciesAndNavigate,
                    // which is already called when AuthScreens mounts.
                    if (!CONFIG.IS_HYBRID_APP && url && new URL(url).searchParams.get('exitTo') === ROUTES.WORKSPACE_NEW) {
                        return;
                    }

                    const handleDeeplinkNavigation = () => {
                        // We want to disconnect the connection so it won't trigger the deeplink again
                        // every time the data is changed, for example, when re-login.
                        Onyx.disconnect(connection);

                        const state = navigationRef.getRootState();
                        const currentFocusedRoute = findFocusedRoute(state);

                        if (isOnboardingFlowName(currentFocusedRoute?.name)) {
                            setOnboardingErrorMessage('onboarding.purpose.errorBackButton');
                            return;
                        }

                        if (shouldSkipDeepLinkNavigation(route)) {
                            return;
                        }

                        if (currentFocusedRoute?.name !== SCREENS.HOME && route === ROUTES.HOME) {
                            return;
                        }

                        // Drop a deep link captured before onboarding finished: navigateAfterOnboarding owns the
                        // post-onboarding destination and overrides it anyway, so honoring it only risks the flash (#91437).
                        if (initialHasCompletedGuidedSetupFlow === false) {
                            return;
                        }

                        // Navigation for signed users is handled by react-navigation.
                        if (isAuthenticated) {
                            return;
                        }

                        const navigateHandler = (reportParam?: OnyxEntry<Report>) => {
                            // Check if the report exists in the collection
                            const report = reportParam ?? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                            // If the report does not exist, navigate to the last accessed report or Concierge chat
                            if (reportID && (!report?.reportID || report.errorFields?.notFound)) {
                                // TODO: Pass guidesEmailsByReport map once callers are fully migrated — PR 33 (https://github.com/Expensify/App/issues/66413); findLastAccessedReport falls back to hasExpensifyGuidesEmails → allPersonalDetails
                                const lastAccessedReportID = findLastAccessedReport(false, undefined, shouldOpenOnAdminRoom(), reportID)?.reportID;
                                if (lastAccessedReportID) {
                                    const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
                                    Navigation.navigate(lastAccessedReportRoute, {forceReplace: Navigation.getTopmostReportId() === reportID, waitForTransition: true});
                                    return;
                                }
                                navigateToConciergeChat(conciergeReportID, introSelected, currentUserAccountID, isSelfTourViewed, betas, false, () => true);
                                return;
                            }

                            // If the last route is an RHP, we want to replace it so it won't be covered by the full-screen navigator.
                            const forceReplace = navigationRef.getRootState().routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
                            Navigation.navigate(route as Route, {forceReplace, waitForTransition: true});
                        };
                        // If we log with deeplink with reportID and data for this report is not available yet,
                        // then we will wait for Onyx to completely merge data from OpenReport API with OpenApp API in AuthScreens
                        if (reportID && !isAuthenticated && !reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID) {
                            const reportConnection = Onyx.connectWithoutView({
                                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                                // eslint-disable-next-line rulesdir/prefer-early-return
                                callback: (report) => {
                                    if (report?.errorFields?.notFound || report?.reportID || (report === undefined && CONST.REGEX.NON_NUMERIC.test(reportID))) {
                                        Onyx.disconnect(reportConnection);
                                        navigateHandler(report);
                                    }
                                },
                            });
                        } else {
                            navigateHandler();
                        }
                    };

                    if (hasCompletedGuidedSetupFlowSelector(val) || isAnonymousUser()) {
                        handleDeeplinkNavigation();
                    }
                });
            },
        });
    });
}

function getTravelDotLink(policyID: OnyxEntry<string>) {
    if (policyID === null || policyID === undefined) {
        return Promise.reject(new Error('Policy ID is required'));
    }

    const parameters: GenerateSpotnanaTokenParams = {
        policyID,
    };

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.GENERATE_SPOTNANA_TOKEN, parameters, {}).then((response) => {
        if (!response?.spotnanaToken) {
            throw new Error('Failed to generate spotnana token.');
        }
        return response;
    });
}

/**
 * Fetches a short-lived auth token and appends it to the given setup link.
 * Falls back to returning the original link if the token request fails.
 */
function getShortLivedAuthTokenURL(setupLink: string): Promise<string> {
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.OPEN_OLD_DOT_LINK, {}, {})
        .then((response) => {
            if (!response?.shortLivedAuthToken) {
                return setupLink;
            }
            return Url.appendParam(setupLink, 'authToken', response.shortLivedAuthToken);
        })
        .catch((error) => {
            Log.warn('[Link] Failed to fetch short-lived auth token', {error});
            return setupLink;
        });
}

export {
    openOldDotLink,
    openExternalLink,
    openLink,
    getInternalNewExpensifyPath,
    getInternalExpensifyPath,
    openTravelDotLink,
    buildTravelDotURL,
    getTravelDotLink,
    buildOldDotURL,
    openReportFromDeepLink,
    getShortLivedAuthTokenURL,
};
