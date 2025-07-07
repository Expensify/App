"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearAvatarErrors = clearAvatarErrors;
exports.deleteAvatar = deleteAvatar;
exports.openPublicProfilePage = openPublicProfilePage;
exports.updateAddress = updateAddress;
exports.updateAutomaticTimezone = updateAutomaticTimezone;
exports.updateAvatar = updateAvatar;
exports.updateDateOfBirth = updateDateOfBirth;
exports.setDisplayName = setDisplayName;
exports.updateDisplayName = updateDisplayName;
exports.updateLegalName = updateLegalName;
exports.updatePhoneNumber = updatePhoneNumber;
exports.clearPhoneNumberError = clearPhoneNumberError;
exports.updatePronouns = updatePronouns;
exports.updateSelectedTimezone = updateSelectedTimezone;
exports.updatePersonalDetailsAndShipExpensifyCards = updatePersonalDetailsAndShipExpensifyCards;
exports.clearPersonalDetailsErrors = clearPersonalDetailsErrors;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var DateUtils_1 = require("@libs/DateUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var LoginUtils = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PersonalDetailsUtils = require("@libs/PersonalDetailsUtils");
var UserUtils = require("@libs/UserUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var currentUserEmail = '';
var currentUserAccountID = -1;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (val) {
        var _a, _b;
        currentUserEmail = (_a = val === null || val === void 0 ? void 0 : val.email) !== null && _a !== void 0 ? _a : '';
        currentUserAccountID = (_b = val === null || val === void 0 ? void 0 : val.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
    },
});
var allPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (val) { return (allPersonalDetails = val); },
});
var privatePersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
    callback: function (val) { return (privatePersonalDetails = val); },
});
function updatePronouns(pronouns) {
    var _a;
    if (!currentUserAccountID) {
        return;
    }
    var parameters = { pronouns: pronouns };
    API.write(types_1.WRITE_COMMANDS.UPDATE_PRONOUNS, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                value: (_a = {},
                    _a[currentUserAccountID] = {
                        pronouns: pronouns,
                    },
                    _a),
            },
        ],
    });
}
function setDisplayName(firstName, lastName) {
    var _a;
    if (!currentUserAccountID) {
        return;
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
        _a[currentUserAccountID] = {
            firstName: firstName,
            lastName: lastName,
            displayName: PersonalDetailsUtils.createDisplayName(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '', {
                firstName: firstName,
                lastName: lastName,
            }),
        },
        _a));
}
function updateDisplayName(firstName, lastName) {
    var _a;
    if (!currentUserAccountID) {
        return;
    }
    var parameters = { firstName: firstName, lastName: lastName };
    API.write(types_1.WRITE_COMMANDS.UPDATE_DISPLAY_NAME, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                value: (_a = {},
                    _a[currentUserAccountID] = {
                        firstName: firstName,
                        lastName: lastName,
                        displayName: PersonalDetailsUtils.createDisplayName(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '', {
                            firstName: firstName,
                            lastName: lastName,
                        }),
                    },
                    _a),
            },
        ],
    });
}
function updateLegalName(legalFirstName, legalLastName) {
    var _a;
    var _b, _c;
    var parameters = { legalFirstName: legalFirstName, legalLastName: legalLastName };
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
            value: {
                legalFirstName: legalFirstName,
                legalLastName: legalLastName,
            },
        },
    ];
    // In case the user does not have a display name, we will update the display name based on the legal name
    if (!((_b = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _b === void 0 ? void 0 : _b.firstName) && !((_c = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _c === void 0 ? void 0 : _c.lastName)) {
        optimisticData.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_a = {},
                _a[currentUserAccountID] = {
                    displayName: PersonalDetailsUtils.createDisplayName(currentUserEmail !== null && currentUserEmail !== void 0 ? currentUserEmail : '', {
                        firstName: legalFirstName,
                        lastName: legalLastName,
                    }),
                    firstName: legalFirstName,
                    lastName: legalLastName,
                },
                _a),
        });
    }
    API.write(types_1.WRITE_COMMANDS.UPDATE_LEGAL_NAME, parameters, {
        optimisticData: optimisticData,
    });
    Navigation_1.default.goBack();
}
/**
 * @param dob - date of birth
 */
