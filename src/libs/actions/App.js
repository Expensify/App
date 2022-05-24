import {AppState, Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import CONST from '../../CONST';
import Log from '../Log';
import Performance from '../Performance';
import Timing from './Timing';
import NameValuePair from './NameValuePair';
import * as PersonalDetails from './PersonalDetails';
import * as User from './User';
import * as Report from './Report';
import * as GeoLocation from './GeoLocation';
import * as BankAccounts from './BankAccounts';
import * as Policy from './Policy';
import NetworkConnection from '../NetworkConnection';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

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

let currentPreferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => currentPreferredLocale = val || CONST.DEFAULT_LOCALE,
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
    if (currentUserAccountID) {
        API.PreferredLocale_Update({name: 'preferredLocale', value: locale});
    }
    Onyx.merge(ONYXKEYS.NVP_PREFERRED_LOCALE, locale);
}

function getLocale() {
    API.Get({
        returnValueList: 'nameValuePairs',
        nvpNames: ONYXKEYS.NVP_PREFERRED_LOCALE,
    }).then((response) => {
        const preferredLocale = lodashGet(response, ['nameValuePairs', 'preferredLocale'], CONST.DEFAULT_LOCALE);
        if (preferredLocale === currentPreferredLocale) {
            return;
        }

        Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, preferredLocale);
    });
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
 *
 * @param {Boolean} shouldSyncPolicyList Should be false if the initial policy needs to be created. Otherwise, should be true.
 * @param {Boolean} shouldSyncVBA Set to false if we are calling on reconnect.
 * @returns {Promise}
 */
function getAppData(shouldSyncPolicyList = true, shouldSyncVBA = true) {
    NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.NVP_PRIORITY_MODE, 'default');
    NameValuePair.get(CONST.NVP.IS_FIRST_TIME_NEW_EXPENSIFY_USER, ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER, true);
    getLocale();
    User.getUserDetails();
    User.getBetas();
    User.getDomainInfo();
    PersonalDetails.fetchLocalCurrency();
    GeoLocation.fetchCountryCodeByRequestIP();
    BankAccounts.fetchUserWallet();

    if (shouldSyncVBA) {
        BankAccounts.fetchFreePlanVerifiedBankAccount();
    }

    if (shouldSyncPolicyList) {
        Policy.getPolicyList();
    }

    // We should update the syncing indicator when personal details and reports are both done fetching.
    return Promise.all([
        PersonalDetails.fetchPersonalDetails(),
        Report.fetchAllReports(true, true),
    ]);
}

/**
 * Run FixAccount to check if we need to fix anything for the user or run migrations. Reinitialize the data if anything changed
 * because some migrations might create new chat reports or their change data.
 */
function fixAccountAndReloadData() {
    API.User_FixAccount()
        .then((response) => {
            if (!response.changed) {
                return;
            }
            Log.info('FixAccount found updates for this user, so data will be reinitialized', true, response);
            getAppData(false);
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
    Navigation.isNavigationReady()
        .then(Linking.getInitialURL)
        .then((url) => {
            if (!url) {
                Policy.getPolicyList();
                return;
            }
            const path = new URL(url).pathname;
            const params = new URLSearchParams(url);
            const exitTo = params.get('exitTo');
            const email = params.get('email');
            const isLoggingInAsNewUser = session.email !== email;
            const shouldCreateFreePolicy = !isLoggingInAsNewUser
                        && Str.startsWith(path, Str.normalizeUrl(ROUTES.TRANSITION_FROM_OLD_DOT))
                        && exitTo === ROUTES.WORKSPACE_NEW;
            if (shouldCreateFreePolicy) {
                Policy.createAndGetPolicyList();
                return;
            }
            Policy.getPolicyList();
            if (!isLoggingInAsNewUser && exitTo) {
                // We must call dismissModal() to remove the /transition route from history
                Navigation.dismissModal();
                Navigation.navigate(exitTo);
            }
        });
}

// When the app reconnects from being offline, fetch all initialization data
NetworkConnection.onReconnect(() => getAppData(true, false));

export {
    setCurrentURL,
    setLocale,
    setSidebarLoaded,
    getLocale,
    getAppData,
    fixAccountAndReloadData,
    setUpPoliciesAndNavigate,
};
