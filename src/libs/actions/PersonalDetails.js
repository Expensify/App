import _ from 'underscore';
import lodashGet from 'lodash/get';
import lodashMerge from 'lodash/merge';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as API from '../API';
import * as DeprecatedAPI from '../deprecatedAPI';
import NameValuePair from './NameValuePair';
import * as LoginUtils from '../LoginUtils';
import * as ReportUtils from '../ReportUtils';
import Growl from '../Growl';
import * as Localize from '../Localize';
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
 * Returns the URL for a user's avatar thumbnail and handles someone not having any avatar at all
 *
 * @param {Object} personalDetail
 * @param {String} login
 * @returns {String}
 */
function getAvatarThumbnail(personalDetail, login) {
    if (personalDetail && personalDetail.avatarThumbnail) {
        return personalDetail.avatarThumbnail;
    }

    return ReportUtils.getDefaultAvatar(login);
}

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
 * Returns max character error text if true.
 *
 * @param {Boolean} isError
 * @returns {String}
 */
function getMaxCharacterError(isError) {
    return isError ? Localize.translateLocal('personalDetails.error.characterLimit', {limit: CONST.FORM_CHARACTER_LIMIT}) : '';
}

/**
 * Format personal details
 *
 * @param {Object} personalDetailsList
 * @return {Object}
 */
function formatPersonalDetails(personalDetailsList) {
    const formattedResult = {};

    // This method needs to be SUPER PERFORMANT because it can be called with a massive list of logins depending on the policies that someone belongs to
    // eslint-disable-next-line rulesdir/prefer-underscore-method
    Object.entries(personalDetailsList).forEach(([login, details]) => {
        const sanitizedLogin = LoginUtils.getEmailWithoutMergedAccountPrefix(login);

        // Form the details into something that has all the data in an easy to use format.
        const displayName = getDisplayName(sanitizedLogin, details);
        const pronouns = details.pronouns || '';
        const timezone = details.timeZone || CONST.DEFAULT_TIME_ZONE;
        const firstName = details.firstName || '';
        const lastName = details.lastName || '';
        const payPalMeAddress = details.expensify_payPalMeAddress || '';
        const phoneNumber = details.phoneNumber || '';
        const avatar = details.avatar || details.avatarThumbnail || ReportUtils.getDefaultAvatar(login);
        const avatarThumbnail = getAvatarThumbnail(details, sanitizedLogin);
        const validated = details.validated || false;
        formattedResult[sanitizedLogin] = {
            login: sanitizedLogin,
            displayName,
            firstName,
            lastName,
            pronouns,
            timezone,
            payPalMeAddress,
            phoneNumber,
            avatar,
            avatarThumbnail,
            validated,
        };
    });
    return formattedResult;
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
 * Get personal details from report participants.
 *
 * @param {Object} reports
 */
function getFromReportParticipants(reports) {
    const participantEmails = _.chain(reports)
        .pluck('participants')
        .flatten()
        .unique()
        .value();

    if (participantEmails.length === 0) {
        return;
    }

    DeprecatedAPI.PersonalDetails_GetForEmails({emailList: participantEmails.join(',')})
        .then((data) => {
            const existingDetails = _.pick(data, participantEmails);

            // Fallback to add logins that don't appear in the response
            const details = _.chain(participantEmails)
                .filter(login => !data[login])
                .reduce((previousDetails, login) => ({
                    ...previousDetails,
                    [login]: {}, // Simply just need the key to exist
                }), existingDetails)
                .value();

            const formattedPersonalDetails = formatPersonalDetails(details);
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, formattedPersonalDetails);

            // The personalDetails of the participants contain their avatar images. Here we'll go over each
            // report and based on the participants we'll link up their avatars to report icons. This will
            // skip over default rooms which aren't named by participants.
            const reportsToUpdate = {};
            _.each(reports, (report) => {
                if (report.participants.length <= 0 && !ReportUtils.isChatRoom(report) && !ReportUtils.isPolicyExpenseChat(report)) {
                    return;
                }

                const reportName = (ReportUtils.isChatRoom(report) || ReportUtils.isPolicyExpenseChat(report))
                    ? report.reportName
                    : _.chain(report.participants)
                        .filter(participant => participant !== currentUserEmail)
                        .map(participant => lodashGet(
                            formattedPersonalDetails,
                            [participant, 'displayName'],
                            participant,
                        ))
                        .value()
                        .join(', ');

                reportsToUpdate[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = {reportName};
            });

            // We use mergeCollection such that it updates ONYXKEYS.COLLECTION.REPORT in one go.
            // Any withOnyx subscribers to this key will also receive the complete updated props just once
            // than updating props for each report and re-rendering had merge been used.
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportsToUpdate);
        });
}

/**
 * Merges partial details object into the local store.
 *
 * @param {Object} details
 * @private
 */
function mergeLocalPersonalDetails(details) {
    // We are merging the partial details provided to this method with the existing details we have for the user so
    // that we don't overwrite any values that may exist in storage.
    const mergedDetails = lodashMerge(personalDetails[currentUserEmail], details);

    // displayName is a generated field so we'll use the firstName and lastName + login to update it.
    mergedDetails.displayName = getDisplayName(currentUserEmail, mergedDetails);

    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, {[currentUserEmail]: mergedDetails});
}

/**
 * Sets the personal details object for the current user
 *
 * @param {Object} details
 * @param {boolean} shouldGrowl
 */
function setPersonalDetails(details, shouldGrowl) {
    DeprecatedAPI.PersonalDetails_Update({details: JSON.stringify(details)})
        .then((response) => {
            if (response.jsonCode === 200) {
                if (details.timezone) {
                    NameValuePair.set(CONST.NVP.TIMEZONE, details.timezone);
                }
                mergeLocalPersonalDetails(details);

                if (shouldGrowl) {
                    Growl.show(Localize.translateLocal('profilePage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
                }
            } else if (response.jsonCode === 400) {
                Growl.error(Localize.translateLocal('personalDetails.error.firstNameLength'), 3000);
            } else if (response.jsonCode === 401) {
                Growl.error(Localize.translateLocal('personalDetails.error.lastNameLength'), 3000);
            } else {
                console.debug('Error while setting personal details', response);
            }
        });
}

/**
 * @param {String} firstName
 * @param {String} lastName
 * @param {String} pronouns
 * @param {Object} timezone
 */
function updateProfile(firstName, lastName, pronouns, timezone) {
    API.write('UpdateProfile', {
        firstName,
        lastName,
        pronouns,
        timezone: JSON.stringify(timezone),
    }, {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {
                [currentUserEmail]: {
                    firstName,
                    lastName,
                    pronouns,
                    timezone,
                    displayName: getDisplayName(currentUserEmail, {
                        firstName,
                        lastName,
                    }),
                },
            },
        }],
    });
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
 * Fetches the local currency based on location and sets currency code/symbol to Onyx
 */
function openIOUModalPage() {
    API.read('OpenIOUModalPage');
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
    const defaultAvatar = ReportUtils.getDefaultAvatar(currentUserEmail);

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
    formatPersonalDetails,
    getFromReportParticipants,
    getDisplayName,
    setPersonalDetails,
    updateAvatar,
    deleteAvatar,
    openIOUModalPage,
    getMaxCharacterError,
    extractFirstAndLastNameFromAvailableDetails,
    updateProfile,
    updateDisplayName,
    updatePronouns,
    clearAvatarErrors,
};
