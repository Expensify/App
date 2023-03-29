import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

let currentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => currentUserEmail = val ? val.email : '',
});

let personalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = val,
});

/**
 * Returns the displayName for a user
 *
 * @param {String} login
 * @param {Object} [personalDetail]
 * @returns {String}
 */
function getDisplayName(login, personalDetail) {
    // If we have a number like +15857527441@expensify.sms then let's remove @expensify.sms
    // so that the option looks cleaner in our UI.
    const userLogin = Str.removeSMSDomain(login);
    const userDetails = personalDetail || lodashGet(personalDetails, login);

    if (!userDetails) {
        return userLogin;
    }

    const firstName = userDetails.firstName || '';
    const lastName = userDetails.lastName || '';
    const fullName = (`${firstName} ${lastName}`).trim();

    return fullName || userLogin;
}

/**
 * Gets the first and last name from the user's personal details.
 * If the login is the same as the displayName, then they don't exist,
 * so we return empty strings instead.
 * @param {Object} personalDetail
 * @param {String} personalDetail.login
 * @param {String} personalDetail.displayName
 * @param {String} personalDetail.firstName
 * @param {String} personalDetail.lastName
 *
 * @returns {Object}
 */
function extractFirstAndLastNameFromAvailableDetails({
    login,
    displayName,
    firstName,
    lastName,
}) {
    if (firstName || lastName) {
        return {firstName: firstName || '', lastName: lastName || ''};
    }
    if (Str.removeSMSDomain(login) === displayName) {
        return {firstName: '', lastName: ''};
    }

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

/**
 * Convert country names obtained from the backend to their respective ISO codes
 * This is for backward compatibility of stored data before E/App#15507
 * @param {String} countryName
 * @returns {String}
 */
function getCountryISO(countryName) {
    if (_.isEmpty(countryName) || countryName.length === 2) {
        return countryName;
    }
    return _.findKey(CONST.ALL_COUNTRIES, country => country === countryName) || '';
}

/**
 * @param {String} pronouns
 */
function updatePronouns(pronouns) {
    API.write('UpdatePronouns', {pronouns}, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    pronouns,
                },
            },
        }],
    });
    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
}

/**
 * @param {String} firstName
 * @param {String} lastName
 */
function updateDisplayName(firstName, lastName) {
    API.write('UpdateDisplayName', {firstName, lastName}, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    firstName,
                    lastName,
                    displayName: getDisplayName(currentUserEmail, {
                        firstName,
                        lastName,
                    }),
                },
            },
        }],
    });
    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
}

/**
 * @param {String} legalFirstName
 * @param {String} legalLastName
 */
function updateLegalName(legalFirstName, legalLastName) {
    API.write('UpdateLegalName', {legalFirstName, legalLastName}, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                legalFirstName,
                legalLastName,
            },
        }],
    });
    Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

/**
 * @param {String} dob - date of birth
 */
function updateDateOfBirth(dob) {
    API.write('UpdateDateOfBirth', {dob}, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                dob,
            },
        }],
    });
    Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

/**
 * @param {String} street
 * @param {String} street2
 * @param {String} city
 * @param {String} state
 * @param {String} zip
 * @param {String} country
 */
function updateAddress(street, street2, city, state, zip, country) {
    API.write('UpdateHomeAddress', {
        addressStreet: street,
        addressStreet2: street2,
        addressCity: city,
        addressState: state,
        addressZipCode: zip,
        addressCountry: country,
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                address: {
                    street: `${street}\n${street2}`,
                    city,
                    state,
                    zip,
                    country,
                },
            },
        }],
    });
    Navigation.navigate(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

/**
 * Updates timezone's 'automatic' setting, and updates
 * selected timezone if set to automatically update.
 *
 * @param {Object} timezone
 * @param {Boolean} timezone.automatic
 * @param {String} timezone.selected
 */
function updateAutomaticTimezone(timezone) {
    API.write('UpdateAutomaticTimezone', {
        timezone: JSON.stringify(timezone),
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    timezone,
                },
            },
        }],
    });
}

/**
 * Updates user's 'selected' timezone, then navigates to the
 * initial Timezone page.
 *
 * @param {String} selectedTimezone
 */
function updateSelectedTimezone(selectedTimezone) {
    const timezone = {
        selected: selectedTimezone,
    };
    API.write('UpdateSelectedTimezone', {
        timezone: JSON.stringify(timezone),
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    timezone,
                },
            },
        }],
    });
    Navigation.navigate(ROUTES.SETTINGS_TIMEZONE);
}

/**
 * Fetches the local currency based on location and sets currency code/symbol to Onyx
 */
function openIOUModalPage() {
    API.read('OpenIOUModalPage');
}

/**
 * Fetches additional personal data like legal name, date of birth, address
 */
function openPersonalDetailsPage() {
    API.read('OpenPersonalDetailsPage');
}

/**
 * Updates the user's avatar image
 *
 * @param {File|Object} file
 */
function updateAvatar(file) {
    const optimisticData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS,
        value: {
            [currentUserEmail]: {
                avatar: file.uri,
                avatarThumbnail: file.uri,
                errorFields: {
                    avatar: null,
                },
                pendingFields: {
                    avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    }];
    const successData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS,
        value: {
            [currentUserEmail]: {
                pendingFields: {
                    avatar: null,
                },
            },
        },
    }];
    const failureData = [{
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: ONYXKEYS.PERSONAL_DETAILS,
        value: {
            [currentUserEmail]: {
                avatar: personalDetails[currentUserEmail].avatar,
                avatarThumbnail: personalDetails[currentUserEmail].avatarThumbnail || personalDetails[currentUserEmail].avatar,
                pendingFields: {
                    avatar: null,
                },
            },
        },
    }];

    API.write('UpdateUserAvatar', {file}, {optimisticData, successData, failureData});
}

/**
 * Replaces the user's avatar image with a default avatar
 */
function deleteAvatar() {
    // We want to use the old dot avatar here as this affects both platforms.
    const defaultAvatar = ReportUtils.getOldDotDefaultAvatar(currentUserEmail);

    API.write('DeleteUserAvatar', {}, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    avatar: defaultAvatar,
                },
            },
        }],
        failureData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    avatar: personalDetails[currentUserEmail].avatar,
                },
            },
        }],
    });
}

/**
 * Clear error and pending fields for the current user's avatar
 */
function clearAvatarErrors() {
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, {
        [currentUserEmail]: {
            errorFields: {
                avatar: null,
            },
            pendingFields: {
                avatar: null,
            },
        },
    });
}

export {
    getDisplayName,
    updateAvatar,
    deleteAvatar,
    openIOUModalPage,
    openPersonalDetailsPage,
    extractFirstAndLastNameFromAvailableDetails,
    updateDisplayName,
    updateLegalName,
    updateDateOfBirth,
    updateAddress,
    updatePronouns,
    clearAvatarErrors,
    updateAutomaticTimezone,
    updateSelectedTimezone,
    getCountryISO,
};
