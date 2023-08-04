import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as API from '../API';
import * as UserUtils from '../UserUtils';
import * as LocalePhoneNumber from '../LocalePhoneNumber';
import ROUTES from '../../ROUTES';
import Navigation from '../Navigation/Navigation';

let currentUserEmail = '';
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val ? val.email : '';
        currentUserAccountID = val ? val.accountID : -1;
    },
});

let allPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = val),
});

let privatePersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
    callback: (val) => (privatePersonalDetails = val),
});

/**
 * Returns the displayName for a user
 *
 * @param {String} login
 * @param {Object} [personalDetail]
 * @returns {String}
 */
function getDisplayName(login, personalDetail) {
    // If we have a number like +15857527441@expensify.sms then let's remove @expensify.sms and format it
    // so that the option looks cleaner in our UI.
    const userLogin = LocalePhoneNumber.formatPhoneNumber(login);
    const userDetails = personalDetail || lodashGet(allPersonalDetails, login);

    if (!userDetails) {
        return userLogin;
    }

    const firstName = userDetails.firstName || '';
    const lastName = userDetails.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();

    return fullName || userLogin;
}

/**
 * @param {String} userAccountIDOrLogin
 * @param {String} [defaultDisplayName] display name to use if user details don't exist in Onyx or if
 *                                      found details don't include the user's displayName or login
 * @returns {String}
 */
function getDisplayNameForTypingIndicator(userAccountIDOrLogin, defaultDisplayName = '') {
    // Try to convert to a number, which means we have an accountID
    const accountID = Number(userAccountIDOrLogin);

    // If the user is typing on OldDot, userAccountIDOrLogin will be a string (the user's login),
    // so Number(string) is NaN. Search for personalDetails by login to get the display name.
    if (_.isNaN(accountID)) {
        const detailsByLogin = _.findWhere(allPersonalDetails, {login: userAccountIDOrLogin}) || {};
        return detailsByLogin.displayName || userAccountIDOrLogin;
    }

    const detailsByAccountID = lodashGet(allPersonalDetails, accountID, {});
    return detailsByAccountID.displayName || detailsByAccountID.login || defaultDisplayName;
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
function extractFirstAndLastNameFromAvailableDetails({login, displayName, firstName, lastName}) {
    if (firstName || lastName) {
        return {firstName: firstName || '', lastName: lastName || ''};
    }
    if (login && Str.removeSMSDomain(login) === displayName) {
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
    return _.findKey(CONST.ALL_COUNTRIES, (country) => country === countryName) || '';
}

/**
 * @param {String} pronouns
 */
function updatePronouns(pronouns) {
    API.write(
        'UpdatePronouns',
        {pronouns},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            pronouns,
                        },
                    },
                },
            ],
        },
    );
    Navigation.goBack(ROUTES.SETTINGS_PROFILE);
}

/**
 * @param {String} firstName
 * @param {String} lastName
 */
function updateDisplayName(firstName, lastName) {
    API.write(
        'UpdateDisplayName',
        {firstName, lastName},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            firstName,
                            lastName,
                            displayName: getDisplayName(currentUserEmail, {
                                firstName,
                                lastName,
                            }),
                        },
                    },
                },
            ],
        },
    );
    Navigation.goBack(ROUTES.SETTINGS_PROFILE);
}

/**
 * @param {String} legalFirstName
 * @param {String} legalLastName
 */
function updateLegalName(legalFirstName, legalLastName) {
    API.write(
        'UpdateLegalName',
        {legalFirstName, legalLastName},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                    value: {
                        legalFirstName,
                        legalLastName,
                    },
                },
            ],
        },
    );
    Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS);
}

/**
 * @param {String} dob - date of birth
 */
