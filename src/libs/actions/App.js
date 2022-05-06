import {AppState} from 'react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
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
 * @returns {Promise}
 */
function getAppData(shouldSyncPolicyList = true) {
    NameValuePair.get(CONST.NVP.PRIORITY_MODE, ONYXKEYS.NVP_PRIORITY_MODE, 'default');
    NameValuePair.get(CONST.NVP.IS_FIRST_TIME_NEW_EXPENSIFY_USER, ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER, true);
    getLocale();
    User.getUserDetails();
    User.getBetas();
    User.getDomainInfo();
    PersonalDetails.fetchLocalCurrency();
    GeoLocation.fetchCountryCodeByRequestIP();
    BankAccounts.fetchFreePlanVerifiedBankAccount();
    BankAccounts.fetchUserWallet();

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

// When the app reconnects from being offline, fetch all initialization data
NetworkConnection.onReconnect(getAppData);

export {
    setCurrentURL,
    setLocale,
    setSidebarLoaded,
    getLocale,
    getAppData,
    fixAccountAndReloadData,
};