function updateDateOfBirth(_a) {
    var dob = _a.dob;
    var parameters = { dob: dob };
    API.write(types_1.WRITE_COMMANDS.UPDATE_DATE_OF_BIRTH, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
                value: {
                    dob: dob,
                },
            },
        ],
    });
    Navigation_1.default.goBack();
}
function updatePhoneNumber(phoneNumber, currentPhoneNumber) {
    var parameters = { phoneNumber: phoneNumber };
    API.write(types_1.WRITE_COMMANDS.UPDATE_PHONE_NUMBER, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
                value: {
                    phoneNumber: phoneNumber,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
                value: {
                    phoneNumber: currentPhoneNumber,
                    errorFields: {
                        phoneNumber: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('privatePersonalDetails.error.invalidPhoneNumber'),
                    },
                },
            },
        ],
    });
}
function clearPhoneNumberError() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, {
        errorFields: {
            phoneNumber: null,
        },
    });
}
function updateAddress(street, street2, city, state, zip, country) {
    var _a;
    var parameters = {
        homeAddressStreet: street,
        addressStreet2: street2,
        homeAddressCity: city,
        addressState: state,
        addressZipCode: zip,
        addressCountry: country,
    };
    // State names for the United States are in the form of two-letter ISO codes
    // State names for other countries except US have full names, so we provide two different params to be handled by server
    if (country !== CONST_1.default.COUNTRY.US) {
        parameters.addressStateLong = state;
    }
    API.write(types_1.WRITE_COMMANDS.UPDATE_HOME_ADDRESS, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
                value: {
                    addresses: __spreadArray(__spreadArray([], ((_a = privatePersonalDetails === null || privatePersonalDetails === void 0 ? void 0 : privatePersonalDetails.addresses) !== null && _a !== void 0 ? _a : []), true), [
                        {
                            street: PersonalDetailsUtils.getFormattedStreet(street, street2),
                            city: city,
                            state: state,
                            zip: zip,
                            country: country,
                            current: true,
                        },
                    ], false),
                },
            },
        ],
    });
    Navigation_1.default.goBack();
}
/**
 * Updates timezone's 'automatic' setting, and updates
 * selected timezone if set to automatically update.
 */
function updateAutomaticTimezone(timezone) {
    var _a;
    if (!currentUserAccountID) {
        return;
    }
    var formattedTimezone = DateUtils_1.default.formatToSupportedTimezone(timezone);
    var parameters = {
        timezone: JSON.stringify(formattedTimezone),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_AUTOMATIC_TIMEZONE, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                value: (_a = {},
                    _a[currentUserAccountID] = {
                        timezone: formattedTimezone,
                    },
                    _a),
            },
        ],
    });
}
/**
 * Updates user's 'selected' timezone, then navigates to the
 * initial Timezone page.
 */
function updateSelectedTimezone(selectedTimezone) {
    var _a;
    var timezone = {
        selected: selectedTimezone,
    };
    var parameters = {
        timezone: JSON.stringify(timezone),
    };
    if (currentUserAccountID) {
        API.write(types_1.WRITE_COMMANDS.UPDATE_SELECTED_TIMEZONE, parameters, {
            optimisticData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                    value: (_a = {},
                        _a[currentUserAccountID] = {
                            timezone: timezone,
                        },
                        _a),
                },
            ],
        });
    }
    Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_TIMEZONE);
}
/**
 * Fetches public profile info about a given user.
 * The API will only return the accountID, displayName, and avatar for the user
 * but the profile page will use other info (e.g. contact methods and pronouns) if they are already available in Onyx
 */
