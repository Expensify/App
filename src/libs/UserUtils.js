import _ from 'underscore';
import lodashGet from 'lodash/get';

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
 * @returns {Boolean}
 */
function hasLoginListError(loginList) {
    return _.some(loginList, (login) =>
        _.some(lodashGet(login, 'errorFields', {}), field => !_.isEmpty(field))
    );
}

/**
 * Searches through given loginList for any contact method / login that requires
 * an Info brick road status indicator. Currently this only applies if the user
 * has an unvalidated contact method.
 *
 * @param {Object} loginList
 * @returns {Boolean}
 */
function hasLoginListInfo(loginList) {
    return _.some(loginList, (login) => {
        return _.isEmpty(login.validatedDate);
    });
}

export {
    hasLoginListError,
    hasLoginListInfo,
};
