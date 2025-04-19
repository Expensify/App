
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.getPhoneNumber =
    exports.getLoginByAccountID =
    exports.getDefaultCountry =
    exports.getShortMentionIfFound =
    exports.getUserNameByEmail =
    exports.getPersonalDetailsLength =
    exports.getNewAccountIDsAndLogins =
    exports.extractFirstAndLastNameFromAvailableDetails =
    exports.createDisplayName =
    exports.getEffectiveDisplayName =
    exports.getStreetLines =
    exports.getFormattedStreet =
    exports.getFormattedAddress =
    exports.getCurrentAddress =
    exports.getPersonalDetailsOnyxDataForOptimisticUsers =
    exports.getLoginsByAccountIDs =
    exports.getAccountIDsByLogins =
    exports.getPersonalDetailByEmail =
    exports.getPersonalDetailsByIDs =
    exports.getDisplayNameOrDefault =
    exports.isPersonalDetailsEmpty =
        void 0;
const expensify_common_1 = require('expensify-common');
const react_native_onyx_1 = require('react-native-onyx');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const EmptyObject_1 = require('@src/types/utils/EmptyObject');
const LocalePhoneNumber_1 = require('./LocalePhoneNumber');
const Localize_1 = require('./Localize');
const LoginUtils_1 = require('./LoginUtils');
const PhoneNumber_1 = require('./PhoneNumber');
const UserUtils_1 = require('./UserUtils');

let personalDetails = [];
let allPersonalDetails = {};
let emailToPersonalDetailsCache = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PERSONAL_DETAILS_LIST,
    callback (val) {
        personalDetails = Object.values(val !== null && val !== void 0 ? val : {});
        allPersonalDetails = val;
        emailToPersonalDetailsCache = personalDetails.reduce(function (acc, detail) {
            if (detail === null || detail === void 0 ? void 0 : detail.login) {
                acc[detail.login.toLowerCase()] = detail;
            }
            return acc;
        }, {});
    },
});
let hiddenTranslation = '';
let youTranslation = '';
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
    callback (value) {
        if (!value) {
            return;
        }
        hiddenTranslation = Localize_1.translateLocal('common.hidden');
        youTranslation = Localize_1.translateLocal('common.you').toLowerCase();
    },
});
let defaultCountry = '';
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COUNTRY,
    callback (value) {
        if (!value) {
            return;
        }
        defaultCountry = value;
    },
});
const regexMergedAccount = new RegExp(CONST_1['default'].REGEX.MERGED_ACCOUNT_PREFIX);
function getDisplayNameOrDefault(passedPersonalDetails, defaultValue, shouldFallbackToHidden, shouldAddCurrentUserPostfix) {
    let _a; let _b;
    if (defaultValue === void 0) {
        defaultValue = '';
    }
    if (shouldFallbackToHidden === void 0) {
        shouldFallbackToHidden = true;
    }
    if (shouldAddCurrentUserPostfix === void 0) {
        shouldAddCurrentUserPostfix = false;
    }
    let displayName = (_a = passedPersonalDetails === null || passedPersonalDetails === void 0 ? void 0 : passedPersonalDetails.displayName) !== null && _a !== void 0 ? _a : '';
    let login = (_b = passedPersonalDetails === null || passedPersonalDetails === void 0 ? void 0 : passedPersonalDetails.login) !== null && _b !== void 0 ? _b : '';
    // If the displayName starts with the merged account prefix, remove it.
    if (regexMergedAccount.test(displayName)) {
        // Remove the merged account prefix from the displayName.
        displayName = displayName.replace(CONST_1['default'].REGEX.MERGED_ACCOUNT_PREFIX, '');
    }
    // If the displayName is not set by the user, the backend sets the diplayName same as the login so
    // we need to remove the sms domain from the displayName if it is an sms login.
    if (expensify_common_1.Str.isSMSLogin(login)) {
        if (displayName === login) {
            displayName = expensify_common_1.Str.removeSMSDomain(displayName);
        }
        login = expensify_common_1.Str.removeSMSDomain(login);
    }
    if (shouldAddCurrentUserPostfix && !!displayName) {
        displayName = `${displayName  } (${  youTranslation  })`;
    }
    if ((passedPersonalDetails === null || passedPersonalDetails === void 0 ? void 0 : passedPersonalDetails.accountID) === CONST_1['default'].ACCOUNT_ID.CONCIERGE) {
        displayName = CONST_1['default'].CONCIERGE_DISPLAY_NAME;
    }
    if (displayName) {
        return displayName;
    }
    if (defaultValue) {
        return defaultValue;
    }
    if (login) {
        return login;
    }
    return shouldFallbackToHidden ? hiddenTranslation : '';
}
exports.getDisplayNameOrDefault = getDisplayNameOrDefault;
/**
 * Given a list of account IDs (as number) it will return an array of personal details objects.
 * @param accountIDs  - Array of accountIDs
 * @param currentUserAccountID
 * @param shouldChangeUserDisplayName - It will replace the current user's personal detail object's displayName with 'You'.
 * @returns - Array of personal detail objects
 */
