import _ from 'underscore';
import lodashGet from 'lodash/get';
import lodashMerge from 'lodash/merge';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import NetworkConnection from '../NetworkConnection';
import * as API from '../API';
import NameValuePair from './NameValuePair';
import * as ReportUtils from '../reportUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import Growl from '../Growl';
import * as Localize from '../Localize';
import * as ValidationUtils from '../ValidationUtils';

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
 * Returns the URL for a user's avatar and handles someone not having any avatar at all
 *
 * @param {Object} personalDetail
 * @param {String} login
 * @returns {String}
 */
function getAvatar(personalDetail, login) {
    if (personalDetail && personalDetail.avatarThumbnail) {
        return personalDetail.avatarThumbnail;
    }

    return OptionsListUtils.getDefaultAvatar(login);
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
 * Returns object with first and last name errors. If either are valid,
 * those errors get returned as empty strings.
 *
 * @param {String} firstName
 * @param {String} lastName
 * @returns {Object}
 */
function getFirstAndLastNameErrors(firstName, lastName) {
    return {
        firstNameError: ValidationUtils.isValidLengthForFirstOrLastName(firstName) ? '' : Localize.translateLocal('personalDetails.error.firstNameLength'),
        lastNameError: ValidationUtils.isValidLengthForFirstOrLastName(lastName) ? '' : Localize.translateLocal('personalDetails.error.lastNameLength'),
    };
}

/**
 * Format personal details
 *
 * @param {Object} personalDetailsList
 * @return {Object}
 */
function formatPersonalDetails(personalDetailsList) {
    return _.reduce(personalDetailsList, (finalObject, personalDetailsResponse, login) => {
        // Form the details into something that has all the data in an easy to use format.
        const avatar = getAvatar(personalDetailsResponse, login);
        const displayName = getDisplayName(login, personalDetailsResponse);
        const pronouns = lodashGet(personalDetailsResponse, 'pronouns', '');
        const timezone = lodashGet(personalDetailsResponse, 'timeZone', CONST.DEFAULT_TIME_ZONE);
        const firstName = lodashGet(personalDetailsResponse, 'firstName', '');
        const lastName = lodashGet(personalDetailsResponse, 'lastName', '');
        const payPalMeAddress = lodashGet(personalDetailsResponse, 'expensify_payPalMeAddress', '');
        const phoneNumber = lodashGet(personalDetailsResponse, 'phoneNumber', '');

        return {
            ...finalObject,
            [login]: {
                login,
                avatar,
                displayName,
                firstName,
                lastName,
                pronouns,
                timezone,
                payPalMeAddress,
                phoneNumber,
            },
        };
    }, {});
}

/**
 * Get the personal details for our organization
 * @returns {Promise}
 */
function fetchPersonalDetails() {
    return API.Get({
        returnValueList: 'personalDetailsList',
    })
        .then((data) => {
            let myPersonalDetails = {};

            // If personalDetailsList does not have the current user ensure we initialize their details with an empty
            // object at least
            const personalDetailsList = _.isEmpty(data.personalDetailsList) ? {} : data.personalDetailsList;
            if (!personalDetailsList[currentUserEmail]) {
                personalDetailsList[currentUserEmail] = {};
            }

            const allPersonalDetails = formatPersonalDetails(personalDetailsList);
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, allPersonalDetails);

            myPersonalDetails = allPersonalDetails[currentUserEmail];

            // Add the first and last name to the current user's MY_PERSONAL_DETAILS key
            myPersonalDetails.firstName = lodashGet(data.personalDetailsList, [currentUserEmail, 'firstName'], '');
            myPersonalDetails.lastName = lodashGet(data.personalDetailsList, [currentUserEmail, 'lastName'], '');

            // Set my personal details so they can be easily accessed and subscribed to on their own key
            Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, myPersonalDetails);
        });
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

    API.PersonalDetails_GetForEmails({emailList: participantEmails.join(',')})
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
                if (report.participants.length <= 0 && !ReportUtils.isDefaultRoom(report)) {
                    return;
                }

                const avatars = OptionsListUtils.getReportIcons(report, details);
                const reportName = ReportUtils.isDefaultRoom(report)
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

                reportsToUpdate[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = {icons: avatars, reportName};
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

    // Update the associated Onyx keys
    Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, mergedDetails);
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, {[currentUserEmail]: mergedDetails});
}

/**
 * Sets the personal details object for the current user
 *
 * @param {Object} details
 * @param {boolean} shouldGrowl
 */
function setPersonalDetails(details, shouldGrowl) {
    API.PersonalDetails_Update({details: JSON.stringify(details)})
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
            }
        }).catch((error) => {
            console.debug('Error while setting personal details', error);
        });
}

/**
 * Sets the onyx with the currency list from the network
 * @returns {Object}
 */
function getCurrencyList() {
    return API.GetCurrencyList()
        .then((data) => {
            const currencyListObject = JSON.parse(data.currencyList);
            Onyx.merge(ONYXKEYS.CURRENCY_LIST, currencyListObject);
            return currencyListObject;
        });
}

/**
 * Fetches the local currency based on location and sets currency code/symbol to local storage
 */
function fetchLocalCurrency() {
    const coords = {};
    let currency = '';

    Onyx.merge(ONYXKEYS.IOU, {
        isRetrievingCurrency: true,
    });

    API.GetLocalCurrency({...coords})
        .then((data) => {
            currency = data.currency;
        })
        .then(getCurrencyList)
        .then(() => {
            Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, {localCurrencyCode: currency});
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.IOU, {
                isRetrievingCurrency: false,
            });
        });
}

/**
 * Sets the user's avatar image
 *
 * @param {File|Object} file
 */
function setAvatar(file) {
    setPersonalDetails({avatarUploading: true});
    API.User_UploadAvatar({file})
        .then((response) => {
            // Once we get the s3url back, update the personal details for the user with the new avatar URL
            if (response.jsonCode !== 200) {
                const error = new Error();
                error.jsonCode = response.jsonCode;
                throw error;
            }
            setPersonalDetails({avatar: response.s3url, avatarUploading: false}, true);
        })
        .catch((error) => {
            setPersonalDetails({avatarUploading: false});
            if (error.jsonCode === 405 || error.jsonCode === 502) {
                Growl.show(Localize.translateLocal('profilePage.invalidFileMessage'), CONST.GROWL.ERROR, 3000);
            } else {
                Growl.show(Localize.translateLocal('profilePage.avatarUploadFailureMessage'), CONST.GROWL.ERROR, 3000);
            }
        });
}

/**
 * Deletes the user's avatar image
 *
 * @param {String} login
 */
function deleteAvatar(login) {
    // We don't want to save the default avatar URL in the backend since we don't want to allow
    // users the option of removing the default avatar, instead we'll save an empty string
    API.PersonalDetails_Update({details: JSON.stringify({avatar: ''})});
    mergeLocalPersonalDetails({avatar: OptionsListUtils.getDefaultAvatar(login)});
    Growl.show(Localize.translateLocal('profilePage.growlMessageOnSave'), CONST.GROWL.SUCCESS, 3000);
}

// When the app reconnects from being offline, fetch all of the personal details
NetworkConnection.onReconnect(fetchPersonalDetails);

export {
    fetchPersonalDetails,
    formatPersonalDetails,
    getFromReportParticipants,
    getDisplayName,
    getFirstAndLastNameErrors,
    setPersonalDetails,
    setAvatar,
    deleteAvatar,
    fetchLocalCurrency,
    getCurrencyList,
};
