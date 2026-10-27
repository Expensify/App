/**
 * Workspace membership, Expensify-team filtering, invite exclusions, and member account IDs.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {getBankAccountFromID} from '@libs/actions/BankAccounts';
import {getIsOffline} from '@libs/NetworkState';
import {generateAccountID} from '@libs/UserUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, Policy, PolicyEmployeeList} from '@src/types/onyx';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {Str} from 'expensify-common';

import {canMemberWrite} from './permissions';
import {getActivePolicies, shouldShowPolicy} from './policy';

type MemberEmailsToAccountIDs = Record<string, number>;

/** Return the emails that can receive a shared bank account from the current user. */
function getEligibleBankAccountShareRecipientEmails(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined, bankAccountID: string | undefined): string[] {
    if (!currentUserLogin) {
        return [];
    }

    const currentBankAccount = getBankAccountFromID(Number(bankAccountID));
    const isOffline = getIsOffline();
    const activePolicies = getActivePolicies(policies, currentUserLogin).filter(
        (policy) => shouldShowPolicy(policy, isOffline, currentUserLogin) && canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS),
    );
    const recipientEmails = new Set<string>();
    const shareesSet = new Set(currentBankAccount?.accountData?.sharees ?? []);

    for (const policy of activePolicies) {
        for (const [email, employee] of Object.entries(policy.employeeList ?? {})) {
            if (
                employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                !employee.role ||
                !canMemberWrite(policy, email, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS) ||
                email === currentUserLogin ||
                recipientEmails.has(email) ||
                shareesSet.has(email) ||
                (isExpensifyTeam(email) && shouldFilterExpensifyTeam(policy.owner, currentUserLogin))
            ) {
                continue;
            }

            recipientEmails.add(email);
        }
    }

    return Array.from(recipientEmails);
}

/** Return whether the current user has someone they can share a bank account with. */
function hasEligibleBankAccountShareRecipient(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined, bankAccountID: string | undefined): boolean {
    return getEligibleBankAccountShareRecipientEmails(policies, currentUserLogin, bankAccountID).length > 0;
}

/**
 * Checks if a specific user is a member of the policy.
 * Note that employeeList can be blank when the policy is not the user's default/active policy
 */
function isPolicyMember(policy: OnyxEntry<Policy>, userLogin: string | undefined): boolean {
    return !!policy && !!userLogin && (!!policy.employeeList?.[userLogin] || policy.owner === userLogin);
}

function isMemberInHomeAndOfficeWorkspace(policy: OnyxEntry<Policy>, memberLogin: string): boolean {
    return !!memberLogin && policy?.commuterExclusions?.method === CONST.POLICY.COMMUTER_EXCLUSION_METHOD.HOME_AND_OFFICE && !!policy.employeeList?.[memberLogin];
}

