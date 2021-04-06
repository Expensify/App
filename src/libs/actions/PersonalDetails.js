import _ from 'underscore';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import md5 from '../md5';
import CONST from '../../CONST';
import NetworkConnection from '../NetworkConnection';
import * as API from '../API';
import NameValuePair from './NameValuePair';

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
 * Helper method to return a default avatar
 *
 * @param {String} [login]
 * @returns {String}
 */
function getDefaultAvatar(login = '') {
    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login (which is converted from HEX to INT)
    const loginHashBucket = (parseInt(md5(login).substring(0, 4), 16) % 8) + 1;
    return `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;
}

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

    return getDefaultAvatar(login);
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
    const userDetails = personalDetail || personalDetails[login];

    if (!userDetails) {
        return userLogin;
    }

    if (userDetails.displayName) {
        return userDetails.displayName;
    }

    const firstName = userDetails.firstName || '';
    const lastName = userDetails.lastName || '';

    return (`${firstName} ${lastName}`).trim() || userLogin;
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

        return {
            ...finalObject,
            [login]: {
                login,
                avatar,
                displayName,
                pronouns,
                timezone,
            },
        };
    }, {});
}

/**
 * Get the personal details for our organization
 */
function fetch() {
    API.Get({
        returnValueList: 'personalDetailsList',
    })
        .then((data) => {
            let myPersonalDetails = {};

            // If personalDetailsList is empty, ensure we set the personal details for the current user
            const personalDetailsList = _.isEmpty(data.personalDetailsList)
                ? {[currentUserEmail]: myPersonalDetails}
                : data.personalDetailsList;
            const allPersonalDetails = formatPersonalDetails(personalDetailsList);
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, allPersonalDetails);

            myPersonalDetails = allPersonalDetails[currentUserEmail];

            // Add the first and last name to the current user's MY_PERSONAL_DETAILS key
            myPersonalDetails.firstName = lodashGet(data.personalDetailsList, [currentUserEmail, 'firstName'], '');
            myPersonalDetails.lastName = lodashGet(data.personalDetailsList, [currentUserEmail, 'lastName'], '');

            // Set my personal details so they can be easily accessed and subscribed to on their own key
            Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, myPersonalDetails);
        })
        .catch(error => console.debug('Error fetching personal details', error));
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
            const details = participantEmails
                .filter(login => !data[login])
                .reduce((previousDetails, login) => ({
                    ...previousDetails,
                    [login]: {}, // Simply just need the key to exist
                }), existingDetails);

            const formattedPersonalDetails = formatPersonalDetails(details);
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, formattedPersonalDetails);

            // The personalDetails of the participants contain their avatar images. Here we'll go over each
            // report and based on the participants we'll link up their avatars to report icons.
            const reportsToUpdate = {};
            _.each(reports, (report) => {
                if (report.participants.length > 0) {
                    const avatars = _.map(report.participants, dmParticipant => ({
                        firstName: lodashGet(details, [dmParticipant, 'firstName'], ''),
                        avatar: lodashGet(details, [dmParticipant, 'avatarThumbnail'], '')
                            || getDefaultAvatar(dmParticipant),
                    }))
                        .sort((first, second) => first.firstName - second.firstName)
                        .map(item => item.avatar);
                    const reportName = _.chain(report.participants)
                        .filter(participant => participant !== currentUserEmail)
                        .map(participant => lodashGet(
                            formattedPersonalDetails,
                            [participant, 'displayName'],
                            participant,
                        ))
                        .value()
                        .join(', ');

                    reportsToUpdate[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = {icons: avatars, reportName};
                }
            });

            // We use mergeCollection such that it updates ONYXKEYS.COLLECTION.REPORT in one go.
            // Any withOnyx subscribers to this key will also receive the complete updated props just once
            // than updating props for each report and re-rendering had merge been used.
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportsToUpdate);
        });
}


/**
 * Sets the personal details object for the current user
 *
 * @param {Object} details
 */
function setPersonalDetails(details) {
    API.PersonalDetails_Update({details: JSON.stringify(details)});

    if (details.timezone) {
        NameValuePair.set(CONST.NVP.TIMEZONE, details.timezone);
    }

    // Update the associated onyx keys
    Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, details);
    Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, formatPersonalDetails({[currentUserEmail]: details}));
}

/**
 * Sets the user's avatar image
 *
 * @param {File|Object} file
 */
function setAvatar(file) {
    API.User_UploadAvatar({file}).then((response) => {
        // Once we get the s3url back, update the personal details for the user with the new avatar URL
        if (response.jsonCode === 200) {
            setPersonalDetails({avatar: response.s3url});
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

    // Set onyx value to default avatar
    Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, {
        avatar: getDefaultAvatar(login),
    });
}

// When the app reconnects from being offline, fetch all of the personal details
NetworkConnection.onReconnect(fetch);

export {
    fetch,
    getFromReportParticipants,
    getDisplayName,
    getDefaultAvatar,
    setPersonalDetails,
    setAvatar,
    deleteAvatar,
};