function getPersonalDetailsByIDs(_a) {
    const accountIDs = _a.accountIDs;
        const currentUserAccountID = _a.currentUserAccountID;
        const _b = _a.shouldChangeUserDisplayName;
        const shouldChangeUserDisplayName = _b === void 0 ? false : _b;
        const _c = _a.personalDetailsParam;
        const personalDetailsParam = _c === void 0 ? allPersonalDetails : _c;
    const result = accountIDs
        .filter(function (accountID) {
            return !!(personalDetailsParam === null || personalDetailsParam === void 0 ? void 0 : personalDetailsParam[accountID]);
        })
        .map(function (accountID) {
            let _a;
            const detail = (_a = personalDetailsParam === null || personalDetailsParam === void 0 ? void 0 : personalDetailsParam[accountID]) !== null && _a !== void 0 ? _a : {};
            if (shouldChangeUserDisplayName && currentUserAccountID === detail.accountID) {
                return {...detail, displayName: Localize_1.translateLocal('common.you')};
            }
            return detail;
        });
    return result;
}
exports.getPersonalDetailsByIDs = getPersonalDetailsByIDs;
function getPersonalDetailByEmail(email) {
    return emailToPersonalDetailsCache[email.toLowerCase()];
}
exports.getPersonalDetailByEmail = getPersonalDetailByEmail;
/**
 * Given a list of logins, find the associated personal detail and return related accountIDs.
 *
 * @param logins Array of user logins
 * @returns Array of accountIDs according to passed logins
 */
function getAccountIDsByLogins(logins) {
    return logins.reduce(function (foundAccountIDs, login) {
        const currentDetail = personalDetails.find(function (detail) {
            return (detail === null || detail === void 0 ? void 0 : detail.login) === (login === null || login === void 0 ? void 0 : login.toLowerCase());
        });
        if (!currentDetail) {
            // generate an account ID because in this case the detail is probably new, so we don't have a real accountID yet
            foundAccountIDs.push(UserUtils_1.generateAccountID(login));
        } else {
            foundAccountIDs.push(Number(currentDetail.accountID));
        }
        return foundAccountIDs;
    }, []);
}
exports.getAccountIDsByLogins = getAccountIDsByLogins;
/**
 * Given an accountID, find the associated personal detail and return related login.
 *
 * @param accountID User accountID
 * @returns Login according to passed accountID
 */
function getLoginByAccountID(accountID) {
    let _a;
    return (_a = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID]) === null || _a === void 0 ? void 0 : _a.login;
}
exports.getLoginByAccountID = getLoginByAccountID;
/**
 * Given a list of accountIDs, find the associated personal detail and return related logins.
 *
 * @param accountIDs Array of user accountIDs
 * @returns Array of logins according to passed accountIDs
 */
function getLoginsByAccountIDs(accountIDs) {
    return accountIDs.reduce(function (foundLogins, accountID) {
        const currentLogin = getLoginByAccountID(accountID);
        if (currentLogin) {
            foundLogins.push(currentLogin);
        }
        return foundLogins;
    }, []);
}
exports.getLoginsByAccountIDs = getLoginsByAccountIDs;
/**
 * Provided a set of invited logins and optimistic accountIDs. Returns the ones which are not known to the user i.e. they do not exist in the personalDetailsList.
 */
function getNewAccountIDsAndLogins(logins, accountIDs) {
    const newAccountIDs = [];
    const newLogins = [];
    logins.forEach(function (login, index) {
        let _a;
        const accountID = (_a = accountIDs.at(index)) !== null && _a !== void 0 ? _a : -1;
        if (EmptyObject_1.isEmptyObject(allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[accountID])) {
            newAccountIDs.push(accountID);
            newLogins.push(login);
        }
    });
    return {newAccountIDs, newLogins};
}
exports.getNewAccountIDsAndLogins = getNewAccountIDsAndLogins;
/**
 * Given a list of logins and accountIDs, return Onyx data for users with no existing personal details stored. These users might be brand new or unknown.
 * They will have an "optimistic" accountID that must be cleaned up later.
 */