function isPolicyMemberWithoutPendingDelete(currentUserLogin: string | undefined, policy: OnyxEntry<Policy>): boolean {
    if (!currentUserLogin || !policy?.id) {
        return false;
    }

    const policyEmployee = policy?.employeeList?.[currentUserLogin];
    return !!policyEmployee && policyEmployee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

/** Check if the passed employee holds an active Expensify Card on the policy, as reported by the backend in the policy's employeeList */
function hasActiveExpensifyCard(policy: OnyxEntry<Policy>, employeeLogin: string) {
    const primaryLogin = policy?.primaryLoginsInvited?.[employeeLogin];
    return !!policy?.employeeList?.[employeeLogin]?.hasActiveExpensifyCard || (!!primaryLogin && !!policy?.employeeList?.[primaryLogin]?.hasActiveExpensifyCard);
}

function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/** Whether Expensify team members should be hidden from the given policy/user combination. */
function shouldFilterExpensifyTeam(policyOwner: string | undefined, currentUserLogin: string | undefined): boolean {
    return !!policyOwner && !!currentUserLogin && !isExpensifyTeam(policyOwner) && !isExpensifyTeam(currentUserLogin);
}

/**
 * Whether a login should be hidden from a cardholder picker because it belongs to Expensify staff, who are also hidden from the Workspace Members page.
 * The current cardholder is never hidden, so editing an existing assignment doesn't blank out the selection.
 */
function shouldHideExpensifyTeamCardholder(
    login: string | null | undefined,
    currentCardholderLogin: string | undefined,
    policyOwner: string | undefined,
    currentUserLogin: string | undefined,
): boolean {
    return !!login && login !== currentCardholderLogin && isExpensifyTeam(login) && shouldFilterExpensifyTeam(policyOwner, currentUserLogin);
}

/**
 * Creates a selector for useOnyx that computes the filtered member count.
 * Returns a primitive number to prevent unnecessary re-renders when unrelated personal details change.
 */
function createFilteredMemberCountSelector(
    employeeList: PolicyEmployeeList | undefined,
    policyOwner: string | undefined,
    currentUserLogin: string | undefined,
    personalDetailsByLogins: PersonalDetailsByLogin,
) {
    return (personalDetails: PersonalDetailsList | undefined): number => {
        const shouldFilter = shouldFilterExpensifyTeam(policyOwner, currentUserLogin);
        const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList, personalDetailsByLogins, false, false);

        return Object.keys(policyMemberEmailsToAccountIDs).reduce((count, email) => {
            const accountID = policyMemberEmailsToAccountIDs[email];
            const details = personalDetails?.[accountID];

            if (shouldFilter && isExpensifyTeam(details?.login ?? details?.displayName)) {
                return count;
            }

            return count + 1;
        }, 0);
    };
}

/**
 * Create an object mapping member emails to their accountIDs. Filter for members without errors if includeMemberWithErrors is false, and get the login email from the personalDetail object using the accountID.
 *
 * If includeMemberWithErrors is false, We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getMemberAccountIDsForWorkspace(
    employeeList: PolicyEmployeeList | undefined,
    personalDetailsByLogins: PersonalDetailsByLogin,
    includeMemberWithErrors = false,
    includeMemberWithPendingDelete = true,
): MemberEmailsToAccountIDs {
    const members = employeeList ?? {};
    const memberEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
    for (const email of Object.keys(members)) {
        if (!includeMemberWithErrors) {
            const member = members?.[email];
            if (Object.keys(member?.errors ?? {})?.length > 0) {
                continue;
            }
        }
        if (!includeMemberWithPendingDelete) {
            const member = members?.[email];
            if (member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                continue;
            }
        }
        const personalDetail = personalDetailsByLogins?.[email];
        if (!personalDetail?.login) {
            continue;
        }
        memberEmailsToAccountIDs[email] = Number(personalDetail.accountID);
    }
    return memberEmailsToAccountIDs;
}

/**
 * Resolves the accountID for a submit-to recipient chosen in the submit-to popover.
 * Uses personal details first, then the workspace employee list (same source as ReportSubmitToContent).
 * When the member is in employeeList but not yet in personal details, returns a stable optimistic accountID.
 */
function getAccountIDForSubmitManagerEmail(
    managerEmail: string | undefined,
    employeeList: PolicyEmployeeList | undefined,
    personalDetailsByLogins: PersonalDetailsByLogin,
): number | undefined {
    const trimmed = managerEmail?.trim();
    if (!trimmed) {
        return undefined;
    }

    const fromPersonalDetails = personalDetailsByLogins[trimmed]?.accountID;
    if (fromPersonalDetails !== undefined) {
        return fromPersonalDetails;
    }

    if (!employeeList) {
        return undefined;
    }

    const normalizedEmail = trimmed.toLowerCase();
    const memberAccountIDs = getMemberAccountIDsForWorkspace(employeeList, personalDetailsByLogins, true, false);

    for (const [email, accountID] of Object.entries(memberAccountIDs)) {
        if (email.toLowerCase() === normalizedEmail) {
            return accountID;
        }
    }

    for (const [listKey, employee] of Object.entries(employeeList)) {
        const employeeEmail = (employee.email ?? listKey).trim();
        const listKeyNormalized = listKey.trim().toLowerCase();
        const employeeEmailNormalized = employeeEmail.toLowerCase();

        if (employeeEmailNormalized !== normalizedEmail && listKeyNormalized !== normalizedEmail) {
            continue;
        }

        const accountIDFromMap = memberAccountIDs[employeeEmail] ?? memberAccountIDs[listKey];

        if (accountIDFromMap !== undefined) {
            return accountIDFromMap;
        }

        return generateAccountID(trimmed);
    }

    return undefined;
}

