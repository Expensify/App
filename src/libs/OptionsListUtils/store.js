import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';

let currentUserLogin;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserLogin = val && val.email,
});

/**
 * @returns {String}
 */
function getCurrentUserLogin() {
    return currentUserLogin;
}

let currentUser;
Onyx.connect({
    key: ONYXKEYS.USER,
    callback: val => currentUser = val,
});

/**
 * @returns {Object}
 */
function getCurrentUser() {
    return currentUser;
}

let countryCodeByIP;
Onyx.connect({
    key: ONYXKEYS.COUNTRY_CODE,
    callback: val => countryCodeByIP = val || 1,
});

/**
 * @returns {Number}
 */
function getCountryCodeByIP() {
    return countryCodeByIP;
}

let preferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: val => preferredLocale = val || CONST.DEFAULT_LOCALE,
});

/**
 * @returns {String}
 */
function getPreferredLocale() {
    return preferredLocale;
}

const policies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (policy, key) => {
        if (!policy || !key || !policy.name) {
            return;
        }

        policies[key] = policy;
    },
});

/**
 * @returns {Object}
 */
function getPolicies() {
    return policies;
}

const iouReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_IOUS,
    callback: (iouReport, key) => {
        if (!iouReport || !key || !iouReport.ownerEmail) {
            return;
        }

        iouReports[key] = iouReport;
    },
});

/**
 * @returns {Object}
 */
function getIOUReports() {
    return iouReports;
}

export {
    getCurrentUserLogin,
    getCurrentUser,
    getIOUReports,
    getCountryCodeByIP,
    getPreferredLocale,
    getPolicies,
};