function getPersonalDetailsOnyxDataForOptimisticUsers(newLogins, newAccountIDs) {
    const personalDetailsNew = {};
    const personalDetailsCleanup = {};
    newLogins.forEach(function (login, index) {
        let _a;
        const accountID = (_a = newAccountIDs.at(index)) !== null && _a !== void 0 ? _a : -1;
        personalDetailsNew[accountID] = {
            login,
            accountID,
            displayName: LocalePhoneNumber_1.formatPhoneNumber(login),
            isOptimisticPersonalDetail: true,
        };
        /**
         * Cleanup the optimistic user to ensure it does not permanently persist.
         * This is done to prevent duplicate entries (upon success) since the BE will return other personal details with the correct account IDs.
         */
        personalDetailsCleanup[accountID] = null;
    });
    const optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: ONYXKEYS_1['default'].PERSONAL_DETAILS_LIST,
            value: personalDetailsNew,
        },
    ];
    const finallyData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: ONYXKEYS_1['default'].PERSONAL_DETAILS_LIST,
            value: personalDetailsCleanup,
        },
    ];
    return {
        optimisticData,
        finallyData,
    };
}
exports.getPersonalDetailsOnyxDataForOptimisticUsers = getPersonalDetailsOnyxDataForOptimisticUsers;
/**
 * Applies common formatting to each piece of an address
 *
 * @param piece - address piece to format
 * @returns - formatted piece
 */
function formatPiece(piece) {
    return piece ? `${piece  }, ` : '';
}
/**
 *
 * @param street1 - street line 1
 * @param street2 - street line 2
 * @returns formatted street
 */
function getFormattedStreet(street1, street2) {
    if (street1 === void 0) {
        street1 = '';
    }
    if (street2 === void 0) {
        street2 = '';
    }
    return `${street1  }\n${  street2}`;
}
exports.getFormattedStreet = getFormattedStreet;
/**
 *
 * @param - formatted address
 * @returns [street1, street2]
 */
function getStreetLines(street) {
    if (street === void 0) {
        street = '';
    }
    const streets = street.split('\n');
    return [streets.at(0), streets.at(1)];
}
exports.getStreetLines = getStreetLines;
/**
 * Get the current address from addresses array
 *
 * @param privatePersonalDetails - details object
 * @returns - current address object
 */
function getCurrentAddress(privatePersonalDetails) {
    const addresses = (privatePersonalDetails !== null && privatePersonalDetails !== void 0 ? privatePersonalDetails : {}).addresses;
    const currentAddress =
        addresses === null || addresses === void 0
            ? void 0
            : addresses.find(function (address) {
                  return address.current;
              });
    return currentAddress !== null && currentAddress !== void 0 ? currentAddress : addresses === null || addresses === void 0 ? void 0 : addresses[addresses.length - 1];
}
exports.getCurrentAddress = getCurrentAddress;
/**
 * Formats an address object into an easily readable string
 *
 * @param privatePersonalDetails - details object
 * @returns - formatted address
 */
function getFormattedAddress(privatePersonalDetails) {
    const address = getCurrentAddress(privatePersonalDetails);
    const _a = getStreetLines(address === null || address === void 0 ? void 0 : address.street);
        const street1 = _a[0];
        const street2 = _a[1];
    const formattedAddress =
        formatPiece(street1) +
        formatPiece(street2) +
        formatPiece(address === null || address === void 0 ? void 0 : address.city) +
        formatPiece(address === null || address === void 0 ? void 0 : address.state) +
        formatPiece(address === null || address === void 0 ? void 0 : address.zip) +
        formatPiece(address === null || address === void 0 ? void 0 : address.country);
    // Remove the last comma of the address
    return formattedAddress.trim().replace(/,$/, '');
}
exports.getFormattedAddress = getFormattedAddress;
/**
 * @param personalDetail - details object
 * @returns - The effective display name
 */
