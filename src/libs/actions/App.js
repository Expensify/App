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
import * as SequentialQueue from '../Network/SequentialQueue';

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
 * @return {Array<String>} array of policy ids
 */
function getNonOptimisticPolicyIDs(policies) {
    return _.chain(policies)
        .reject((policy) => lodashGet(policy, 'pendingAction', null) === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)
        .pluck('id')
        .compact()
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
 * Gets the policy params that are passed to the server in the OpenApp and ReconnectApp API commands. This includes a full list of policy IDs the client knows about as well as when they were last modified.
 * @returns {Promise}
 */
function getPolicyParamsForOpenOrReconnect() {
    return new Promise((resolve) => {
        isReadyToOpenApp.then(() => {
            const connectionID = Onyx.connect({
                key: ONYXKEYS.COLLECTION.POLICY,
                waitForCollectionCallback: true,
                callback: (policies) => {
                    Onyx.disconnect(connectionID);
                    resolve({policyIDList: getNonOptimisticPolicyIDs(policies)});
                },
            });
        });
    });
}

/**
 * Returns the Onyx data that is used for both the OpenApp and ReconnectApp API commands.
 * @returns {Object}
 */
function getOnyxDataForOpenOrReconnect() {
    return {
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
    };
}

/**
 * Fetches data needed for app initialization
 */
function openApp() {
    getPolicyParamsForOpenOrReconnect().then((policyParams) => {
        API.read('OpenApp', policyParams, getOnyxDataForOpenOrReconnect());
    });
}

/**
 * Fetches data when the app reconnects to the network
 * @param {Number} [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 */
function reconnectApp(updateIDFrom = 0) {
    console.debug(`[OnyxUpdates] App reconnecting with updateIDFrom: ${updateIDFrom}`);
    getPolicyParamsForOpenOrReconnect().then((policyParams) => {
        const params = {...policyParams};

        // When the app reconnects we do a fast "sync" of the LHN and only return chats that have new messages. We achieve this by sending the most recent reportActionID.
        // we have locally. And then only update the user about chats with messages that have occurred after that reportActionID.
        //
        // - Look through the local report actions and reports to find the most recently modified report action or report.
        // - We send this to the server so that it can compute which new chats the user needs to see and return only those as an optimization.
        Timing.start(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION);
        params.mostRecentReportActionLastModified = ReportActionsUtils.getMostRecentReportActionLastModified();
        Timing.end(CONST.TIMING.CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION, '', 500);

        // Include the update IDs when reconnecting so that the server can send incremental updates if they are available.
        // Otherwise, a full set of app data will be returned.
        if (updateIDFrom) {
            params.updateIDFrom = updateIDFrom;
        }

        API.write('ReconnectApp', params, getOnyxDataForOpenOrReconnect());
    });
}

/**
 * Fetches data when the client has discovered it missed some Onyx updates from the server
 * @param {Number} [updateIDFrom] the ID of the Onyx update that we want to start fetching from
 * @param {Number} [updateIDTo] the ID of the Onyx update that we want to fetch up to
 * @return {Promise}
 */
function getMissingOnyxUpdates(updateIDFrom = 0, updateIDTo = 0) {
    console.debug(`[OnyxUpdates] Fetching missing updates updateIDFrom: ${updateIDFrom} and updateIDTo: ${updateIDTo}`);

    // It is SUPER BAD FORM to return promises from action methods.
    // DO NOT FOLLOW THIS PATTERN!!!!!
    // It was absolutely necessary in order to block OnyxUpdates while fetching the missing updates from the server or else the udpates aren't applied in the proper order.
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(
        'GetMissingOnyxMessages',
        {
            updateIDFrom,
            updateIDTo,
        },
        getOnyxDataForOpenOrReconnect(),
    );
}

// The next 40ish lines of code are used for detecting when there is a gap of OnyxUpdates between what was last applied to the client and the updates the server has.
// When a gap is detected, the missing updates are fetched from the API.

// These key needs to be separate from ONYXKEYS.ONYX_UPDATES_FROM_SERVER so that it can be updated without triggering the callback when the server IDs are updated
let lastUpdateIDAppliedToClient = 0;
Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT,
    callback: (val) => (lastUpdateIDAppliedToClient = val),
});