function openPublicProfilePage(accountID) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_METADATA,
            value: (_a = {},
                _a[accountID] = {
                    isLoading: true,
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_METADATA,
            value: (_b = {},
                _b[accountID] = {
                    isLoading: false,
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_METADATA,
            value: (_c = {},
                _c[accountID] = {
                    isLoading: false,
                },
                _c),
        },
    ];
    var parameters = { accountID: accountID };
    API.read(types_1.READ_COMMANDS.OPEN_PUBLIC_PROFILE_PAGE, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Updates the user's avatar image
 */
function updateAvatar(file) {
    var _a, _b, _c;
    var _d, _e, _f, _g;
    if (!currentUserAccountID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_a = {},
                _a[currentUserAccountID] = {
                    avatar: file.uri,
                    avatarThumbnail: file.uri,
                    originalFileName: file.name,
                    errorFields: {
                        avatar: null,
                    },
                    pendingFields: {
                        avatar: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        originalFileName: null,
                    },
                    fallbackIcon: file.uri,
                },
                _a),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_b = {},
                _b[currentUserAccountID] = {
                    pendingFields: {
                        avatar: null,
                    },
                },
                _b),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_c = {},
                _c[currentUserAccountID] = {
                    avatar: (_d = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _d === void 0 ? void 0 : _d.avatar,
                    avatarThumbnail: (_f = (_e = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _e === void 0 ? void 0 : _e.avatarThumbnail) !== null && _f !== void 0 ? _f : (_g = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _g === void 0 ? void 0 : _g.avatar,
                    pendingFields: {
                        avatar: null,
                    },
                },
                _c),
        },
    ];
    var parameters = { file: file };
    API.write(types_1.WRITE_COMMANDS.UPDATE_USER_AVATAR, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
/**
 * Replaces the user's avatar image with a default avatar
 */
function deleteAvatar() {
    var _a, _b;
    var _c, _d;
    if (!currentUserAccountID) {
        return;
    }
    // We want to use the old dot avatar here as this affects both platforms.
    var defaultAvatar = UserUtils.getDefaultAvatarURL(currentUserAccountID);
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_a = {},
                _a[currentUserAccountID] = {
                    avatar: defaultAvatar,
                    fallbackIcon: null,
                },
                _a),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
            value: (_b = {},
                _b[currentUserAccountID] = {
                    avatar: (_c = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _c === void 0 ? void 0 : _c.avatar,
                    fallbackIcon: (_d = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[currentUserAccountID]) === null || _d === void 0 ? void 0 : _d.fallbackIcon,
                },
                _b),
        },
    ];
    API.write(types_1.WRITE_COMMANDS.DELETE_USER_AVATAR, null, { optimisticData: optimisticData, failureData: failureData });
}
/**
 * Clear error and pending fields for the current user's avatar
 */
function clearAvatarErrors() {
    var _a;
    if (!currentUserAccountID) {
        return;
    }
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
        _a[currentUserAccountID] = {
            errorFields: {
                avatar: null,
            },
            pendingFields: {
                avatar: null,
            },
        },
        _a));
}
/**
 * Clear errors for the current user's personal details
 */
function clearPersonalDetailsErrors() {
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS, {
        errors: null,
    });
}
function updatePersonalDetailsAndShipExpensifyCards(values, validateCode) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var parameters = {
        legalFirstName: (_b = (_a = values.legalFirstName) === null || _a === void 0 ? void 0 : _a.trim()) !== null && _b !== void 0 ? _b : '',
        legalLastName: (_d = (_c = values.legalLastName) === null || _c === void 0 ? void 0 : _c.trim()) !== null && _d !== void 0 ? _d : '',
        phoneNumber: LoginUtils.appendCountryCode((_f = (_e = values.phoneNumber) === null || _e === void 0 ? void 0 : _e.trim()) !== null && _f !== void 0 ? _f : ''),
        addressCity: values.city.trim(),
        addressStreet: (_h = (_g = values.addressLine1) === null || _g === void 0 ? void 0 : _g.trim()) !== null && _h !== void 0 ? _h : '',
        addressStreet2: (_k = (_j = values.addressLine2) === null || _j === void 0 ? void 0 : _j.trim()) !== null && _k !== void 0 ? _k : '',
        addressZip: (_m = (_l = values.zipPostCode) === null || _l === void 0 ? void 0 : _l.trim().toUpperCase()) !== null && _m !== void 0 ? _m : '',
        addressCountry: values.country,
        addressState: values.state.trim(),
        dob: values.dob,
        validateCode: validateCode,
    };
    API.write(types_1.WRITE_COMMANDS.SET_PERSONAL_DETAILS_AND_SHIP_EXPENSIFY_CARDS, parameters, {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
                value: {
                    isLoading: true,
                },
            },
        ],
        finallyData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.PRIVATE_PERSONAL_DETAILS,
                value: {
                    isLoading: false,
                },
            },
        ],
    });
}
