import {findFocusedRoute} from '@react-navigation/native';
import {InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import * as API from '@libs/API';
import type {GenerateSpotnanaTokenParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS} from '@libs/API/types';
import asyncOpenURL from '@libs/asyncOpenURL';
import * as Environment from '@libs/Environment/Environment';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isPublicScreenRoute from '@libs/isPublicScreenRoute';
import Log from '@libs/Log';
import {isOnboardingFlowName} from '@libs/Navigation/helpers/isNavigatorName';
import normalizePath from '@libs/Navigation/helpers/normalizePath';
import shouldOpenOnAdminRoom from '@libs/Navigation/helpers/shouldOpenOnAdminRoom';
import willRouteNavigateToRHP from '@libs/Navigation/helpers/willRouteNavigateToRHP';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import type {NetworkStatus} from '@libs/NetworkConnection';
import {findLastAccessedReport, getReportIDFromLink, getRouteFromLink} from '@libs/ReportUtils';
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
import type {Account, Report} from '@src/types/onyx';
import {doneCheckingPublicRoom, navigateToConciergeChat, openReport} from './Report';
import {canAnonymousUserAccessRoute, isAnonymousUser, signOutAndRedirectToSignIn, waitForUserSignIn} from './Session';
import {isOnboardingFlowCompleted, setOnboardingErrorMessage} from './Welcome';
import {startOnboardingFlow} from './Welcome/OnboardingFlow';
import type {OnboardingCompanySize, OnboardingPurpose} from './Welcome/OnboardingFlow';

let isNetworkOffline = false;
let networkStatus: NetworkStatus;
// Use connectWithoutView since this is to open an external link and doesn't affect any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.NETWORK,
    callback: (value) => {
        isNetworkOffline = value?.isOffline ?? false;
        networkStatus = value?.networkStatus ?? CONST.NETWORK.NETWORK_STATUS.UNKNOWN;
    },
});

let currentUserEmail = '';
// Use connectWithoutView since this is to open an external link and doesn't affect any UI
Onyx.connectWithoutView({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
    },
});

