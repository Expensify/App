import _ from 'underscore';
import lodashGet from 'lodash.get';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import md5 from '../md5';
import CONST from '../../CONST';
import NetworkConnection from '../NetworkConnection';
import * as API from '../API';

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
    if (personalDetail && personalDetail.avatar) {
        return personalDetail.avatar.replace(/&d=404$/, '');
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
        const avatarURL = getAvatar(personalDetailsResponse, login);
        const displayName = getDisplayName(login, personalDetailsResponse);
        return {
            ...finalObject,
            [login]: {
                login,
                avatarURL,
                displayName,
            },
        };
    }, {});
}

/**
 * Get the timezone of the logged in user
 */
function fetchTimezone() {
    API.Get({
        returnValueList: 'nameValuePairs',
        name: 'timeZone',
    })
        .then((data) => {
            const timezone = lodashGet(data, 'nameValuePairs.timeZone.selected', 'America/Los_Angeles');
            Onyx.merge(ONYXKEYS.MY_PERSONAL_DETAILS, {timezone});
        })
        .catch(error => console.debug('Error fetching user timezone', error));
}

/**
 * Get the personal details for our organization
 */
function fetch() {
    API.Get({
        returnValueList: 'personalDetailsList',
    })
        .then((data) => {
            const allPersonalDetails = formatPersonalDetails(data.personalDetailsList);
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, allPersonalDetails);

            const myPersonalDetails = allPersonalDetails[currentUserEmail]
                || {avatarURL: getAvatar(undefined, currentUserEmail)};

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
            const details = _.pick(data, participantEmails);
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS, formatPersonalDetails(details));

            // The personalDetails of the participants contain their avatar images. Here we'll go over each
            // report and based on the participants we'll link up their avatars to report icons.
            const reportsToUpdate = {};
            _.each(reports, (report) => {
                if (report.participants.length > 0) {
                    const avatars = _.map(report.participants, dmParticipant => ({
                        firstName: lodashGet(details, [dmParticipant, 'firstName'], ''),
                        avatar: lodashGet(details, [dmParticipant, 'avatar'], '') || getDefaultAvatar(dmParticipant),
                    }))
                        .sort((first, second) => first.firstName - second.firstName)
                        .map(item => item.avatar);

                    reportsToUpdate[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = {icons: avatars};
                }
            });

            // We use mergeCollection such that it updates ONYXKEYS.COLLECTION.REPORT in one go.
            // Any withOnyx subscribers to this key will also receive the complete updated props just once
            // than updating props for each report and re-rendering had merge been used.
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportsToUpdate);
        });
}

// When the app reconnects from being offline, fetch all of the personal details
NetworkConnection.onReconnect(fetch);

export {
    fetch,
    fetchTimezone,
    getFromReportParticipants,
    getDisplayName,
    getDefaultAvatar,
};