/**
 * Get login list that we should not show in the workspace invite options
 */
function getIneligibleInvitees(employeeList?: PolicyEmployeeList): string[] {
    const policyEmployeeList = employeeList ?? {};
    const memberEmailsToExclude: string[] = [...CONST.EXPENSIFY_EMAILS];
    for (const email of Object.keys(policyEmployeeList)) {
        const policyEmployee = policyEmployeeList?.[email];
        // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
        if (policyEmployee?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policyEmployee?.errors ?? {}).length > 0) {
            continue;
        }
        if (!email) {
            continue;
        }
        memberEmailsToExclude.push(email);
    }

    return memberEmailsToExclude;
}

/**
 * Get excluded users as a Record for use in search selector
 */
function getExcludedUsers(employeeList?: PolicyEmployeeList): Record<string, boolean> {
    return Object.fromEntries(getIneligibleInvitees(employeeList).map((login) => [login, true]));
}

/**
 * Get Guide and Account Manager information including their emails/logins and exclusion record.
 * Used for filtering Guide/AM from contact lists while allowing manual entry.
 *
 * @param policy - The policy to get the assigned guide from
 * @param accountManagerAccountID - The account manager's account ID from the account object
 * @param personalDetails - Personal details collection to look up account manager login
 * @returns Object containing extracted emails/logins and exclusions record
 */
function getGuideAndAccountManagerInfo(
    policy: OnyxEntry<Policy>,
    accountManagerAccountID: number | undefined,
    personalDetails: OnyxEntry<PersonalDetailsList>,
): {
    assignedGuideEmail: string | undefined;
    accountManagerLogin: string | undefined;
    exclusions: Record<string, boolean>;
} {
    const assignedGuideEmail = policy?.assignedGuide?.email?.toLowerCase();
    const accountManagerLogin = accountManagerAccountID ? personalDetails?.[accountManagerAccountID]?.login?.toLowerCase() : undefined;

    const exclusions: Record<string, boolean> = {};
    if (assignedGuideEmail) {
        exclusions[assignedGuideEmail] = true;
    }
    if (accountManagerLogin) {
        exclusions[accountManagerLogin] = true;
    }

    return {
        assignedGuideEmail,
        accountManagerLogin,
        exclusions,
    };
}

/**
 * Build a soft-exclusion map of Expensify-team logins (current and former AMs/Guides) so search
 * filters don't surface internal Expensify staff to customers. Mirrors the visibility rule used
 * by WorkspaceMembersPage: skip the filter when the current user is themselves Expensify staff,
 * and preserve Expensify-team members of any Expensify-owned policy the current user belongs to.
 */
function getExpensifyTeamExclusions(personalDetails: OnyxEntry<PersonalDetailsList>, policies: OnyxCollection<Policy>, currentUserLogin: string | undefined): Record<string, boolean> {
    if (!currentUserLogin || isExpensifyTeam(currentUserLogin)) {
        return {};
    }

    const lowerCurrentUserLogin = currentUserLogin.toLowerCase();
    const allowedExpensifyTeamLogins = new Set<string>();

    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.owner || !policy.employeeList || !isExpensifyTeam(policy.owner)) {
            continue;
        }
        const currentUserIsInPolicy = Object.keys(policy.employeeList).some((email) => email.toLowerCase() === lowerCurrentUserLogin);
        if (!currentUserIsInPolicy) {
            continue;
        }
        for (const email of Object.keys(policy.employeeList)) {
            const lowerEmail = email.toLowerCase();
            if (isExpensifyTeam(lowerEmail)) {
                allowedExpensifyTeamLogins.add(lowerEmail);
            }
        }
    }

    const exclusion: Record<string, boolean> = {};
    for (const details of Object.values(personalDetails ?? {})) {
        const login = details?.login?.toLowerCase();
        if (!login || !isExpensifyTeam(login)) {
            continue;
        }
        if (allowedExpensifyTeamLogins.has(login)) {
            continue;
        }
        exclusion[login] = true;
    }
    return exclusion;
}