function updateDateOfBirth({dob}) {
    API.write(
        'UpdateDateOfBirth',
        {dob},
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
                    value: {
                        dob,
                    },
                },
            ],
        },
    );
    Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS);
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
    const parameters = {
        homeAddressStreet: street,
        addressStreet2: street2,
        homeAddressCity: city,
        addressState: state,
        addressZipCode: zip,
        addressCountry: country,
    };

    // State names for the United States are in the form of two-letter ISO codes
    // State names for other countries except US have full names, so we provide two different params to be handled by server
    if (country !== CONST.COUNTRY.US) {
        parameters.addressStateLong = state;
    }
    API.write('UpdateHomeAddress', parameters, {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
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
            },
        ],
    });
    Navigation.goBack(ROUTES.SETTINGS_PERSONAL_DETAILS);
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
    API.write(
        'UpdateAutomaticTimezone',
        {
            timezone: JSON.stringify(timezone),
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            timezone,
                        },
                    },
                },
            ],
        },
    );
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
    API.write(
        'UpdateSelectedTimezone',
        {
            timezone: JSON.stringify(timezone),
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                    value: {
                        [currentUserAccountID]: {
                            timezone,
                        },
                    },
                },
            ],
        },
    );
    Navigation.goBack(ROUTES.SETTINGS_TIMEZONE);
}

/**
 * Fetches additional personal data like legal name, date of birth, address
 */
function openPersonalDetailsPage() {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: true,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PRIVATE_PERSONAL_DETAILS,
            value: {
                isLoading: false,
            },
        },
    ];

    API.read('OpenPersonalDetailsPage', {}, {optimisticData, successData, failureData});
}

/**
 * Fetches public profile info about a given user.
 * The API will only return the accountID, displayName, and avatar for the user
 * but the profile page will use other info (e.g. contact methods and pronouns) if they are already available in Onyx
 * @param {Number} accountID
 */
function openPublicProfilePage(accountID) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    isLoading: true,
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    isLoading: false,
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [accountID]: {
                    isLoading: false,
                },
            },
        },
    ];
    API.read('OpenPublicProfilePage', {accountID}, {optimisticData, successData, failureData});
}

/**
 * Updates the user's avatar image
 *
 * @param {File|Object} file
 */
function updateAvatar(file) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: file.uri,
                    avatarThumbnail: file.uri,
                    originalFileName: file.name,
                    errorFields: {
                        avatar: null,
                    },
                    pendingFields: {
                        avatar: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        originalFileName: null,
                    },
                },
            },
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    pendingFields: {
                        avatar: null,
                    },
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: allPersonalDetails[currentUserAccountID].avatar,
                    avatarThumbnail: allPersonalDetails[currentUserAccountID].avatarThumbnail || allPersonalDetails[currentUserAccountID].avatar,
                    pendingFields: {
                        avatar: null,
                    },
                },
            },
        },
    ];

    API.write('UpdateUserAvatar', {file}, {optimisticData, successData, failureData});
}

/**
 * Replaces the user's avatar image with a default avatar
 */
function deleteAvatar() {
    // We want to use the old dot avatar here as this affects both platforms.
    const defaultAvatar = UserUtils.getDefaultAvatarURL(currentUserAccountID);

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: defaultAvatar,
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [currentUserAccountID]: {
                    avatar: allPersonalDetails[currentUserAccountID].avatar,
                },
            },
        },
    ];

    API.write('DeleteUserAvatar', {}, {optimisticData, failureData});
}

/**
 * Clear error and pending fields for the current user's avatar
 */
function clearAvatarErrors() {
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
        [currentUserAccountID]: {
            errorFields: {
                avatar: null,
            },
            pendingFields: {
                avatar: null,
            },
        },
    });
}

/**
 * Get private personal details value
 * @returns {Object}
 */
function getPrivatePersonalDetails() {
    return privatePersonalDetails;
}

export {
    getDisplayName,
    getDisplayNameForTypingIndicator,
    updateAvatar,
    deleteAvatar,
    openPersonalDetailsPage,
    openPublicProfilePage,
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
    getPrivatePersonalDetails,
};
