import _ from 'underscore';
import lodashGet from 'lodash/get';
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
 * The policy has an error if there are errors under the 'errors' key or the 'errorFields' key.
 *
 * @param {Object} policy
 * @param {Object} policy.errors
 * @param {Object} policy.errorFields
 * @return {Boolean}
 */
function hasPolicyError(policy) {
    const errors = lodashGet(policy, 'errors', {});
    const errorFields = lodashGet(policy, 'errorFields', {});
    const hasFieldErrors = _.some(errorFields, fieldErrors => !_.isEmpty(fieldErrors));
    return !_.isEmpty(errors) || hasFieldErrors;
}

/**
 * Checks if we have any errors stored within the policy custom units.
 * @param {Object} policy
 * @returns {Boolean}
 */
function hasCustomUnitsError(policy) {
    const unitsWithErrors = _.filter(lodashGet(policy, 'customUnits', {}), customUnit => (lodashGet(customUnit, 'errors', null)));
    return !_.isEmpty(unitsWithErrors);
}

/**
 * Get the brick road indicator status for a workspace. The workspace has an error status if there is a policy member error or a policy error.
 *
 * @param {Object} policy
 * @param {String} policy.id
 * @param {Object} policyMembers
 * @returns {String}
 */
function getWorkspaceBrickRoadIndicatorStatus(policy, policyMembers) {
    const policyMemberList = lodashGet(policyMembers, `${ONYXKEYS.COLLECTION.POLICY_MEMBER_LIST}${policy.id}`, {});
    if (hasPolicyMemberError(policyMemberList) || hasPolicyError(policy) || hasCustomUnitsError(policy)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return '';
}

export {
    hasPolicyMemberError,
    hasPolicyError,
    hasCustomUnitsError,
    getWorkspaceBrickRoadIndicatorStatus,
};
