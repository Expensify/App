import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {getBankAccountFromID} from '@libs/actions/BankAccounts';
import isTeachersUnitePolicyID from '@libs/isTeachersUnitePolicyID';
import {getHRAdvancedModeFinalApprover} from '@libs/merge/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIsOffline} from '@libs/NetworkState';
import {generateAccountID} from '@libs/UserUtils';
import {isPublicDomain} from '@libs/ValidationUtils';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyType} from '@src/types/form/WorkspaceConfirmationForm';
import type {Card, OnyxInputOrEntry, PersonalDetailsList, Policy, PolicyEmployeeList, TravelSettings} from '@src/types/onyx';
import type {CommuterExclusions} from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import type {WorkspaceTravelSettings} from '@src/types/onyx/TravelSettings';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';

import {hasAccountingConnections} from './connections';
import {getPerDiemCustomUnit, isPerDiemEligiblePolicy} from './customUnits';
import {isTimeTrackingEnabled} from './features';
import {canEditWorkspaceSettings, canMemberWrite, getPolicyRole, isPolicyAdmin, isPolicyOwner, isPolicyUser} from './permissions';
import {isArchivedPolicy, isCollectPolicy, isControlPolicy, isGroupPolicy, isPaidGroupPolicy, isSubmitPolicy} from './policyType';

type MemberEmailsToAccountIDs = Record<string, number>;

type TravelStep = ValueOf<typeof CONST.TRAVEL.STEPS>;

type WorkspaceDetails = {
    policyID: string | undefined;
    name: string;
};

/**
 * Returns true if the policy has no fieldList or its fieldList is empty.
 */
function isPolicyFieldListEmpty(policy: OnyxEntry<Policy>): boolean {
    return !policy?.fieldList || Object.keys(policy.fieldList).length === 0;
}

/**
 * Whether the current user can unarchive the workspace: only the owner of an archived workspace can, and only
 * while the archive policies beta is enabled. Takes primitives so it works with both a Policy and a workspace row.
 */
function canUnarchivePolicy(isArchived: boolean, ownerAccountID: number | undefined, currentUserAccountID: number, isArchivePoliciesBetaEnabled: boolean): boolean {
    return isArchivePoliciesBetaEnabled && isArchived && ownerAccountID === currentUserAccountID;
}

/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * and policies the current user doesn't belong to.
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePolicies(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return Object.values(policies ?? {}).filter<Policy>(
        (policy): policy is Policy =>
            !!policy &&
            policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            !!policy.name &&
            !!policy.id &&
            !!getPolicyRole(policy, currentUserLogin) &&
            !isArchivedPolicy(policy),
    );
}

/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * and policies the current user doesn't belong to.
 * These will be policies that has expense chat enabled.
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePoliciesWithExpenseChat(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return Object.values(policies ?? {}).filter<Policy>(
        (policy): policy is Policy =>
            !!policy &&
            policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
            !!policy.name &&
            !!policy.id &&
            !!getPolicyRole(policy, currentUserLogin) &&
            (isPaidGroupPolicy(policy) || isSubmitPolicy(policy)) &&
            !isArchivedPolicy(policy),
    );
}

function getActivePoliciesWithExpenseChatAndPerDiemEnabled(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return getActivePoliciesWithExpenseChat(policies, currentUserLogin).filter(isPerDiemEligiblePolicy);
}

function getActivePoliciesWithExpenseChatAndTimeEnabled(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return getActivePoliciesWithExpenseChat(policies, currentUserLogin).filter(isTimeTrackingEnabled);
}

/**
 * Whether the workspace has a company address
 */
function hasCompanyAddress(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.address?.addressStreet?.trim();
}

/**
 * The workspace-wide work arrangement, which members follow unless they were given one of their own.
 */
function hasOfficeWorkArrangement(commuterExclusions: CommuterExclusions | undefined): boolean {
    return getEffectiveWorkArrangement(undefined, commuterExclusions?.isOfficeWorkArrangement);
}

function getPolicyIDOrDefault(policyID?: string) {
    if (!policyID || policyID === CONST.POLICY.OWNER_EMAIL_FAKE) {
        return '-1';
    }
    return policyID;
}

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
 * Check if the policy can be displayed
 * If shouldShowPendingDeletePolicy is true, show the policy pending deletion.
 * If shouldShowPendingDeletePolicy is false, show the policy pending deletion only if there is an error.
 * Note: Using a local ONYXKEYS.NETWORK subscription will cause a delay in
 * updating the screen. Passing the offline status from the component.
 */
