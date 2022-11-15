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
import Timing from './Timing';
import * as Policy from './Policy';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as SessionUtils from '../SessionUtils';
import getCurrentUrl from '../Navigation/currentUrl';

let currentUserAccountID;
let currentUserEmail = '';
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
    callback: val => isSidebarLoaded = val,
    initWithStoredValues: false,
});

let myPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => {
        if (!val || !currentUserEmail) {
            return;
        }

        myPersonalDetails = val[currentUserEmail];
    },
});

let policyIDList = [];
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (policies) => {
        policyIDList = _.compact(_.pluck(policies, 'id'));
    },
});

// When we reconnect the app, we don't want to fetch workspaces created optimistically while offline since they don't exist yet in the back-end.
// If we fetched them then they'd return as empty objects which would clear out the optimistic policy values initially created locally.
// Once the re-queued call to CreateWorkspace returns, the full contents of the workspace excluded here should be correctly saved into Onyx.
let policyIDListExcludingWorkspacesCreatedOffline = [];
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (policies) => {
        const policiesExcludingWorkspacesCreatedOffline = _.reject(policies,
            policy => lodashGet(policy, 'pendingAction', null) === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
            && lodashGet(policy, 'type', null) === CONST.POLICY.TYPE.FREE);
        policyIDListExcludingWorkspacesCreatedOffline = _.compact(_.pluck(policiesExcludingWorkspacesCreatedOffline, 'id'));
    },
});

/**
* @param {String} locale
*/
function setLocale(locale) {
    // If user is not signed in, change just locally.
    if (!currentUserAccountID) {
        Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
        return;
    }

    // Optimistically change preferred locale
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.NVP_PREFERRED_LOCALE,
            value: locale,
        },
    ];

    API.write('UpdatePreferredLocale', {
        value: locale,
    }, {optimisticData});
}

function setSidebarLoaded() {
    if (isSidebarLoaded) {
        return;
    }

    Onyx.set(ONYXKEYS.IS_SIDEBAR_LOADED, true);
    Timing.end(CONST.TIMING.SIDEBAR_LOADED);
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
 */
function openApp() {
    API.read('OpenApp', {policyIDList}, {
        optimisticData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: true,
            },
        ],
        successData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: false,
            },
        ],
        failureData: [
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: ONYXKEYS.IS_LOADING_REPORT_DATA,
                value: false,
            },
        ],
    });
}

/**
 * Refreshes data when the app reconnects
 */
function reconnectApp() {
    API.write('ReconnectApp', {policyIDListExcludingWorkspacesCreatedOffline}, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            value: true,
        }],
        successData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            value: false,
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            value: false,
        }],
    });
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
 */
function setUpPoliciesAndNavigate(session) {
    const currentUrl = getCurrentUrl();
    if (!session || !currentUrl || !currentUrl.includes('exitTo')) {
        return;
    }

    const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(currentUrl, session.email);
    const url = new URL(currentUrl);
    const exitTo = url.searchParams.get('exitTo');

    // Approved Accountants and Guides can enter a flow where they make a workspace for other users,
    // and those are passed as a search parameter when using transition links
    const ownerEmail = url.searchParams.get('ownerEmail');
    const makeMeAdmin = url.searchParams.get('makeMeAdmin');
    const policyName = url.searchParams.get('policyName');

    const shouldCreateFreePolicy = !isLoggingInAsNewUser
                        && Str.startsWith(url.pathname, Str.normalizeUrl(ROUTES.TRANSITION_FROM_OLD_DOT))
                        && exitTo === ROUTES.WORKSPACE_NEW;
    if (shouldCreateFreePolicy) {
        Policy.createWorkspace(ownerEmail, makeMeAdmin, policyName);
        return;
    }
    if (!isLoggingInAsNewUser && exitTo) {
        if (Navigation.isDrawerRoute(exitTo)) {
            // The drawer navigation is only created after we have fetched reports from the server.
            // Thus, if we use the standard navigation and try to navigate to a drawer route before
            // the reports have been fetched, we will fail to navigate.
            Navigation.isDrawerReady()
                .then(() => {
                    // We must call dismissModal() to remove the /transition route from history
                    Navigation.dismissModal();
                    Navigation.navigate(exitTo);
                });
            return;
        }
        Navigation.isNavigationReady()
            .then(() => {
                // We must call dismissModal() to remove the /transition route from history
                Navigation.dismissModal();
                Navigation.navigate(exitTo);
            });
    }
}

function openProfile() {
    const oldTimezoneData = myPersonalDetails.timezone || {};
    let newTimezoneData = oldTimezoneData;

    if (lodashGet(oldTimezoneData, 'automatic', true)) {
        newTimezoneData = {
            automatic: true,
            selected: moment.tz.guess(true),
        };
    }

    API.write('OpenProfile', {
        timezone: JSON.stringify(newTimezoneData),
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    timezone: newTimezoneData,
                },
            },
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    timezone: oldTimezoneData,
                },
            },
        }],
    });

    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
}

export {
    setLocale,
    setSidebarLoaded,
    setUpPoliciesAndNavigate,
    openProfile,
    openApp,
    reconnectApp,
};
