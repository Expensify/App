import _ from 'underscore';
import lodashGet from 'lodash.get';
import Ion from '../Ion';
import {onReconnect, queueRequest} from '../API';
import IONKEYS from '../../IONKEYS';
import md5 from '../md5';
import CONST from '../../CONST';

let currentUserEmail;
Ion.connect({
    key: IONKEYS.SESSION,
    callback: val => currentUserEmail = val ? val.email : null,
});

let personalDetails;
Ion.connect({
    key: IONKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = val,
});

/**
 * Returns the URL for a user's avatar and handles someone not having any avatar at all
 *
 * @param {object} personalDetail
 * @param {string} login
 * @returns {string}
 */
function getAvatar(personalDetail, login) {
    if (personalDetail && personalDetail.avatar) {
        return personalDetail.avatar.replace(/&d=404$/, '');
    }

    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login (which is converted from HEX to INT)
    const loginHashBucket = (parseInt(md5(login).substring(0, 4), 16) % 8) + 1;
    return `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;
}

/**
 * Returns the displayName for a user
 *
 * @param {string} login
 * @param {object} [personalDetail]
 * @returns {string}
 */
function getDisplayName(login, personalDetail) {
    const userDetails = personalDetail || personalDetails[login];

    if (!userDetails) {
        return login;
    }

    const firstName = userDetails.firstName || '';
    const lastName = userDetails.lastName || '';

    return (`${firstName} ${lastName}`).trim() || login;
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
        const firstName = personalDetailsResponse.firstName || '';
        const lastName = personalDetailsResponse.lastName || '';
        const fullName = `${firstName} ${lastName}`.trim();
        const displayName = getDisplayName(login, personalDetailsResponse);
        const displayNameWithEmail = fullName === '' ? login : `${fullName} (${login})`;
        return {
            ...finalObject,
            [login]: {
                login,
                avatarURL,
                firstName,
                lastName,
                fullName,
                displayName,
                displayNameWithEmail,
            }
        };
    }, {});
}

/**
 * Get the timezone of the logged in user
 */
function fetchTimezone() {
    queueRequest('Get', {
        returnValueList: 'nameValuePairs',
        name: 'timeZone',
    })
        .then((data) => {
            const timezone = lodashGet(data, 'nameValuePairs.timeZone.selected', 'America/Los_Angeles');
            Ion.merge(IONKEYS.MY_PERSONAL_DETAILS, {timezone});
        });

    // Refresh the timezone every 30 minutes
    setTimeout(fetchTimezone, 1000 * 60 * 30);
}

/**
 * Get the personal details for our organization
 */
function fetch() {
    queueRequest('Get', {
        returnValueList: 'personalDetailsList',
    })
        .then((data) => {
            const allPersonalDetails = formatPersonalDetails(data.personalDetailsList);
            Ion.merge(IONKEYS.PERSONAL_DETAILS, allPersonalDetails);

            // Get my personal details so they can be easily accessed and subscribed to on their own key
            Ion.merge(IONKEYS.MY_PERSONAL_DETAILS, allPersonalDetails[currentUserEmail] || {});

            // Get the timezone and put it in Ion
            fetchTimezone();
        })
        .catch(error => console.error('Error fetching personal details', error));

    // Refresh the personal details every 30 minutes
    setTimeout(fetch, 1000 * 60 * 30);
}

/**
 * Get personal details for a list of emails.
 *
 * @param {String} emailList
 */
function getForEmails(emailList) {
    queueRequest('PersonalDetails_GetForEmails', {emailList})
        .then((data) => {
            const details = _.omit(data, ['jsonCode', 'requestID']);
            const formattedDetails = formatPersonalDetails(details);
            Ion.merge(IONKEYS.PERSONAL_DETAILS, formattedDetails);
        });
}

// When the app reconnects from being offline, fetch all of the personal details
onReconnect(fetch);

export {
    fetch,
    fetchTimezone,
    getForEmails,
    getDisplayName,
};