function getEffectiveDisplayName(personalDetail) {
    let _a;
    if (personalDetail) {
        return (
            LocalePhoneNumber_1.formatPhoneNumber((_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _a !== void 0 ? _a : '') ||
            personalDetail.displayName
        );
    }
    return undefined;
}
exports.getEffectiveDisplayName = getEffectiveDisplayName;
/**
 * Creates a new displayName for a user based on passed personal details or login.
 */
function createDisplayName(login, passedPersonalDetails) {
    let _a; let _b;
    // If we have a number like +15857527441@expensify.sms then let's remove @expensify.sms and format it
    // so that the option looks cleaner in our UI.
    const userLogin = LocalePhoneNumber_1.formatPhoneNumber(login);
    if (!passedPersonalDetails) {
        return userLogin;
    }
    const firstName = (_a = passedPersonalDetails.firstName) !== null && _a !== void 0 ? _a : '';
    const lastName = (_b = passedPersonalDetails.lastName) !== null && _b !== void 0 ? _b : '';
    const fullName = (`${firstName  } ${  lastName}`).trim();
    // It's possible for fullName to be empty string, so we must use "||" to fallback to userLogin.
    return fullName || userLogin;
}
exports.createDisplayName = createDisplayName;
/**
 * Gets the first and last name from the user's personal details.
 * If the login is the same as the displayName, then they don't exist,
 * so we return empty strings instead.
 */
function extractFirstAndLastNameFromAvailableDetails(_a) {
    const login = _a.login;
        const displayName = _a.displayName;
        const firstName = _a.firstName;
        const lastName = _a.lastName;
    // It's possible for firstName to be empty string, so we must use "||" to consider lastName instead.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (firstName || lastName) {
        return {firstName: firstName !== null && firstName !== void 0 ? firstName : '', lastName: lastName !== null && lastName !== void 0 ? lastName : ''};
    }
    if (login && expensify_common_1.Str.removeSMSDomain(login) === displayName) {
        return {firstName: '', lastName: ''};
    }
    if (displayName) {
        const firstSpaceIndex = displayName.indexOf(' ');
        const lastSpaceIndex = displayName.lastIndexOf(' ');
        if (firstSpaceIndex === -1) {
            return {firstName: displayName, lastName: ''};
        }
        return {
            firstName: displayName.substring(0, firstSpaceIndex).trim(),
            lastName: displayName.substring(lastSpaceIndex).trim(),
        };
    }
    return {firstName: '', lastName: ''};
}
exports.extractFirstAndLastNameFromAvailableDetails = extractFirstAndLastNameFromAvailableDetails;
/**
 * Whether personal details is empty
 */
function isPersonalDetailsEmpty() {
    return !personalDetails.length;
}
exports.isPersonalDetailsEmpty = isPersonalDetailsEmpty;
function getPersonalDetailsLength() {
    return personalDetails.length;
}
exports.getPersonalDetailsLength = getPersonalDetailsLength;
function getUserNameByEmail(email, nameToDisplay) {
    const userDetails = getPersonalDetailByEmail(email);
    if (userDetails) {
        return userDetails[nameToDisplay] ? userDetails[nameToDisplay] : userDetails.login;
    }
    return email;
}
exports.getUserNameByEmail = getUserNameByEmail;
const getShortMentionIfFound = function (displayText, userAccountID, currentUserPersonalDetails, userLogin) {
    let _a;
    if (userLogin === void 0) {
        userLogin = '';
    }
    // If the userAccountID does not exist, this is an email-based mention so the displayText must be an email.
    // If the userAccountID exists but userLogin is different from displayText, this means the displayText is either user display name, Hidden, or phone number, in which case we should return it as is.
    if (userAccountID && userLogin !== displayText) {
        return displayText;
    }
    // If the emails are not in the same private domain, we also return the displayText
    if (
        !LoginUtils_1.areEmailsFromSamePrivateDomain(
            displayText,
            (_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.login) !== null && _a !== void 0 ? _a : '',
        )
    ) {
        return displayText;
    }
    // Otherwise, the emails must be of the same private domain, so we should remove the domain part
    return displayText.split('@').at(0);
};
exports.getShortMentionIfFound = getShortMentionIfFound;
function getDefaultCountry() {
    return defaultCountry;
}
exports.getDefaultCountry = getDefaultCountry;
/**
 * Gets the phone number to display for SMS logins
 */
const getPhoneNumber = function (details) {
    let _a;
    const _b = details !== null && details !== void 0 ? details : {};
        const _c = _b.login;
        const login = _c === void 0 ? '' : _c;
        const _d = _b.displayName;
        const displayName = _d === void 0 ? '' : _d;
    // If the user hasn't set a displayName, it is set to their phone number
    const parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(displayName);
    if (parsedPhoneNumber.possible) {
        return (_a = parsedPhoneNumber === null || parsedPhoneNumber === void 0 ? void 0 : parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164;
    }
    // If the user has set a displayName, get the phone number from the SMS login
    return login ? expensify_common_1.Str.removeSMSDomain(login) : '';
};
exports.getPhoneNumber = getPhoneNumber;
