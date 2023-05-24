import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../CONST';

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

export {hasLoginListError, hasLoginListInfo, getLoginListBrickRoadIndicator};
