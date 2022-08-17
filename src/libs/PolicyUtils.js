import _ from 'underscore';
import lodashGet from 'lodash/get';

/**
* Checks if we have any errors stored within the POLICY_MEMBER_LIST.  Determines whether we should show a red brick road error or not
 * Data structure: {email: {role:'bla', errors: []}, email2: {role:'bla', errors: [{1231312313: 'Unable to do X'}]}, ...}
 * @param {Object} policyMemberList
 * @returns {Boolean}
 */
function hasPolicyMemberError(policyMemberList) {
    return _.some(policyMemberList, member => !_.isEmpty(member.errors));
}

/**
 * The policy has an error if there are errors under errors or errorFields.
 * @param {Object} policy
 * @return {Boolean}
 */
function policyHasError(policy) {
    const errors = lodashGet(policy, 'errors', {});
    const errorFields = lodashGet(policy, 'errorFields', {});
    const hasFieldErrors = _.some(errorFields, fieldErrors => !_.isEmpty(fieldErrors));
    return !_.isEmpty(errors) || hasFieldErrors;
}

export {
    hasPolicyMemberError,
    policyHasError,
};