Onyx.connect({
    key: ONYXKEYS.ONYX_UPDATES_FROM_SERVER,
    callback: (val) => {
        if (!val) {
            return;
        }

        const {lastUpdateIDFromServer, previousUpdateIDFromServer} = val;
        console.debug('[OnyxUpdates] Received lastUpdateID from server', lastUpdateIDFromServer);
        console.debug('[OnyxUpdates] Received previousUpdateID from server', previousUpdateIDFromServer);
        console.debug('[OnyxUpdates] Last update ID applied to the client', lastUpdateIDAppliedToClient);

        // If the previous update from the server does not match the last update the client got, then the client is missing some updates.
        // getMissingOnyxUpdates will fetch updates starting from the last update this client got and going to the last update the server sent.
        if (lastUpdateIDAppliedToClient && previousUpdateIDFromServer && lastUpdateIDAppliedToClient < previousUpdateIDFromServer) {
            console.debug('[OnyxUpdates] Gap detected in update IDs so fetching incremental updates');
            Log.info('Gap detected in update IDs from server so fetching incremental updates', true, {
                lastUpdateIDFromServer,
                previousUpdateIDFromServer,
                lastUpdateIDAppliedToClient,
            });
            SequentialQueue.pause();
            getMissingOnyxUpdates(lastUpdateIDAppliedToClient, lastUpdateIDFromServer).finally(SequentialQueue.unpause);
        }

        if (lastUpdateIDFromServer > lastUpdateIDAppliedToClient) {
            // Update this value so that it matches what was just received from the server
            Onyx.merge(ONYXKEYS.ONYX_UPDATES_LAST_UPDATE_ID_APPLIED_TO_CLIENT, lastUpdateIDFromServer || 0);
        }
    },
});

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

function redirectThirdPartyDesktopSignIn() {
    const currentUrl = getCurrentUrl();
    if (!currentUrl) {
        return;
    }
    const url = new URL(currentUrl);

    if (url.pathname === `/${ROUTES.GOOGLE_SIGN_IN}` || url.pathname === `/${ROUTES.APPLE_SIGN_IN}`) {
        Navigation.isNavigationReady().then(() => {
            Navigation.goBack();
            Navigation.navigate(ROUTES.DESKTOP_SIGN_IN_REDIRECT);
        });
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

/**
 * @param {boolean} shouldAuthenticateWithCurrentAccount Optional, indicates whether default authentication method (shortLivedAuthToken) should be used
 */
function beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount = true) {
    // There's no support for anonymous users on desktop
    if (Session.isAnonymousUser()) {
        return;
    }

    // If the route that is being handled is a magic link, email and shortLivedAuthToken should not be attached to the url
    // to prevent signing into the wrong account
    if (!currentUserAccountID || !shouldAuthenticateWithCurrentAccount) {
        Browser.openRouteInDesktopApp();
        return;
    }

    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    API.makeRequestWithSideEffects('OpenOldDotLink', {shouldRetry: false}, {}).then((response) => {
        Browser.openRouteInDesktopApp(response.shortLivedAuthToken, currentUserEmail);
    });
}

/**
 * @param {boolean} shouldAuthenticateWithCurrentAccount Optional, indicates whether default authentication method (shortLivedAuthToken) should be used
 */
function beginDeepLinkRedirectAfterTransition(shouldAuthenticateWithCurrentAccount = true) {
    waitForSignOnTransitionToFinish().then(() => beginDeepLinkRedirect(shouldAuthenticateWithCurrentAccount));
}

export {
    setLocale,
    setLocaleAndNavigate,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openProfile,
    redirectThirdPartyDesktopSignIn,
    openApp,
    reconnectApp,
    confirmReadyToOpenApp,
    beginDeepLinkRedirect,
    beginDeepLinkRedirectAfterTransition,
    createWorkspaceAndNavigateToIt,
};
