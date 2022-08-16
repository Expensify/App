import _ from 'underscore';
import lodashGet from 'lodash/get';

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

export default policyHasError;