function shouldShowPolicy(policy: OnyxEntry<Policy>, shouldShowPendingDeletePolicy: boolean, currentUserLogin: string | undefined, includeArchivedPolicy = false): boolean {
    if (!includeArchivedPolicy && isArchivedPolicy(policy)) {
        return false;
    }
    return (
        !!policy?.isJoinRequestPending ||
        (!!policy &&
            policy?.type !== CONST.POLICY.TYPE.PERSONAL &&
            (shouldShowPendingDeletePolicy || policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy.errors ?? {}).length > 0) &&
            !!getPolicyRole(policy, currentUserLogin))
    );
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
 * Creates a selector for useOnyx that returns formatted text for invoice configuration.
 * Returns a primitive string to prevent unnecessary re-renders when unrelated bank account data changes.
 * This matches the filtering logic used by PaymentMethodList with filterType=BUSINESS on the invoices page.
 */
function createInvoiceConfigurationTextSelector(translate: LocaleContextProps['translate'], invoiceCompany: string) {
    return (bankAccountList: OnyxEntry<Record<string, {accountData?: {type?: string}}>>): string => {
        const count = Object.values(bankAccountList ?? {}).filter((account) => account.accountData?.type === CONST.BANK_ACCOUNT.TYPE.BUSINESS).length;
        const bankAccountsText = count > 0 ? `${count} ${translate('common.bankAccounts').toLowerCase()}` : '';
        return [bankAccountsText, invoiceCompany].filter(Boolean).join(', ');
    };
}

/**
 * Get the active group policies where the current user can create policy rooms.
 */
function getPoliciesForRoomCreation(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return getActivePolicies(policies, currentUserLogin).filter(
        (policy) => policy.type !== CONST.POLICY.TYPE.PERSONAL && canMemberWrite(policy, currentUserLogin ?? '', CONST.POLICY.POLICY_FEATURE.ROOMS),
    );
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

function getOwnedPaidPolicies(policies: OnyxCollection<Policy> | null, currentUserAccountID: number | undefined): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => isPolicyOwner(policy, currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID) && isPaidGroupPolicy(policy));
}

/**
 * For Submit workspaces, certain features require upgrading the plan before enabling.
 * When conditions match, navigates to the workspace upgrade flow and returns true (caller should not enable the feature).
 * @returns true if upgrade navigation was performed; false otherwise
 */
function tryNavigateToSubmitWorkspaceUpgrade(policy: OnyxEntry<Policy>, isEnabling: boolean, upgradeFeatureAlias: string, backTo?: string): boolean {
    if (!policy?.id || !isEnabling || !isSubmitPolicy(policy)) {
        return false;
    }
    // Default the upgrade page's back destination to More Features (the source of most upgrade-gated toggles).
    // Entry points outside More Features (e.g. the Roles flow) pass their own backTo so the user returns there.
    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policy?.id, upgradeFeatureAlias, backTo ?? ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policy?.id)));
    return true;
}

/**
 * Collect workspaces can access a limited subset of Rules features. When a Collect admin tries to
 * access a Control-only Rules feature, navigate to the upgrade flow and return true.
 *
 * @param shouldReplace - Replace the current screen instead of pushing the upgrade page on top of it. Use this when
 * the redirect happens from the Control-only page itself, so pressing Back doesn't land back on a page Collect
 * can't use. Press handlers on a page Collect *can* use should keep the default push.
 */
function tryNavigateToControlPolicyUpgrade(policy: OnyxEntry<Policy>, upgradeFeatureAlias: string, backTo?: string, shouldReplace = false): boolean {
    if (!policy?.id || isControlPolicy(policy) || !isCollectPolicy(policy)) {
        return false;
    }

    Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policy.id, upgradeFeatureAlias, backTo ?? ROUTES.WORKSPACE_RULES.getRoute(policy.id)), {forceReplace: shouldReplace});
    return true;
}

/** Whether the user can add a category to the workspace straight from an expense's category picker */
function canCreateCategoryInSitu(policy: OnyxEntry<Policy>, login?: string) {
    return canEditWorkspaceSettings(policy, login) && !hasAccountingConnections(policy) && !!policy?.areCategoriesEnabled;
}

function goBackFromInvalidPolicy() {
    Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
}

