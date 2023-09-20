import Str from 'expensify-common/lib/str';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import * as OnyxTypes from '../types/onyx';

type PolicyMemberList = Record<string, OnyxTypes.PolicyMember>;
type PolicyMembersCollection = Record<string, PolicyMemberList>;
type MemberEmailsToAccountIDs = Record<string, string>;
type PersonalDetailsList = Record<string, OnyxTypes.PersonalDetails>;

/**
 * Filter out the active policies, which will exclude policies with pending deletion
 */
function getActivePolicies(policies: OnyxTypes.Policy[]): OnyxTypes.Policy[] {
    return policies.filter((policy) => policy?.isPolicyExpenseChatEnabled && policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

/**
 * Checks if we have any errors stored within the POLICY_MEMBERS. Determines whether we should show a red brick road error or not.
 * Data structure: {accountID: {role:'user', errors: []}, accountID2: {role:'admin', errors: [{1231312313: 'Unable to do X'}]}, ...}
 */
function hasPolicyMemberError(policyMembers: PolicyMemberList): boolean {
    return Object.values(policyMembers).some((member) => Object.keys(member?.errors ?? {}).length > 0);
}

/**
 * Check if the policy has any error fields.
 */
function hasPolicyErrorFields(policy: OnyxTypes.Policy): boolean {
    return Object.keys(policy?.errorFields ?? {}).some((fieldErrors) => Object.keys(fieldErrors).length > 0);
}

/**
 * Check if the policy has any errors, and if it doesn't, then check if it has any error fields.
 */
function hasPolicyError(policy: OnyxTypes.Policy): boolean {
    return Object.keys(policy?.errors ?? {}).length > 0 ? true : hasPolicyErrorFields(policy);
}

/**
 * Checks if we have any errors stored within the policy custom units.
 */
function hasCustomUnitsError(policy: OnyxTypes.Policy): boolean {
    return Object.keys(policy?.customUnits?.error ?? {}).length > 0;
}

/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy: OnyxTypes.Policy, policyMembersCollection: PolicyMembersCollection): string {
    if (!(`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy?.id}` in policyMembersCollection)) return '';

    const policyMembers = policyMembersCollection[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy?.id}`];
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
 */
function shouldShowPolicy(policy: OnyxTypes.Policy, isOffline: boolean): boolean {
    return (
        policy &&
        policy?.isPolicyExpenseChatEnabled &&
        policy?.role === CONST.POLICY.ROLE.ADMIN &&
        (isOffline || policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy?.errors).length > 0)
    );
}

function isExpensifyTeam(email: string): boolean {
    const emailDomain = Str.extractEmailDomain(email);
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

function isExpensifyGuideTeam(email: string): boolean {
    const emailDomain = Str.extractEmailDomain(email);
    return emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the current user is an admin of the policy.
 */
const isPolicyAdmin = (policy: OnyxTypes.Policy): boolean => policy?.role === CONST.POLICY.ROLE.ADMIN;

/**
 * Create an object mapping member emails to their accountIDs. Filter for members without errors, and get the login email from the personalDetail object using the accountID.
 *
 * We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getMemberAccountIDsForWorkspace(policyMembers: PolicyMemberList, personalDetails: PersonalDetailsList): MemberEmailsToAccountIDs {
    const memberEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
    Object.keys(policyMembers).forEach((accountID) => {
        const member = policyMembers[accountID];
        if (Object.keys(member?.errors ?? {}).length > 0) {
            return;
        }
        const personalDetail = personalDetails[accountID];
        if (!personalDetail?.login) {
            return;
        }
        memberEmailsToAccountIDs[personalDetail?.login] = accountID;
    });
    return memberEmailsToAccountIDs;
}

/**
 * Get login list that we should not show in the workspace invite options
 */
function getIneligibleInvitees(policyMembers: PolicyMemberList, personalDetails: PersonalDetailsList): string[] {
    const memberEmailsToExclude: string[] = [...CONST.EXPENSIFY_EMAILS];
    Object.keys(policyMembers).forEach((accountID) => {
        const policyMember = policyMembers[accountID];
        // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
        if (policyMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policyMember?.errors ?? {}).length > 0) {
            return;
        }
        const memberEmail = personalDetails[accountID]?.login;
        if (!memberEmail) {
            return;
        }
        memberEmailsToExclude.push(memberEmail);
    });

    return memberEmailsToExclude;
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
    getMemberAccountIDsForWorkspace,
    getIneligibleInvitees,
};