let account: OnyxEntry<Account>;
// Use connectWithoutView to subscribe to account data without affecting UI
Onyx.connectWithoutView({
    key: ONYXKEYS.ACCOUNT,
    callback: (value) => {
        account = value;
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
    if (isNetworkOffline) {
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

/**
 * Normalizes a route by replacing route path variables with a generic placeholder(:id). For example /report/12345 becomes /report/:id
 */
function getNormalizedRoute(route: string) {
    const routeWithoutParams = route.split('?').at(0) ?? '';
    const segments = routeWithoutParams.split('/').filter((segment) => segment !== '');
    const normalizedSegments = segments.map((segment) => {
        // Check if segment is a number, UUID, or likely a dynamic ID and return :id for that
        if (/^[\d]+$/.test(segment) || /^[a-f0-9-]{20,}$/i.test(segment) || /^[A-Z0-9]{8,}$/i.test(segment)) {
            return ':id';
        }
        return segment;
    });

    return normalizedSegments.join('/');
}

function openLink(href: string, environmentURL: string, isAttachment = false) {
    const hasSameOrigin = Url.hasSameExpensifyOrigin(href, environmentURL);
    const hasExpensifyOrigin = Url.hasSameExpensifyOrigin(href, CONFIG.EXPENSIFY.EXPENSIFY_URL) || Url.hasSameExpensifyOrigin(href, CONFIG.EXPENSIFY.STAGING_API_ROOT);
    const internalNewExpensifyPath = getInternalNewExpensifyPath(href);
    const internalExpensifyPath = getInternalExpensifyPath(href);

    const isNarrowLayout = getIsNarrowLayout();
    const currentState = navigationRef.getRootState();
    const isRHPOpen = currentState?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
    let shouldCloseRHP = false;
    if (!isNarrowLayout && isRHPOpen) {
        const willOpenInRHP = willRouteNavigateToRHP(internalNewExpensifyPath as Route);
        const currentRoute = Navigation.getActiveRoute();
        const willOpenSameRoute = getNormalizedRoute(currentRoute) === getNormalizedRoute(internalNewExpensifyPath);
        shouldCloseRHP = !willOpenInRHP || !willOpenSameRoute;
    }

    // There can be messages from Concierge with links to specific NewDot reports. Those URLs look like this:
    // https://www.expensify.com.dev/newdotreport?reportID=3429600449838908 and they have a target="_blank" attribute. This is so that when a user is on OldDot,
    // clicking on the link will open the chat in NewDot. However, when a user is in NewDot and clicks on the concierge link, the link needs to be handled differently.
    // Normally, the link would be sent to Link.openOldDotLink() and opened in a new tab, and that's jarring to the user. Since the intention is to link to a specific NewDot chat,
    // the reportID is extracted from the URL and then opened as an internal link, taking the user straight to the chat in the same tab.
    if (hasExpensifyOrigin && href.indexOf('newdotreport?reportID=') > -1) {
        const reportID = href.split('newdotreport?reportID=').pop();
        const reportRoute = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        if (shouldCloseRHP) {
            Navigation.closeRHPFlow();
        }
        Navigation.navigate(reportRoute);
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
    currentOnboardingPurposeSelected: OnyxEntry<OnboardingPurpose>,
    currentOnboardingCompanySize: OnyxEntry<OnboardingCompanySize>,
    onboardingInitialPath: OnyxEntry<string>,
    reports: OnyxCollection<Report>,
    isAuthenticated: boolean,
    conciergeReportID: string | undefined,
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
        openReport(reportID, '', [], undefined, '0', true);

        // Show the sign-in page if the app is offline
        if (networkStatus === CONST.NETWORK.NETWORK_STATUS.OFFLINE) {
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

    // If we are not authenticated and are navigating to a public screen, we don't want to navigate again to the screen after sign-in/sign-up
    if (!isAuthenticated && isPublicScreenRoute(route)) {
        return;
    }

    // If the route is the transition route, we don't want to navigate and start the onboarding flow
    if (route?.includes(ROUTES.TRANSITION_BETWEEN_APPS)) {
        return;
    }

    // Navigate to the report after sign-in/sign-up.
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => {
        waitForUserSignIn().then(() => {
            // Subscribe to onboarding data using connectWithoutView to determine if user has completed the onboarding flow without affecting UI
            const connection = Onyx.connectWithoutView({
                key: ONYXKEYS.NVP_ONBOARDING,
                callback: (val) => {
                    if (!val && !isAnonymousUser()) {
                        return;
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

                            // Navigation for signed users is handled by react-navigation.
                            if (isAuthenticated) {
                                return;
                            }

                            const navigateHandler = (reportParam?: OnyxEntry<Report>) => {
                                // Check if the report exists in the collection
                                const report = reportParam ?? reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
                                // If the report does not exist, navigate to the last accessed report or Concierge chat
                                if (reportID && (!report?.reportID || report.errorFields?.notFound)) {
                                    const lastAccessedReportID = findLastAccessedReport(false, shouldOpenOnAdminRoom(), undefined, reportID)?.reportID;
                                    if (lastAccessedReportID) {
                                        const lastAccessedReportRoute = ROUTES.REPORT_WITH_ID.getRoute(lastAccessedReportID);
                                        Navigation.navigate(lastAccessedReportRoute, {forceReplace: Navigation.getTopmostReportId() === reportID});
                                        return;
                                    }
                                    navigateToConciergeChat(conciergeReportID, false, () => true);
                                    return;
                                }

                                // If the last route is an RHP, we want to replace it so it won't be covered by the full-screen navigator.
                                const forceReplace = navigationRef.getRootState().routes.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
                                Navigation.navigate(route as Route, {forceReplace});
                            };
                            // If we log with deeplink with reportID and data for this report is not available yet,
                            // then we will wait for Onyx to completely merge data from OpenReport API with OpenApp API in AuthScreens
                            if (
                                reportID &&
                                !isAuthenticated &&
                                (!reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`] || !reports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]?.reportID)
                            ) {
                                const reportConnection = Onyx.connectWithoutView({
                                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                                    // eslint-disable-next-line rulesdir/prefer-early-return
                                    callback: (report) => {
                                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
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

                        if (isAnonymousUser()) {
                            handleDeeplinkNavigation();
                            return;
                        }
                        // We need skip deeplinking if the user hasn't completed the guided setup flow.
                        isOnboardingFlowCompleted({
                            onNotCompleted: () => {
                                Log.info('[Onboarding] User has not completed the guided setup flow, starting onboarding flow from deep link');
                                startOnboardingFlow({
                                    onboardingValuesParam: val,
                                    hasAccessiblePolicies: !!account?.hasAccessibleDomainPolicies,
                                    isUserFromPublicDomain: !!account?.isFromPublicDomain,
                                    currentOnboardingPurposeSelected,
                                    currentOnboardingCompanySize,
                                    onboardingInitialPath,
                                    onboardingValues: val,
                                });
                            },
                            onCompleted: handleDeeplinkNavigation,
                            onCanceled: handleDeeplinkNavigation,
                        });
                    });
                },
            });
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
};