/**
 * Whether an approver email points at someone who is no longer on the workspace. The owner always counts as a member,
 * and HR advanced (manager) mode is excluded, because its final approver doesn't have to be a workspace member.
 */
function isNonMemberApprover(policy: OnyxEntry<Policy>, approverEmail: string | undefined): boolean {
    return !!approverEmail && !isPolicyMember(policy, approverEmail) && !getHRAdvancedModeFinalApprover(policy);
}

function getAdminEmployees(policy: OnyxEntry<Policy>): PolicyEmployee[] {
    if (!policy?.employeeList) {
        return [];
    }
    return Object.keys(policy.employeeList)
        .map((email) => ({...policy.employeeList?.[email], email}))
        .filter((employee) => employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && employee.role === CONST.POLICY.ROLE.ADMIN);
}

/** Return active policies where current user is an admin */
function getActiveAdminWorkspaces(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, getIsOffline(), currentUserLogin) && isPolicyAdmin(policy, currentUserLogin));
}

/** Return active policies where current user is an employee (of the role "user") */
function getActiveEmployeeWorkspaces(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, getIsOffline(), currentUserLogin) && isPolicyUser(policy, currentUserLogin));
}

/**
 * Checks whether the current user has a policy with admin access
 */
function hasActiveAdminWorkspaces(currentUserLogin: string | undefined, policies?: OnyxCollection<Policy>) {
    return getActiveAdminWorkspaces(policies, currentUserLogin).length > 0;
}

/** Whether the user can send invoice from the workspace */
function canSendInvoiceFromWorkspace(policy: OnyxEntry<Policy>): boolean {
    return policy?.areInvoicesEnabled ?? false;
}

/** Whether the user can submit per diem expense from the workspace */
function canSubmitPerDiemExpenseFromWorkspace(policy: OnyxEntry<Policy>): boolean {
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    return isPaidGroupPolicy(policy) && !isEmptyObject(perDiemCustomUnit) && !!perDiemCustomUnit?.enabled;
}

/** Whether the user can send invoice */
function canSendInvoice(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): boolean {
    return getActiveAdminWorkspaces(policies, currentUserLogin).some((policy) => canSendInvoiceFromWorkspace(policy));
}

/**
 * Sort the workspaces by their name, while keeping the selected one at the beginning.
 * @param workspace1 Details of the first workspace to be compared.
 * @param workspace2 Details of the second workspace to be compared.
 * @param selectedWorkspaceID ID of the selected workspace which needs to be at the beginning.
 */
const sortWorkspacesBySelected = (
    workspace1: WorkspaceDetails,
    workspace2: WorkspaceDetails,
    selectedWorkspaceIDs: string[] | undefined,
    localeCompare: LocaleContextProps['localeCompare'],
): number => {
    if (workspace1.policyID && selectedWorkspaceIDs?.includes(workspace1?.policyID) && workspace2.policyID && selectedWorkspaceIDs?.includes(workspace2.policyID)) {
        return localeCompare(workspace1.name?.toLowerCase() ?? '', workspace2.name?.toLowerCase() ?? '');
    }
    if (workspace1.policyID && selectedWorkspaceIDs?.includes(workspace1?.policyID)) {
        return -1;
    }
    if (workspace2.policyID && selectedWorkspaceIDs?.includes(workspace2.policyID)) {
        return 1;
    }
    return localeCompare(workspace1.name?.toLowerCase() ?? '', workspace2.name?.toLowerCase() ?? '');
};

function goBackWhenEnableFeature() {
    setTimeout(() => {
        Navigation.goBack();
    }, CONST.WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY);
}

function navigateToExpensifyCardPage(policyID: string) {
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
    });
}

/**
 * Check if the policy member is deleted from the workspace
 */
function isDeletedPolicyEmployee(policyEmployee: PolicyEmployee, isOffline: boolean) {
    return !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors);
}

