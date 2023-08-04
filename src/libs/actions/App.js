import moment from 'moment-timezone';
import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import Log from '../Log';
import Performance from '../Performance';
import * as Policy from './Policy';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as SessionUtils from '../SessionUtils';
import getCurrentUrl from '../Navigation/currentUrl';
import * as Session from './Session';
import * as ReportActionsUtils from '../ReportActionsUtils';
import Timing from './Timing';
import * as Browser from '../Browser';

let currentUserAccountID;
let currentUserEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', '');
        currentUserEmail = lodashGet(val, 'email', '');
    },
});

let isSidebarLoaded;
Onyx.connect({
    key: ONYXKEYS.IS_SIDEBAR_LOADED,
    callback: (val) => (isSidebarLoaded = val),
    initWithStoredValues: false,
});

let preferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => (preferredLocale = val),
});

let resolveIsReadyPromise;
const isReadyToOpenApp = new Promise((resolve) => {
    resolveIsReadyPromise = resolve;
});

function confirmReadyToOpenApp() {
    resolveIsReadyPromise();
}

/**
 * @param {Array} policies
 * @return {Object} map of policy id to lastUpdated
 */
function getNonOptimisticPolicyIDToLastModifiedMap(policies) {
    return _.chain(policies)
        .reject((policy) => lodashGet(policy, 'pendingAction', '') === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)
        .map((policy) => [policy.id, policy.lastModified || 0])
        .object()
        .value();
}

/**
 * @param {String} locale
 */
function setLocale(locale) {
    if (locale === preferredLocale) {
        return;
    }

    // If user is not signed in, change just locally.
    if (!currentUserAccountID) {
        Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
        return;
    }

    // Optimistically change preferred locale
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
            value: locale,
        },
    ];

    API.write(
        'UpdatePreferredLocale',
        {
            value: locale,
        },
        {optimisticData},
    );
}

/**
 * @param {String} locale
 */
function setLocaleAndNavigate(locale) {
    setLocale(locale);
    Navigation.goBack(ROUTES.SETTINGS_PREFERENCES);
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
    Performance.markEnd(CONST.TIMING.SIDEBAR_LOADED);
    Performance.markStart(CONST.TIMING.REPORT_INITIAL_RENDER);
}

let appState;
AppState.addEventListener('change', (nextAppState) => {
    if (nextAppState.match(/inactive|background/) && appState === 'active') {
        Log.info('Flushing logs as app is going inactive', true, {}, true);
    }
    appState = nextAppState;
});

/**
 * Fetches data needed for app initialization
 * @param {boolean} [isReconnecting]
 */
function openApp(isReconnecting = false) {
    isReadyToOpenApp.then(() => {
        const connectionID = Onyx.connect({
            key: ONYXKEYS.COLLECTION.POLICY,
            waitForCollectionCallback: true,
            callback: (policies) => {
                // When the app reconnects we do a fast "sync" of the LHN and only return chats that have new messages. We achieve this by sending the most recent reportActionID.
                // we have locally. And then only update the user about chats with messages that have occurred after that reportActionID.
                //
                // - Look through the local report actions and reports to find the most recently modified report action or report.
                // - We send this to the server so that it can compute which new chats the user needs to see and return only those as an optimization.
                const params = {policyIDToLastModified: JSON.stringify(getNonOptimisticPolicyIDToLastModifiedMap(policies))};
                if (isReconnecting) {
                    Timing.start(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION);
                    params.mostRecentReportActionLastModified = ReportActionsUtils.getMostRecentReportActionLastModified();
                    Timing.end(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION, '', 500);
                }
                Onyx.disconnect(connectionID);

                // eslint-disable-next-line rulesdir/no-multiple-api-calls
                const apiMethod = isReconnecting ? API.write : API.read;
                apiMethod(isReconnecting ? 'ReconnectApp' : 'OpenApp', params, {
                    optimisticData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                            value: true,
                        },
                    ],
                    successData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                            value: false,
                        },
                    ],
                    failureData: [
                        {
                            onyxMethod: Onyx.METHOD.MERGE,
                            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                            value: false,
                        },
                    ],
                });
            },
        });
    });
}

/**
 * Refreshes data when the app reconnects
 */
function reconnectApp() {
    openApp(true);
}

/**
 * This promise is used so that deeplink component know when a transition is end.
 * This is necessary because we want to begin deeplink redirection after the transition is end.
 */
let resolveSignOnTransitionToFinishPromise;
const signOnTransitionToFinishPromise = new Promise((resolve) => {
    resolveSignOnTransitionToFinishPromise = resolve;
});

function waitForSignOnTransitionToFinish() {
    return signOnTransitionToFinishPromise;
}

function endSignOnTransition() {
    return resolveSignOnTransitionToFinishPromise();
}

