/**
 * Active and visible workspaces, plan type, invoice and per diem availability, and workspace sorting.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';

import isTeachersUnitePolicyID from '@libs/isTeachersUnitePolicyID';
import {getIsOffline} from '@libs/NetworkState';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PolicyType} from '@src/types/form/WorkspaceConfirmationForm';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';
import type {CommuterExclusions} from '@src/types/onyx/Policy';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {hasAccountingConnections} from './connections';
import {getPerDiemCustomUnit, isPerDiemEligiblePolicy} from './customUnits';
import {isTimeTrackingEnabled} from './features';
import {canEditWorkspaceSettings, canMemberWrite, getPolicyRole, isPolicyAdmin, isPolicyOwner, isPolicyUser} from './permissions';
import {isArchivedPolicy, isControlPolicy, isGroupPolicy, isPaidGroupPolicy, isSubmitPolicy} from './policyType';

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

function getOwnedPaidPolicies(policies: OnyxCollection<Policy> | null, currentUserAccountID: number | undefined): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => isPolicyOwner(policy, currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID) && isPaidGroupPolicy(policy));
}

/** Whether the user can add a category to the workspace straight from an expense's category picker */
function canCreateCategoryInSitu(policy: OnyxEntry<Policy>, login?: string) {
    return canEditWorkspaceSettings(policy, login) && !hasAccountingConnections(policy) && !!policy?.areCategoriesEnabled;
}

/**
 * Whether the policy lets an expense with the given `reimbursable` value show the reimbursable toggle.
 *
 * A locked field (`disabledFields.reimbursable`) normally hides the toggle, but an expense that already
 * disagrees with the policy default has to stay correctable - otherwise it is silently stuck on the wrong value.
 * An absent `defaultReimbursable` or `isReimbursable` means "reimbursable", matching the expense creation path
 * and `getReimbursable`.
 */
function canShowReimbursableToggleForPolicy(policy: OnyxEntry<Policy>, isReimbursable: boolean | undefined): boolean {
    if (!policy?.disabledFields?.reimbursable) {
        return true;
    }
    return (isReimbursable ?? true) !== (policy.defaultReimbursable ?? true);
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

function hasOnlyPersonalPolicies(policies: OnyxCollection<Policy>) {
    return !Object.values(policies ?? {}).some((policy) => policy && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
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
 * Whether the user can create a report on this workspace: a paid (Team/Corporate) or Submit workspace the user
 * has a role on. Submit workspaces are free but still support report creation, so they belong here even though
 * they're excluded from `getGroupPaidPolicies`. A policy stub (e.g. the `{id, name}` the backend sends for a
 * preferred workspace the user is not a member of) has no type or role and is rejected.
 */
function canCreateReportOnPolicy(policy: OnyxEntry<Policy>, currentUserLogin?: string): policy is Policy {
    return (
        !!policy &&
        !policy.isJoinRequestPending &&
        (isPaidGroupPolicy(policy) || isSubmitPolicy(policy)) &&
        shouldShowPolicy(policy, false, currentUserLogin) &&
        !isTeachersUnitePolicyID(policy.id)
    );
}

/** Returns the group workspaces where the user can create a report; the collection form of `canCreateReportOnPolicy`. */
function getGroupPoliciesWhereReportCanBeCreated(policies: OnyxCollection<Policy> | null, currentUserLogin?: string) {
    if (isEmptyObject(policies)) {
        return CONST.EMPTY_ARRAY;
    }
    return Object.values(policies).filter((policy): policy is Policy => canCreateReportOnPolicy(policy, currentUserLogin));
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
        hasChatEnabledPolicies: groupPoliciesWithChatEnabled.length > 0,
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

function sortPoliciesByName(policies: Policy[], localeCompare: (a: string, b: string) => number): Policy[] {
    // copy first: callers pass memoized selector output, sorting it in place makes the next deepEqual report a change
    return [...policies].sort((a, b) => localeCompare(a.name || '', b.name || ''));
}

export {
    isPolicyFieldListEmpty,
    canUnarchivePolicy,
    getActivePolicies,
    getActivePoliciesWithExpenseChat,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
    hasCompanyAddress,
    hasOfficeWorkArrangement,
    getPolicyIDOrDefault,
    shouldShowPolicy,
    createInvoiceConfigurationTextSelector,
    getPoliciesForRoomCreation,
    getOwnedPaidPolicies,
    canCreateCategoryInSitu,
    canShowReimbursableToggleForPolicy,
    getActiveAdminWorkspaces,
    getActiveEmployeeWorkspaces,
    hasActiveAdminWorkspaces,
    canSendInvoiceFromWorkspace,
    canSubmitPerDiemExpenseFromWorkspace,
    canSendInvoice,
    sortWorkspacesBySelected,
    hasOnlyPersonalPolicies,
    getUserFriendlyWorkspaceType,
    getDefaultWorkspacePlanType,
    isPolicyAccessible,
    getGroupPaidPolicies,
    hasAnyPaidPolicy,
    canCreateReportOnPolicy,
    getGroupPoliciesWhereReportCanBeCreated,
    getDefaultChatEnabledPolicy,
    getDefaultChatEnabledPolicySelection,
    hasOtherControlWorkspaces,
    shouldBlockWorkspaceDeletionForInvoicifyUser,
    canModifyPlan,
    sortPoliciesByName,
};
