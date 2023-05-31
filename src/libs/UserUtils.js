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
 * @param {String} login
 * @param {Number} range
 * @returns {Number}
 */
function hashLogin(login, range) {
    return Math.abs(hashCode(login.toLowerCase())) % range;
}

/**
 * Helper method to return the default avatar associated with the given login
 * @param {String} [login]
 * @returns {String}
 */
function getDefaultAvatar(login = '') {
    if (!login) {
        return Expensicons.FallbackAvatar;
    }
    if (login === CONST.EMAIL.CONCIERGE) {
        return Expensicons.ConciergeAvatar;
    }

    // There are 24 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login. Note that Avatar count starts at 1.
    const loginHashBucket = hashLogin(login, CONST.DEFAULT_AVATAR_COUNT) + 1;

    return defaultAvatars[`Avatar${loginHashBucket}`];
}

/**
 * Helper method to return default avatar URL associated with login
 *
 * @param {String} [login]
 * @param {Boolean} [isNewDot]
 * @returns {String}
 */
function getDefaultAvatarURL(login = '', isNewDot = false) {
    if (login === CONST.EMAIL.CONCIERGE) {
        return CONST.CONCIERGE_ICON_URL;
    }

    // The default avatar for a user is based on a simple hash of their login.
    // Note that Avatar count starts at 1 which is why 1 has to be added to the result (or else 0 would result in a broken avatar link)
    const loginHashBucket = hashLogin(login, isNewDot ? CONST.DEFAULT_AVATAR_COUNT : CONST.OLD_DEFAULT_AVATAR_COUNT) + 1;
    const avatarPrefix = isNewDot ? `default-avatar` : `avatar`;

    return `${CONST.CLOUDFRONT_URL}/images/avatars/${avatarPrefix}_${loginHashBucket}.png`;
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

    // If null URL, we should also use a default avatar
    if (!avatarURL) {
        return true;
    }
    return false;
}

/**
 * Provided a source URL, if source is a default avatar, return the associated SVG.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param {String} avatarURL - the avatar source from user's personalDetails
 * @param {String} login - the email of the user
 * @returns {String|Function}
 */
function getAvatar(avatarURL, login) {
    return isDefaultAvatar(avatarURL) ? getDefaultAvatar(login) : avatarURL;
}

/**
 * Provided an avatar URL, if avatar is a default avatar, return NewDot default avatar URL.
 * Otherwise, return the URL pointing to a user-uploaded avatar.
 *
 * @param {String} avatarURL - the avatar source from user's personalDetails
 * @param {String} login - the email of the user
 * @returns {String}
 */
function getAvatarUrl(avatarURL, login) {
    return isDefaultAvatar(avatarURL) ? getDefaultAvatarURL(login, true) : avatarURL;
}

/**
 * Avatars uploaded by users will have a _128 appended so that the asset server returns a small version.
 * This removes that part of the URL so the full version of the image can load.
 *
 * @param {String} [avatarURL]
 * @param {String} [login]
 * @returns {String|Function}
 */
function getFullSizeAvatar(avatarURL, login) {
    const source = getAvatar(avatarURL, login);
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
 * @param {String} login
 * @returns {String|Function}
 */
function getSmallSizeAvatar(avatarURL, login) {
    const source = getAvatar(avatarURL, login);
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

export {
    hashLogin,
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
};
