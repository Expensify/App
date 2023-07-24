import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';

/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * @param {Object} policies
 * @returns {Array}
 */
function getActivePolicies(policies) {
    return _.filter(policies, (policy) => policy && policy.type === CONST.POLICY.TYPE.FREE && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/**
 * Checks if we have any errors stored within the POLICY_MEMBERS. Determines whether we should show a red brick road error or not.
 * Data structure: {accountID: {role:'user', errors: []}, accountID2: {role:'admin', errors: [{1231312313: 'Unable to do X'}]}, ...}
 *
 * @param {Object} policyMembers
 * @returns {Boolean}
 */
function hasPolicyMemberError(policyMembers) {
    return _.some(policyMembers, (member) => !_.isEmpty(member.errors));
}

/**
 * Check if the policy has any error fields.
 *
 * @param {Object} policy
 * @param {Object} policy.errorFields
 * @return {Boolean}
 */
function hasPolicyErrorFields(policy) {
    return _.some(lodashGet(policy, 'errorFields', {}), (fieldErrors) => !_.isEmpty(fieldErrors));
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
    return !_.isEmpty(lodashGet(policy, 'errors', {})) ? true : hasPolicyErrorFields(policy);
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
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 *
 * @param {Object} policy
 * @param {String} policy.id
 * @param {Object} policyMembersCollection
 * @returns {String}
 */
function getPolicyBrickRoadIndicatorStatus(policy, policyMembersCollection) {
    const policyMembers = lodashGet(policyMembersCollection, `${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy.id}`, {});
    if (hasPolicyMemberError(policyMembers) || hasCustomUnitsError(policy) || hasPolicyErrorFields(policy)) {
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
    return (
        policy &&
        policy.type === CONST.POLICY.TYPE.FREE &&
        policy.role === CONST.POLICY.ROLE.ADMIN &&
        (isOffline || policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !_.isEmpty(policy.errors))
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

/**
 * @param {string} email
 * @returns {boolean}
 */
function isExpensifyGuideTeam(email) {
    const emailDomain = Str.extractEmailDomain(email);
    return emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the current user is an admin of the policy.
 *
 * @param {Object} policy
 * @returns {Boolean}
 */
const isPolicyAdmin = (policy) => lodashGet(policy, 'role') === CONST.POLICY.ROLE.ADMIN;

/**
 * @param {Object} policyMembers
 * @param {Object} personalDetails
 * @returns {Object}
 *
 * Create an object mapping member emails to their accountIDs. Filter for members without errors, and get the login email from the personalDetail object using the accountID.
 *
 * We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getClientPolicyMemberEmailsToAccountIDs(policyMembers, personalDetails) {
    const memberEmailsToAccountIDs = {};
    _.each(policyMembers, (member, accountID) => {
        if (!_.isEmpty(member.errors)) {
            return;
        }
        const personalDetail = personalDetails[accountID];
        if (!personalDetail || !personalDetail.login) {
            return;
        }
        memberEmailsToAccountIDs[personalDetail.login] = accountID;
    });
    return memberEmailsToAccountIDs;
}

export {
    getActivePolicies,
    hasPolicyMemberError,
    hasPolicyError,
    hasPolicyErrorFields,
    hasCustomUnitsError,
    getPolicyBrickRoadIndicatorStatus,
    shouldShowPolicy,
    isExpensifyTeam,
    isExpensifyGuideTeam,
    isPolicyAdmin,
    getClientPolicyMemberEmailsToAccountIDs,
};