function hasOnlyPersonalPolicies(policies: OnyxCollection<Policy>) {
    return !Object.values(policies ?? {}).some((policy) => policy && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

function getDomainNameForPolicy(policyID?: string): string {
    if (!policyID) {
        return '';
    }

    return `${CONST.EXPENSIFY_POLICY_DOMAIN}${policyID.toLowerCase()}${CONST.EXPENSIFY_POLICY_DOMAIN_EXTENSION}`;
}

function getUserFriendlyWorkspaceType(workspaceType: ValueOf<typeof CONST.POLICY.TYPE>, translate: LocalizedTranslate) {
    switch (workspaceType) {
        case CONST.POLICY.TYPE.CORPORATE:
            return translate('workspace.type.control');
        case CONST.POLICY.TYPE.TEAM:
            return translate('workspace.type.collect');
        case CONST.POLICY.TYPE.SUBMIT:
            return translate('workspace.type.submit');
        default:
            return translate('workspace.type.free');
    }
}

/**
 * Returns the plan type to pre-select when creating a workspace: Corporate when the user already belongs to a
 * Control workspace, otherwise Team.
 */
function getDefaultWorkspacePlanType(policies: OnyxCollection<Policy> | null): PolicyType {
    const isMemberOfControlWorkspace = Object.values(policies ?? {}).some((policy) => policy?.type === CONST.POLICY.TYPE.CORPORATE);
    return isMemberOfControlWorkspace ? CONST.POLICY.TYPE.CORPORATE : CONST.POLICY.TYPE.TEAM;
}

function isPolicyAccessible(policy: OnyxEntry<Policy>, currentUserLogin: string): boolean {
    return (
        !isEmptyObject(policy) &&
        (Object.keys(policy).length !== 1 || isEmptyObject(policy.errors)) &&
        !!policy?.id &&
        policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
        !!getPolicyRole(policy, currentUserLogin)
    );
}

function getGroupPaidPolicies(policies: OnyxCollection<Policy> | null) {
    if (isEmptyObject(policies)) {
        return CONST.EMPTY_ARRAY;
    }
    return Object.values(policies).filter((policy) => isPaidGroupPolicy(policy) && !policy?.isJoinRequestPending && shouldShowPolicy(policy, false, undefined));
}

function hasAnyPaidPolicy(policies: OnyxCollection<Policy> | null) {
    return getGroupPaidPolicies(policies).length > 0;
}

/**
 * Returns the group workspaces where the user can create a report: paid (Team/Corporate) workspaces,
 * plus Submit workspaces. Submit workspaces are free but still support report creation, so they belong
 * here even though they're excluded from `getGroupPaidPolicies`.
 */
function getGroupPoliciesWhereReportCanBeCreated(policies: OnyxCollection<Policy> | null, currentUserLogin?: string) {
    if (isEmptyObject(policies)) {
        return CONST.EMPTY_ARRAY;
    }
    return Object.values(policies).filter(
        (policy): policy is Policy =>
            !!policy &&
            !policy.isJoinRequestPending &&
            (isPaidGroupPolicy(policy) || isSubmitPolicy(policy)) &&
            shouldShowPolicy(policy, false, currentUserLogin) &&
            !isTeachersUnitePolicyID(policy.id),
    );
}

/**
 * Resolves the default workspace for report creation: the active policy when it's one of the eligible
 * workspaces, otherwise the only eligible workspace, else undefined.
 */
function getDefaultChatEnabledPolicy(
    groupPoliciesWithChatEnabled: ReadonlyArray<OnyxInputOrEntry<Policy>>,
    activePolicy?: OnyxInputOrEntry<Policy> | null,
): OnyxInputOrEntry<Policy> | undefined {
    // Only default to the active policy when it's actually eligible, so we never pick an ineligible policy
    // (e.g. a personal or free workspace) over an eligible fallback.
    if (activePolicy && isGroupPolicy(activePolicy) && groupPoliciesWithChatEnabled.some((policy) => policy?.id === activePolicy.id)) {
        return activePolicy;
    }

    if (groupPoliciesWithChatEnabled.length === 1) {
        return groupPoliciesWithChatEnabled.at(0);
    }

    return undefined;
}

/** Scalar version for useOnyx selectors: an eligible-policy array makes useOnyx deep-compare every policy on each policy_ update */
function getDefaultChatEnabledPolicySelection(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined, activePolicyID: string | undefined) {
    const groupPoliciesWithChatEnabled = getGroupPoliciesWhereReportCanBeCreated(policies, currentUserLogin);
    const activePolicy = activePolicyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${activePolicyID}`] : undefined;

    return {
        defaultChatEnabledPolicyID: getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled, activePolicy)?.id,
        hasMultipleChatEnabledPolicies: groupPoliciesWithChatEnabled.length > 1,
    };
}

function hasOtherControlWorkspaces(adminPolicies: Policy[] | undefined, currentPolicyID: string) {
    const otherControlWorkspaces = adminPolicies?.filter((policy) => policy?.id !== currentPolicyID && isControlPolicy(policy));
    return (otherControlWorkspaces?.length ?? 0) > 0;
}

/**
 * Determines whether workspace deletion should be blocked for an Invoicify user.
 *
 * The function normalizes owner policies to a flat `Policy[]` regardless of whether
 * they are provided as an `OnyxCollection` or a precomputed array. For Invoicify users,
 * it ensures that at least one other controllable workspace exists after excluding
 * policies with pending ADD or DELETE actions.
 *
 * The filtering is done lazily to avoid unnecessary work for non-Invoicify users.
 *
 * @param isSubscriptionTypeOfInvoicing - Whether the user is on an Invoicify subscription
 * @param ownerPolicies - Owner policies as an Onyx collection or a normalized array
 * @param currentPolicyID - Policy ID of the workspace being evaluated
 * @param accountID - Account ID used to resolve owned paid policies when needed
 *
 */
function shouldBlockWorkspaceDeletionForInvoicifyUser(
    isSubscriptionTypeOfInvoicing: boolean,
    ownerPolicies: OnyxCollection<Policy> | Policy[] | undefined,
    currentPolicyID: string | undefined,
    accountID?: number,
) {
    if (!isSubscriptionTypeOfInvoicing || !currentPolicyID) {
        return false;
    }
    const normalizedOwnerPolicies: Policy[] = (() => {
        if (!ownerPolicies) {
            return [];
        }

        if (Array.isArray(ownerPolicies)) {
            return ownerPolicies;
        }

        if (accountID) {
            return getOwnedPaidPolicies(ownerPolicies, accountID);
        }

        return Object.values(ownerPolicies).filter((policy): policy is Policy => !!policy);
    })();

    const ownerPoliciesWithoutPendingActions = (normalizedOwnerPolicies ?? []).filter(
        (policy) => policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );

    return !hasOtherControlWorkspaces(ownerPoliciesWithoutPendingActions, currentPolicyID);
}

// If no policyID is provided, it indicates the workspace upgrade/downgrade URL
// is being accessed from the Subscriptions page without a specific policyID.
// In this case, check if the user is an admin on more than one policy.
// If the user is an admin for multiple policies, we can render the page as it contains a condition
// to navigate them to the Workspaces page when no policyID is provided, instead of showing the Upgrade/Downgrade button.
// If the user is not an admin for multiple policies, they are not allowed to perform this action, and the NotFoundPage is displayed.
function canModifyPlan(ownerPolicies: Policy[] | undefined, policy: OnyxEntry<Policy>) {
    if (!policy?.id) {
        return (ownerPolicies?.length ?? 0) > 1;
    }

    return !!policy && isPolicyAdmin(policy);
}

function getAdminsPrivateEmailDomains(policy?: Policy) {
    if (!policy) {
        return [];
    }

    const adminDomains = Object.entries(policy.employeeList ?? {}).reduce((domains, [email, employee]) => {
        if (employee.role !== CONST.POLICY.ROLE.ADMIN) {
            return domains;
        }
        domains.push(Str.extractEmailDomain(email).toLowerCase());
        return domains;
    }, [] as string[]);

    const ownerDomains = policy.owner ? [Str.extractEmailDomain(policy.owner).toLowerCase()] : [];

    const privateDomains = [...new Set(adminDomains.concat(ownerDomains))].filter((domain) => !isPublicDomain(domain));

    // If the policy is not owned by Expensify there is no point in showing the domain for provisioning.
    if (!isExpensifyTeam(policy.owner)) {
        return privateDomains.filter((domain) => domain !== CONST.EXPENSIFY_PARTNER_NAME && domain !== CONST.EMAIL.GUIDES_DOMAIN);
    }

    return privateDomains;
}

/**
 * Determines the most frequent domain from the `acceptedDomains` list
 * that appears in the email addresses of policy members.
 *
 * @param acceptedDomains - List of domains to consider.
 * @param policy - The policy object.
 */
function getMostFrequentEmailDomain(acceptedDomains: string[], policy?: Policy) {
    if (!policy) {
        return undefined;
    }
    const domainOccurrences = {} as Record<string, number>;
    for (const memberDomain of Object.keys(policy.employeeList ?? {})
        .concat(policy.owner)
        .map((email) => Str.extractEmailDomain(email).toLowerCase())) {
        if (!acceptedDomains.includes(memberDomain)) {
            continue;
        }
        domainOccurrences[memberDomain] = (domainOccurrences[memberDomain] || 0) + 1;
    }
    let mostFrequent = {domain: '', count: 0};
    for (const [domain, count] of Object.entries(domainOccurrences)) {
        if (count <= mostFrequent.count) {
            continue;
        }
        mostFrequent = {domain, count};
    }
    if (mostFrequent.count === 0) {
        return undefined;
    }
    return mostFrequent.domain;
}

const getPolicyIDFromDomainName = (domainName: string): string | undefined => domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1]?.toUpperCase();

/**
 * Returns the workspace an assigned card belongs to.
 *
 * A card names its workspace with `fundID`, which is the policy's `policyAccountID`. That holds whatever the feed's
 * domain looks like, so a card on a company's own domain resolves the same workspace as one on a workspace feed's
 * `expensify-policy<ID>.exfy` domain. The domain is read only as a fallback, for a card that arrives without a `fundID`.
 */
const getPolicyForAssignedCard = (card: OnyxEntry<Pick<Card, 'domainName' | 'fundID'>>, policies: OnyxCollection<Policy>): OnyxEntry<Policy> => {
    const workspaceAccountID = Number(card?.fundID);
    const policyForFund = workspaceAccountID ? Object.values(policies ?? {}).find((policy) => policy?.policyAccountID === workspaceAccountID) : undefined;
    if (policyForFund) {
        return policyForFund;
    }

    const policyID = card?.domainName ? getPolicyIDFromDomainName(card.domainName) : undefined;
    return policyID ? policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] : undefined;
};

const getDescriptionForPolicyDomainCard = (domainName: string, policies: OnyxCollection<Policy>): string => {
    // A domain name containing a policyID indicates that this is a workspace feed
    const policyID = getPolicyIDFromDomainName(domainName);
    if (policyID) {
        const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
        return policy?.name ?? domainName;
    }
    return domainName;
};

/** Whether a workspace has been provisioned with a Spotnana entity. */
function isWorkspaceProvisionedForTravel(travelSettings?: WorkspaceTravelSettings): boolean {
    return !!(travelSettings?.spotnanaCompanyID ?? travelSettings?.associatedTravelDomainAccountID);
}

/** Whether travel is enabled on a workspace, meaning it can be used to book a trip. */
function hasAcceptedTravelTerms(policy: OnyxEntry<Policy>, accountTravelSettings: TravelSettings | undefined): boolean {
    return !!(policy?.travelSettings?.hasAcceptedTerms ?? (accountTravelSettings?.hasAcceptedTerms && isWorkspaceProvisionedForTravel(policy?.travelSettings)));
}

function isNonUSDPolicy(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.outputCurrency && policy.outputCurrency !== CONST.CURRENCY.USD;
}

/**
 * Determines which travel step should be shown based on policy state
 */
function getTravelStep(
    policy: OnyxEntry<Policy>,
    travelSettings: TravelSettings | undefined,
    isTravelVerifiedBetaEnabled: boolean,
    policies: OnyxCollection<Policy>,
    currentUserLogin: string | undefined,
): TravelStep {
    const adminDomains = getAdminsPrivateEmailDomains(policy);
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    const groupPaidPolicies = activePolicies.filter(isPaidGroupPolicy);

    if (adminDomains.length === 0 || groupPaidPolicies.length < 1 || !isPaidGroupPolicy(policy)) {
        return CONST.TRAVEL.STEPS.GET_STARTED_TRAVEL;
    }
    if (policy?.travelSettings?.hasAcceptedTerms) {
        return CONST.TRAVEL.STEPS.BOOK_OR_MANAGE_YOUR_TRIP;
    }
    if (!isTravelVerifiedBetaEnabled && travelSettings?.lastTravelSignupRequestTime) {
        return CONST.TRAVEL.STEPS.REVIEWING_REQUEST;
    }
    return CONST.TRAVEL.STEPS.GET_STARTED_TRAVEL;
}

function sortPoliciesByName(policies: Policy[], localeCompare: (a: string, b: string) => number): Policy[] {
    // copy first: callers pass memoized selector output, sorting it in place makes the next deepEqual report a change
    return [...policies].sort((a, b) => localeCompare(a.name || '', b.name || ''));
}

/**
 * A member who was just invited is listed under an optimistic accountID derived from their login, and that entry is removed from
 * personal details once the invite request finishes and the backend supplies the real accountID. A member page opened
 * while the invite was still in flight therefore holds a stale accountID in its route. Recover the login from the employee list
 * so the page keeps resolving the member across that swap.
 */
function getMemberLoginByOptimisticAccountID(policy: OnyxEntry<Policy>, accountID: number) {
    const matchesOptimisticAccountID = (login: string) => generateAccountID(login) === accountID || generateAccountID(Str.removeSMSDomain(login)) === accountID;
    // A member invited by one of their secondary logins ends up listed under their primary login, so a route ID derived
    // from the secondary matches no employee — primaryLoginsInvited records that mapping and recovers the member.
    const primaryLoginOfInvitedSecondary = Object.entries(policy?.primaryLoginsInvited ?? {}).find(([secondaryLogin]) => matchesOptimisticAccountID(secondaryLogin))?.[1];
    if (primaryLoginOfInvitedSecondary) {
        return primaryLoginOfInvitedSecondary;
    }
    return Object.keys(policy?.employeeList ?? {}).find(matchesOptimisticAccountID) ?? '';
}

export {
    getActivePolicies,
    getActivePoliciesWithExpenseChat,
    getAdminEmployees,
    getIneligibleInvitees,
    getExcludedUsers,
    getMemberAccountIDsForWorkspace,
    getMemberLoginByOptimisticAccountID,
    getAccountIDForSubmitManagerEmail,
    getGuideAndAccountManagerInfo,
    getSoftExclusionsForGuideAndAccountManager,
    getExpensifyTeamExclusions,
    filterGuideAndAccountManager,
    goBackFromInvalidPolicy,
    canCreateCategoryInSitu,
    isExpensifyTeam,
    shouldFilterExpensifyTeam,
    createFilteredMemberCountSelector,
    createInvoiceConfigurationTextSelector,
    isDeletedPolicyEmployee,
    hasEligibleBankAccountShareRecipient,
    isPolicyFieldListEmpty,
    canUnarchivePolicy,
    isPolicyMember,
    isMemberInHomeAndOfficeWorkspace,
    shouldShowPolicy,
    getActiveAdminWorkspaces,
    hasActiveAdminWorkspaces,
    getOwnedPaidPolicies,
    canSendInvoiceFromWorkspace,
    canSubmitPerDiemExpenseFromWorkspace,
    canSendInvoice,
    getEligibleBankAccountShareRecipientEmails,
    hasCompanyAddress,
    hasOfficeWorkArrangement,
    getPolicyIDOrDefault,
    sortWorkspacesBySelected,
    goBackWhenEnableFeature,
    navigateToExpensifyCardPage,
    isNonMemberApprover,
    hasOnlyPersonalPolicies,
    getGroupPaidPolicies,
    getGroupPoliciesWhereReportCanBeCreated,
    getDefaultChatEnabledPolicy,
    getDefaultChatEnabledPolicySelection,
    getDomainNameForPolicy,
    getUserFriendlyWorkspaceType,
    getDefaultWorkspacePlanType,
    isPolicyAccessible,
    hasOtherControlWorkspaces,
    shouldBlockWorkspaceDeletionForInvoicifyUser,
    canModifyPlan,
    getAdminsPrivateEmailDomains,
    getMostFrequentEmailDomain,
    getPolicyIDFromDomainName,
    getPolicyForAssignedCard,
    getDescriptionForPolicyDomainCard,
    getActiveEmployeeWorkspaces,
    isPolicyMemberWithoutPendingDelete,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled,
    getPoliciesForRoomCreation,
    getTravelStep,
    isWorkspaceProvisionedForTravel,
    hasAcceptedTravelTerms,
    isNonUSDPolicy,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
    sortPoliciesByName,
    hasActiveExpensifyCard,
    tryNavigateToSubmitWorkspaceUpgrade,
    tryNavigateToControlPolicyUpgrade,
    hasAnyPaidPolicy,
};

// Re-exported with `export *` rather than through the block above: a named re-export becomes a getter that throws
// while this module is still loading, which breaks tests that spread `jest.requireActual('@libs/PolicyUtils')`
// from inside an import cycle.
export * from './tag';
export * from './vendor';
export * from './policyType';
export * from './permissions';
export * from './connections';
export * from './xero';
export * from './sageIntacct';
export * from './customUnits';
export * from './tax';
export * from './rules';
export * from './features';
export * from './workflows';
export * from './errors';
export * from './approvals';
export * from './payments';

export type {MemberEmailsToAccountIDs};
