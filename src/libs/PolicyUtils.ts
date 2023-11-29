import Str from 'expensify-common/lib/str';
import {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {PersonalDetails, Policy, PolicyMembers, PolicyTag, PolicyTags} from '@src/types/onyx';
import {EmptyObject, isEmptyObject} from '@src/types/utils/EmptyObject';

type MemberEmailsToAccountIDs = Record<string, number>;
type PersonalDetailsList = Record<string, PersonalDetails>;
type UnitRate = {rate: number};

/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePolicies(policies: OnyxCollection<Policy>): Policy[] | undefined {
    return Object.values(policies ?? {}).filter<Policy>(
        (policy): policy is Policy =>
            policy !== null && policy && (policy.isPolicyExpenseChatEnabled || policy.areChatRoomsEnabled) && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
}

/**
 * Checks if we have any errors stored within the POLICY_MEMBERS. Determines whether we should show a red brick road error or not.
 * Data structure: {accountID: {role:'user', errors: []}, accountID2: {role:'admin', errors: [{1231312313: 'Unable to do X'}]}, ...}
 */
function hasPolicyMemberError(policyMembers: OnyxEntry<PolicyMembers>): boolean {
    return Object.values(policyMembers ?? {}).some((member) => Object.keys(member?.errors ?? {}).length > 0);
}

/**
 * Check if the policy has any error fields.
 */
function hasPolicyErrorFields(policy: OnyxEntry<Policy>): boolean {
    return Object.keys(policy?.errorFields ?? {}).some((fieldErrors) => Object.keys(fieldErrors ?? {}).length > 0);
}

/**
 * Check if the policy has any errors, and if it doesn't, then check if it has any error fields.
 */
function hasPolicyError(policy: OnyxEntry<Policy>): boolean {
    return Object.keys(policy?.errors ?? {}).length > 0 ? true : hasPolicyErrorFields(policy);
}

/**
 * Checks if we have any errors stored within the policy custom units.
 */
function hasCustomUnitsError(policy: OnyxEntry<Policy>): boolean {
    return Object.keys(policy?.customUnits?.errors ?? {}).length > 0;
}

function getNumericValue(value: number, toLocaleDigit: (arg: string) => string): number | string {
    const numValue = parseFloat(value.toString().replace(toLocaleDigit('.'), '.'));
    if (Number.isNaN(numValue)) {
        return NaN;
    }
    return numValue.toFixed(CONST.CUSTOM_UNITS.RATE_DECIMALS);
}

function getRateDisplayValue(value: number, toLocaleDigit: (arg: string) => string): string {
    const numValue = getNumericValue(value, toLocaleDigit);
    if (Number.isNaN(numValue)) {
        return '';
    }
    return numValue.toString().replace('.', toLocaleDigit('.')).substring(0, value.toString().length);
}

function getUnitRateValue(customUnitRate: UnitRate, toLocaleDigit: (arg: string) => string) {
    return getRateDisplayValue((customUnitRate?.rate ?? 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET, toLocaleDigit);
}

/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy: OnyxEntry<Policy>, policyMembersCollection: OnyxCollection<PolicyMembers>): string {
    const policyMembers = policyMembersCollection?.[`${ONYXKEYS.COLLECTION.POLICY_MEMBERS}${policy?.id}`] ?? {};
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
function shouldShowPolicy(policy: OnyxEntry<Policy>, isOffline: boolean): boolean {
    return (
        !!policy &&
        policy?.isPolicyExpenseChatEnabled &&
        policy?.role === CONST.POLICY.ROLE.ADMIN &&
        (isOffline || policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy.errors ?? {}).length > 0)
    );
}

function isExpensifyTeam(email: string): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

function isExpensifyGuideTeam(email: string): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the current user is an admin of the policy.
 */
const isPolicyAdmin = (policy: OnyxEntry<Policy>): boolean => policy?.role === CONST.POLICY.ROLE.ADMIN;

const isPolicyMember = (policyID: string, policies: Record<string, Policy>): boolean => Object.values(policies).some((policy) => policy?.id === policyID);

/**
 * Create an object mapping member emails to their accountIDs. Filter for members without errors, and get the login email from the personalDetail object using the accountID.
 *
 * We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getMemberAccountIDsForWorkspace(policyMembers: OnyxEntry<PolicyMembers>, personalDetails: OnyxEntry<PersonalDetailsList>): MemberEmailsToAccountIDs {
    const memberEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
    Object.keys(policyMembers ?? {}).forEach((accountID) => {
        const member = policyMembers?.[accountID];
        if (Object.keys(member?.errors ?? {})?.length > 0) {
            return;
        }
        const personalDetail = personalDetails?.[accountID];
        if (!personalDetail?.login) {
            return;
        }
        memberEmailsToAccountIDs[personalDetail.login] = Number(accountID);
    });
    return memberEmailsToAccountIDs;
}

/**
 * Get login list that we should not show in the workspace invite options
 */
function getIneligibleInvitees(policyMembers: OnyxEntry<PolicyMembers>, personalDetails: OnyxEntry<PersonalDetailsList>): string[] {
    const memberEmailsToExclude: string[] = [...CONST.EXPENSIFY_EMAILS];
    Object.keys(policyMembers ?? {}).forEach((accountID) => {
        const policyMember = policyMembers?.[accountID];
        // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
        if (policyMember?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policyMember?.errors ?? {}).length > 0) {
            return;
        }
        const memberEmail = personalDetails?.[accountID]?.login;
        if (!memberEmail) {
            return;
        }
        memberEmailsToExclude.push(memberEmail);
    });

    return memberEmailsToExclude;
}

/**
 * Gets the tag from policy tags, defaults to the first if no key is provided.
 */
function getTag(policyTags: OnyxEntry<PolicyTags>, tagKey?: keyof typeof policyTags): PolicyTag | undefined | EmptyObject {
    if (isEmptyObject(policyTags)) {
        return {};
    }

    const policyTagKey = tagKey ?? Object.keys(policyTags ?? {})[0];

    return policyTags?.[policyTagKey] ?? {};
}

/**
 * Gets the first tag name from policy tags.
 */
function getTagListName(policyTags: OnyxEntry<PolicyTags>) {
    if (Object.keys(policyTags ?? {})?.length === 0) {
        return '';
    }

    const policyTagKeys = Object.keys(policyTags ?? {})[0] ?? [];

    return policyTags?.[policyTagKeys]?.name ?? '';
}

/**
 * Gets the tags of a policy for a specific key. Defaults to the first tag if no key is provided.
 */
function getTagList(policyTags: OnyxCollection<PolicyTags>, tagKey: string) {
    if (Object.keys(policyTags ?? {})?.length === 0) {
        return {};
    }

    const policyTagKey = tagKey ?? Object.keys(policyTags ?? {})[0];

    return policyTags?.[policyTagKey]?.tags ?? {};
}

function isPendingDeletePolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

export {
    getActivePolicies,
    hasPolicyMemberError,
    hasPolicyError,
    hasPolicyErrorFields,
    hasCustomUnitsError,
    getNumericValue,
    getUnitRateValue,
    getPolicyBrickRoadIndicatorStatus,
    shouldShowPolicy,
    isExpensifyTeam,
    isExpensifyGuideTeam,
    isPolicyAdmin,
    getMemberAccountIDsForWorkspace,
    getIneligibleInvitees,
    getTag,
    getTagListName,
    getTagList,
    isPendingDeletePolicy,
    isPolicyMember,
};
