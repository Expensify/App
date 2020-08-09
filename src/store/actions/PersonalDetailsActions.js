import _ from 'underscore';
import * as Store from '../Store';
import {request} from '../../lib/Network';
import STOREKEYS from '../STOREKEYS';
import md5 from '../../lib/md5';
import CONST from '../../CONST';

/**
 * Returns the URL for a user's avatar and handles someone not having any avatar at all
 *
 * @param {object} personalDetails
 * @param {string} login
 * @returns {string}
 */
function getAvatar(personalDetails, login) {
    if (personalDetails.detailJSON && personalDetails.detailJSON.avatar) {
        return personalDetails.detailJSON.avatar.replace(/&d=404$/, '');
    }

    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login (which is converted from HEX to INT)
    const loginHashBucket = (parseInt(md5(login).substring(0, 4), 16) % 8) + 1;
    return `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;
}

/**
 * Get the personal details for our organization
 *
 * @returns {Promise}
 */
function fetch() {
    let currentLogin;
    const requestPromise = Store.get(STOREKEYS.SESSION, 'email')
        .then((login) => {
            currentLogin = login;
            return request('Get', {
                returnValueList: 'personalDetailsList',
            });
        })
        .then((data) => {
            const allPersonalDetails = _.reduce(data.personalDetailsList, (finalPersonalDetailObject, personalDetails, login) => {
                // Form the details into something that has all the data in an easy to use format.
                const avatarURL = getAvatar(personalDetails, login);
                const firstName = personalDetails.firstName || '';
                const lastName = personalDetails.lastName || '';
                const fullName = `${firstName} ${lastName}`.trim();
                const displayName = fullName === '' ? login : fullName;
                const displayNameWithEmail = fullName === '' ? login : `${fullName} (${login})`;
                return {
                    ...finalPersonalDetailObject,
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
            const myPersonalDetails = allPersonalDetails[currentLogin];
            return Store.multiSet({
                [STOREKEYS.PERSONAL_DETAILS]: allPersonalDetails,
                [STOREKEYS.MY_PERSONAL_DETAILS]: myPersonalDetails,
            });
        });

    // Refresh the personal details every 30 minutes
    setTimeout(fetch, 1000 * 60 * 30);
    return requestPromise;
}

/**
 * Get the timezone of the logged in user
 *
 * @returns {Promise}
 */
function fetchTimezone() {
    const requestPromise = request('Get', {
        returnValueList: 'nameValuePairs',
        name: 'timeZone',
    })
        .then(data => Store.set(STOREKEYS.TIMEZONE, data.nameValuePairs.timeZone.selected || 'America/Los_Angeles'));

    // Refresh the timezone every 30 minutes
    setTimeout(fetchTimezone, 1000 * 60 * 30);
    return requestPromise;
}

export {
    fetch,
    fetchTimezone,
};