/**
 * Create a new workspace and navigate to it
 *
 * @param {String} [policyOwnerEmail] Optional, the email of the account to make the owner of the policy
 * @param {Boolean} [makeMeAdmin] Optional, leave the calling account as an admin on the policy
 * @param {String} [policyName] Optional, custom policy name we will use for created workspace
 * @param {Boolean} [transitionFromOldDot] Optional, if the user is transitioning from old dot
 * @param {Boolean} [shouldNavigateToAdminChat] Optional, navigate to the #admin room after creation
 */
function createWorkspaceAndNavigateToIt(policyOwnerEmail = '', makeMeAdmin = false, policyName = '', transitionFromOldDot = false, shouldNavigateToAdminChat = true) {
    const policyID = Policy.generatePolicyID();
    const adminsChatReportID = Policy.createWorkspace(policyOwnerEmail, makeMeAdmin, policyName, policyID);
    Navigation.isNavigationReady()
        .then(() => {
            if (transitionFromOldDot) {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
            }

            if (shouldNavigateToAdminChat) {
                Navigation.navigate(ROUTES.getReportRoute(adminsChatReportID));
            }

            Navigation.navigate(ROUTES.getWorkspaceInitialRoute(policyID));
        })
        .then(endSignOnTransition);
}

/**
 * This action runs when the Navigator is ready and the current route changes
 *
 * currentPath should be the path as reported by the NavigationContainer
 *
 * The transition link contains an exitTo param that contains the route to
 * navigate to after the user is signed in. A user can transition from OldDot
 * with a different account than the one they are currently signed in with, so
 * we only navigate if they are not signing in as a new user. Once they are
 * signed in as that new user, this action will run again and the navigation
 * will occur.

 * When the exitTo route is 'workspace/new', we create a new
 * workspace and navigate to it
 *
 * We subscribe to the session using withOnyx in the AuthScreens and
 * pass it in as a parameter. withOnyx guarantees that the value has been read
 * from Onyx because it will not render the AuthScreens until that point.
 * @param {Object} session
 * @param {Boolean} shouldNavigateToAdminChat Should we navigate to admin chat after creating workspace
 */
function setUpPoliciesAndNavigate(session, shouldNavigateToAdminChat) {
    const currentUrl = getCurrentUrl();
    if (!session || !currentUrl || !currentUrl.includes('exitTo')) {
        return;
    }

    const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
    const url = new URL(currentUrl);
    const exitTo = url.searchParams.get('exitTo');

    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const policyOwnerEmail = url.searchParams.get('ownerEmail');
    const makeMeAdmin = url.searchParams.get('makeMeAdmin');
    const policyName = url.searchParams.get('policyName');

    // Sign out the current user if we're transitioning with a different user
    const isTransitioning = Str.startsWith(url.pathname, Str.normalizeUrl(ROUTES.TRANSITION_BETWEEN_APPS));
    if (isLoggingInAsNewUser && isTransitioning) {
        Session.signOut();
    }

    const shouldCreateFreePolicy = !isLoggingInAsNewUser && isTransitioning && exitTo === ROUTES.WORKSPACE_NEW;
    if (shouldCreateFreePolicy) {
        createWorkspaceAndNavigateToIt(policyOwnerEmail, makeMeAdmin, policyName, true, shouldNavigateToAdminChat);
        return;
    }
    if (!isLoggingInAsNewUser && exitTo) {
        Navigation.isNavigationReady()
            .then(() => {
                // We must call goBack() to remove the /transition route from history
                Navigation.goBack();
                Navigation.navigate(exitTo);
            })
            .then(endSignOnTransition);
    }
}

function openProfile(personalDetails) {
    const oldTimezoneData = personalDetails.timezone || {};
    let newTimezoneData = oldTimezoneData;

    if (lodashGet(oldTimezoneData, 'automatic', true)) {
        newTimezoneData = {
            automatic: true,
            selected: moment.tz.guess(true),
        };
    }

    API.write(
        'OpenProfile',
        {
            timezone: JSON.stringify(newTimezoneData),
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            timezone: newTimezoneData,
                        },
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            timezone: oldTimezoneData,
                        },
                    },
                },
            ],
        },
    );
}

function beginDeepLinkRedirect() {
    // There's no support for anonymous users on desktop
    if (Session.isAnonymousUser()) {
        return;
    }

    if (!currentUserAccountID) {
        Browser.openRouteInDesktopApp();
        return;
    }

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects('OpenOldDotLink', {shouldRetry: false}, {}).then((response) => {
        Browser.openRouteInDesktopApp(response.shortLivedAuthToken, currentUserEmail);
    });
}

function beginDeepLinkRedirectAfterTransition() {
    waitForSignOnTransitionToFinish().then(beginDeepLinkRedirect);
}

export {
    setLocale,
    setLocaleAndNavigate,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openProfile,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    beginDeepLinkRedirect,
    beginDeepLinkRedirectAfterTransition,
    createWorkspaceAndNavigateToIt,
};
