import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../CONST';
import hashCode from './hashCode';
import * as Expensicons from '../components/Icon/Expensicons';
import * as defaultAvatars from '../components/Icon/DefaultAvatars';

/**
 * Searches through given loginList for any contact method / login with an error.
 *
 * Example that should return false:
 * {{
 *      test@test.com: {
 *          errorFields: {
 *              validateCodeSent: null
 *          }
 *      }
 * }}
 *
 * Example that should return true:
 * {{
 *      test@test.com: {
 *          errorFields: {
 *              validateCodeSent: { 18092081290: 'An error' }
 *          }
 *      }
 * }}
 *
 * @param {Object} loginList
 * @param {Object} loginList.errorFields
 * @returns {Boolean}
 */
function hasLoginListError(loginList) {
    return _.some(loginList, (login) => _.some(lodashGet(login, 'errorFields', {}), (field) => !_.isEmpty(field)));
}

/**
 * Searches through given loginList for any contact method / login that requires
 * an Info brick road status indicator. Currently this only applies if the user
 * has an unvalidated contact method.
 *
 * @param {Object} loginList
 * @param {String} loginList.validatedDate
 * @returns {Boolean}
 */
function hasLoginListInfo(loginList) {
    return _.some(loginList, (login) => _.isEmpty(login.validatedDate));
}

/**
 * Gets the appropriate brick road indicator status for a given loginList.
 * Error status is higher priority, so we check for that first.
 *
 * @param {Object} loginList
 * @returns {String}
 */
function getLoginListBrickRoadIndicator(loginList) {
    if (hasLoginListError(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    if (hasLoginListInfo(loginList)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.INFO;
    }
    return '';
}

/**
 * Hashes provided string and returns a value between [0, range)
 * @param {String} text
 * @param {Number} range
 * @returns {Number}
 */
function hashText(text, range) {
    return Math.abs(hashCode(text.toLowerCase())) % range;
}

/**
 * Helper method to return the default avatar associated with the given accountID
 * @param {Number} [accountID]
 * @returns {String}
 */
function getDefaultAvatar(accountID = -1) {
    if (accountID <= 0) {
        return Expensicons.FallbackAvatar;
    }
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return Expensicons.ConciergeAvatar;
    }

    // There are 24 possible default avatars, so we choose which one this user has based
    // on a simple modulo operation of their login number. Note that Avatar count starts at 1.
    const accountIDHashBucket = (accountID % CONST.DEFAULT_AVATAR_COUNT) + 1;

    return defaultAvatars[`Avatar${accountIDHashBucket}`];
}

/**
 * Helper method to return default avatar URL associated with login
 *
 * @param {Number} [accountID]
 * @param {Boolean} [isNewDot]
 * @returns {String}
 */
function getDefaultAvatarURL(accountID = '', isNewDot = false) {
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }

    // The default avatar for a user is based on a simple hash of their accountID.
    // Note that Avatar count starts at 1 which is why 1 has to be added to the result (or else 0 would result in a broken avatar link)
    const accountIDHashBucket = hashText(String(accountID), isNewDot ? CONST.DEFAULT_AVATAR_COUNT : CONST.OLD_DEFAULT_AVATAR_COUNT) + 1;
    const avatarPrefix = isNewDot ? `default-avatar` : `avatar`;

    return `${CONST.CLOUDFRONT_URL}/images/avatars/${avatarPrefix}_${accountIDHashBucket}.png`;
}

/**
 * Given a user's avatar path, returns true if user doesn't have an avatar or if URL points to a default avatar
 * @param {String} [avatarURL] - the avatar source from user's personalDetails
 * @returns {Boolean}
 */
function isDefaultAvatar(avatarURL) {
    if (
        _.isString(avatarURL) &&
        (avatarURL.includes('images/avatars/avatar_') || avatarURL.includes('images/avatars/default-avatar_') || avatarURL.includes('images/avatars/user/default'))
    ) {
        return true;
    }

    // We use a hardcoded "default" Concierge avatar
    if (_.isString(avatarURL) && (avatarURL === CONST.CONCIERGE_ICON_URL_2021 || avatarURL === CONST.CONCIERGE_ICON_URL)) {
        return true;
    }

    if (!avatarURL) {
        // If null URL, we should also use a default avatar
        return true;
    }
    return false;
}

/**
 * Provided a source URL, if source is a default avatar, return the associated SVG.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param {String} avatarURL - the avatar source from user's personalDetails
 * @param {Number} accountID - the accountID of the user
 * @returns {String|Function}
 */
function getAvatar(avatarURL, accountID) {
    return isDefaultAvatar(avatarURL) ? getDefaultAvatar(accountID) : avatarURL;
}

/**
 * Provided an avatar URL, if avatar is a default avatar, return NewDot default avatar URL.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param {String} avatarURL - the avatar source from user's personalDetails
 * @param {Number} accountID - the accountID of the user
 * @returns {String}
 */
function getAvatarUrl(avatarURL, accountID) {
    return isDefaultAvatar(avatarURL) ? getDefaultAvatarURL(accountID, true) : avatarURL;
}

/**
 * Avatars uploaded by users will have a _128 appended so that the asset server returns a small version.
 * This removes that part of the URL so the full version of the image can load.
 *
 * @param {String} [avatarURL]
 * @param {Number} [accountID]
 * @returns {String|Function}
 */
function getFullSizeAvatar(avatarURL, accountID) {
    const source = getAvatar(avatarURL, accountID);
    if (!_.isString(source)) {
        return source;
    }
    return source.replace('_128', '');
}

/**
 * Small sized avatars end with _128.<file-type>. This adds the _128 at the end of the
 * source URL (before the file type) if it doesn't exist there already.
 *
 * @param {String} avatarURL
 * @param {Number} accountID
 * @returns {String|Function}
 */
function getSmallSizeAvatar(avatarURL, accountID) {
    const source = getAvatar(avatarURL, accountID);
    if (!_.isString(source)) {
        return source;
    }

    // Because other urls than CloudFront do not support dynamic image sizing (_SIZE suffix), the current source is already what we want to use here.
    if (!CONST.CLOUDFRONT_DOMAIN_REGEX.test(source)) {
        return source;
    }

    // If image source already has _128 at the end, the given avatar URL is already what we want to use here.
    const lastPeriodIndex = source.lastIndexOf('.');
    if (source.substring(lastPeriodIndex - 4, lastPeriodIndex) === '_128') {
        return source;
    }
    return `${source.substring(0, lastPeriodIndex)}_128${source.substring(lastPeriodIndex)}`;
}

/**
 * Generate a random accountID base on searchValue.
 * @param {String} searchValue
 * @returns {Number}
 */
function generateAccountID(searchValue) {
    return hashText(searchValue, 2 ** 32);
}

export {
    hashText,
    hasLoginListError,
    hasLoginListInfo,
    getLoginListBrickRoadIndicator,
    getDefaultAvatar,
    getDefaultAvatarURL,
    isDefaultAvatar,
    getAvatar,
    getAvatarUrl,
    getSmallSizeAvatar,
    getFullSizeAvatar,
    generateAccountID,
};
