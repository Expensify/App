import {AppState, Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as DeprecatedAPI from '../deprecatedAPI';
import CONST from '../../CONST';
import Log from '../Log';
import Performance from '../Performance';
import Timing from './Timing';
import * as BankAccounts from './BankAccounts';
import * as Policy from './Policy';
import NetworkConnection from '../NetworkConnection';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';
import * as SessionUtils from '../SessionUtils';

let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserAccountID = lodashGet(val, 'accountID', '');
    },
});

let isSidebarLoaded;
Onyx.connect({
    key: ONYXKEYS.IS_SIDEBAR_LOADED,
    callback: val => isSidebarLoaded = val,
    initWithStoredValues: false,
});

const allPolicies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (val, key) => {
        if (!val || !key) {
            return;
        }

        allPolicies[key] = {...allPolicies[key], ...val};
    },
});

/**
 * @param {String} url
 */
function setCurrentURL(url) {
    Onyx.set(ONYXKEYS.CURRENT_URL, url);
}

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
            onyxMethod: 'merge',
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
function getAppData() {
    BankAccounts.fetchUserWallet();
}

/**
 * Gets a comma separated list of locally stored policy ids
 *
 * @param {Array} policies
 * @return {String}
 */
function getPolicyIDList(policies) {
    return _.chain(policies)
        .filter(Boolean)
        .map(policy => policy.id)
        .join(',');
}

/**
 * Fetches data needed for app initialization
 * @param {Array} policies
 */
function openApp(policies) {
    API.read('OpenApp', {
        policyIDList: getPolicyIDList(policies),
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.IS_LOADING_REPORT_DATA,
            value: true,
        }],
        successData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.INITIAL_REPORT_DATA_LOADED,
            value: true,
        }, {
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
 * Refreshes data when the app reconnects
 */
function reconnectApp() {
    API.read('ReconnectApp', {
        policyIDList: getPolicyIDList(allPolicies),
    }, {
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
 * Run FixAccount to check if we need to fix anything for the user or run migrations. Reinitialize the data if anything changed
 * because some migrations might create new chat reports or their change data.
 */
function fixAccountAndReloadData() {
    DeprecatedAPI.User_FixAccount()
        .then((response) => {
            if (!response.changed) {
                return;
            }
            Log.info('FixAccount found updates for this user, so data will be reinitialized', true, response);
            getAppData();
        });
}

/**
 * This action runs every time the AuthScreens are mounted. The navigator may
 * not be ready yet, and therefore we need to wait before navigating within this
 * action and any actions this method calls.
 *
 * getInitialURL allows us to access params from the transition link more easily
 * than trying to extract them from the navigation state.

 * The transition link contains an exitTo param that contains the route to
 * navigate to after the user is signed in. A user can transition from OldDot
 * with a different account than the one they are currently signed in with, so
 * we only navigate if they are not signing in as a new user. Once they are
 * signed in as that new user, this action will run again and the navigation
 * will occur.

 * When the exitTo route is 'workspace/new', we create a new
 * workspace and navigate to it via Policy.createAndGetPolicyList.
 *
 * We subscribe to the session using withOnyx in the AuthScreens and
 * pass it in as a parameter. withOnyx guarantees that the value has been read
 * from Onyx because it will not render the AuthScreens until that point.
 * @param {Object} session
 */
function setUpPoliciesAndNavigate(session) {
    Linking.getInitialURL()
        .then((url) => {
            if (!url) {
                return;
            }
            const path = new URL(url).pathname;
            const params = new URLSearchParams(url);
            const exitTo = params.get('exitTo');
            const isLoggingInAsNewUser = SessionUtils.isLoggingInAsNewUser(url, session.email);
            const shouldCreateFreePolicy = !isLoggingInAsNewUser
                        && Str.startsWith(path, Str.normalizeUrl(ROUTES.TRANSITION_FROM_OLD_DOT))
                        && exitTo === ROUTES.WORKSPACE_NEW;
            if (shouldCreateFreePolicy) {
                Policy.createAndGetPolicyList();
                return;
            }
            if (!isLoggingInAsNewUser && exitTo) {
                Navigation.isNavigationReady()
                    .then(() => {
                        // We must call dismissModal() to remove the /transition route from history
                        Navigation.dismissModal();
                        Navigation.navigate(exitTo);
                    });
            }
        });
}

// When the app reconnects from being offline, fetch all initialization data
NetworkConnection.onReconnect(() => {
    getAppData();
    reconnectApp();
});

export {
    setCurrentURL,
    setLocale,
    setSidebarLoaded,
    getAppData,
    fixAccountAndReloadData,
    setUpPoliciesAndNavigate,
    openApp,
};