/**
 * Get soft exclusions (Guide/Account Manager) that should be hidden from auto-suggestions
 * but can still be manually entered by the user.
 *
 * @param policy - The policy to get the assigned guide from
 * @param accountManagerAccountID - The account manager's account ID from the account object
 * @param personalDetails - Personal details collection to look up account manager login
 * @returns Record mapping lowercase emails to true for Guide and Account Manager
 */
function getSoftExclusionsForGuideAndAccountManager(
    policy: OnyxEntry<Policy>,
    accountManagerAccountID: number | undefined,
    personalDetails: OnyxEntry<PersonalDetailsList>,
): Record<string, boolean> {
    return getGuideAndAccountManagerInfo(policy, accountManagerAccountID, personalDetails).exclusions;
}

/**
 * Filter out Guide and Account Manager from a list of items.
 * Used for filtering local data (e.g., policy.employeeList) that isn't filtered at the data layer.
 *
 * @param items - Array of items to filter (must have login or alternateText properties)
 * @param assignedGuideEmail - The assigned guide's email (should be lowercase)
 * @param accountManagerLogin - The account manager's login (should be lowercase)
 * @returns Filtered array with Guide and Account Manager removed
 */
function filterGuideAndAccountManager<T extends {login?: string | null; alternateText?: string | null}>(
    items: T[],
    assignedGuideEmail: string | undefined,
    accountManagerLogin: string | undefined,
): T[] {
    return items.filter((item) => {
        const itemLogin = item.login?.toLowerCase();
        const itemAltText = item.alternateText?.toLowerCase();

        if (assignedGuideEmail && (itemLogin === assignedGuideEmail || itemAltText === assignedGuideEmail)) {
            return false;
        }

        if (accountManagerLogin && (itemLogin === accountManagerLogin || itemAltText === accountManagerLogin)) {
            return false;
        }

        return true;
    });
}

function getAdminEmployees(policy: OnyxEntry<Policy>): PolicyEmployee[] {
    if (!policy?.employeeList) {
        return [];
    }
    return Object.keys(policy.employeeList)
        .map((email) => ({...policy.employeeList?.[email], email}))
        .filter((employee) => employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && employee.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Check if the policy member is deleted from the workspace
 */
function isDeletedPolicyEmployee(policyEmployee: PolicyEmployee, isOffline: boolean) {
    return !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors);
}

export {
    getAdminEmployees,
    getIneligibleInvitees,
    getExcludedUsers,
    getMemberAccountIDsForWorkspace,
    getAccountIDForSubmitManagerEmail,
    getGuideAndAccountManagerInfo,
    getSoftExclusionsForGuideAndAccountManager,
    getExpensifyTeamExclusions,
    filterGuideAndAccountManager,
    isExpensifyTeam,
    shouldFilterExpensifyTeam,
    shouldHideExpensifyTeamCardholder,
    createFilteredMemberCountSelector,
    isDeletedPolicyEmployee,
    hasEligibleBankAccountShareRecipient,
    isPolicyMember,
    isMemberInHomeAndOfficeWorkspace,
    getEligibleBankAccountShareRecipientEmails,
    isPolicyMemberWithoutPendingDelete,
    hasActiveExpensifyCard,
};

export type {MemberEmailsToAccountIDs};
