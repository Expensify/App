import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

/**
 * Checks if we have any errors stored within the POLICY_MEMBER_LIST. Determines whether we should show a red brick road error or not.
 * Data structure: {email: {role:'user', errors: []}, email2: {role:'admin', errors: [{1231312313: 'Unable to do X'}]}, ...}
 *
 * @param {Object} policyMemberList
 * @returns {Boolean}
 */
function hasPolicyMemberError(policyMemberList) {
    return _.some(policyMemberList, member => !_.isEmpty(member.errors));
}

/**
 * Check if the policy has any errors, and if it doesn't, then check if it has any error fields.
 *
 * @param {Object} policy
 * @param {Object} policy.errors
 * @param {Object} policy.errorFields
 * @return {Boolean}
 */
function hasPolicyError(policy) {
    return !_.isEmpty(lodashGet(policy, 'errors', {}))
        ? true
        : _.some(lodashGet(policy, 'errorFields', {}), fieldErrors => !_.isEmpty(fieldErrors));
}

/**
 * Checks if we have any errors stored within the policy custom units.
 *
 * @param {Object} policy
 * @returns {Boolean}
 */
function hasCustomUnitsError(policy) {
    return !_.isEmpty(_.pick(lodashGet(policy, 'customUnits', {}), 'errors'));
}

/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error or a policy error.
 *
 * @param {Object} policy
 * @param {String} policy.id
 * @param {Object} policyMembers
 * @returns {String}
 */
function getPolicyBrickRoadIndicatorStatus(policy, policyMembers) {
    const policyMemberList = lodashGet(policyMembers, `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policy.id}`, {});
    if (hasPolicyMemberError(policyMemberList) || hasCustomUnitsError(policy)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return '';
}

/**
 * Check if the policy can be displayed
 * If offline, always show the policy pending deletion.
 * If online, show the policy pending deletion only if there is an error.
 * Note: Using a local ONYXKEYS.NETWORK subscription will cause a delay in
 * updating the screen. Passing the offline status from the component.
 * @param {Object} policy
 * @param {Boolean} isOffline
 * @returns {Boolean}
 */
function shouldShowPolicy(policy, isOffline) {
    return policy
    && policy.type === CONST.POLICY.TYPE.FREE
    && policy.role === CONST.POLICY.ROLE.ADMIN
    && (
        isOffline
        || policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
        || !_.isEmpty(policy.errors)
    );
}

/**
 * @param {string} email
 * @returns {boolean}
 */
function isExpensifyTeam(email) {
    const emailDomain = Str.extractEmailDomain(email);
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

export {
    hasPolicyMemberError,
    hasPolicyError,
    hasCustomUnitsError,
    getPolicyBrickRoadIndicatorStatus,
    shouldShowPolicy,
    isExpensifyTeam,
};
