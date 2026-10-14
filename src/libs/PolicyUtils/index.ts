import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {PersonalDetailsByLogin} from '@components/PersonalDetailsByLoginProvider';

import {isQBORefreshTokenExpiringSoon} from '@libs/AccountingUtils';
import {getBankAccountFromID} from '@libs/actions/BankAccounts';
import {hasSynchronizationErrorMessage} from '@libs/actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from '@libs/actions/connections/QuickbooksOnline';
import addEncryptedAuthTokenToURL from '@libs/addEncryptedAuthTokenToURL';
import {getApiRoot} from '@libs/ApiUtils';
import {getCategoryApproverRule, hasAnyCategoryRules} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import isTeachersUnitePolicyID from '@libs/isTeachersUnitePolicyID';
import {getHRAdvancedModeFinalApprover, isAnyHRConnected, isMergeHRCompleteSetupNeeded, shouldShowHRConnectionError} from '@libs/merge/HRUtils';
import {isAnyRecruitingConnected} from '@libs/merge/RecruitingUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getIsOffline} from '@libs/NetworkState';
import {getAccountIDsByLogins} from '@libs/PersonalDetailsUtils';
import {isApprovalWorkflowRule, isRuleFilterComparison} from '@libs/RuleUtils';
import {getAllSortedTransactions, getCategory, getTag} from '@libs/TransactionUtils';
import {generateAccountID} from '@libs/UserUtils';
import {isPublicDomain, isValidAccountRoute} from '@libs/ValidationUtils';
import {getEffectiveWorkArrangement} from '@libs/WorkArrangementUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {PolicyType} from '@src/types/form/WorkspaceConfirmationForm';
import type {Card, OnyxInputOrEntry, PersonalDetailsList, Policy, PolicyCategories, PolicyEmployeeList, Report, TravelSettings} from '@src/types/onyx';
import type {ApprovalWorkflowRule} from '@src/types/onyx/ApprovalWorkflowRules';
import type {ErrorFields, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {ApprovalRule, CommuterExclusions, ConnectionName, PolicyFeatureName} from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import type Rule from '@src/types/onyx/Rule';
import type {RuleFilterComparison, RuleFilterNode} from '@src/types/onyx/RuleFilters';
import type {WorkspaceTravelSettings} from '@src/types/onyx/TravelSettings';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {NullishDeep, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {Str} from 'expensify-common';

import {getAccountingConnectionNames, hasAccountingFeatureConnection} from './connections';
import {getPerDiemCustomUnit, isPerDiemEligiblePolicy} from './customUnits';
import {canMemberWrite, getPolicyRole, isPolicyAdmin, isPolicyApprover, isPolicyOwner, isPolicyUser} from './permissions';
import {canPolicyAccessFeature, isArchivedPolicy, isCollectPolicy, isControlPolicy, isGroupPolicy, isPaidGroupPolicy, isSubmitPolicy} from './policyType';

type MemberEmailsToAccountIDs = Record<string, number>;

type TravelStep = ValueOf<typeof CONST.TRAVEL.STEPS>;

type WorkspaceDetails = {
    policyID: string | undefined;
    name: string;
};

/** The report facts an approval workflow rule is matched against. */
type ApprovalWorkflowContext = {
    /** Email of the member who submitted the report. */
    submitterEmail: string;

    /** Email of the approver the report is currently with. Empty when the report has not been approved yet. */
    currentApproverEmail?: string;

    /** Total of the report, in the backend (cents) amount the rules' `amount` filters are written in. */
    reportTotal: number;
};

/** The outcome of matching a report against the policy's approval workflow rules. */
type ApprovalWorkflowRuleMatch = {
    /** Email the matched rule forwards the report to. Undefined when the rule finalizes the report instead. */
    forwardsTo?: string;
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
 * Checks if we have any errors stored within the policy?.employeeList. Determines whether we should show a red brick road error or not.
 */
function shouldShowEmployeeListError(policy: OnyxEntry<Policy>): boolean {
    return isPolicyAdmin(policy) && Object.values(policy?.employeeList ?? {}).some((employee) => Object.keys(employee?.errors ?? {}).length > 0);
}

/**
 *  Check if the policy has any tax rate errors.
 */
function shouldShowTaxRateError(policy: OnyxEntry<Policy>): boolean {
    return (
        isPolicyAdmin(policy) &&
        Object.values(policy?.taxRates?.taxes ?? {}).some((taxRate) => Object.keys(taxRate?.errors ?? {}).length > 0 || Object.values(taxRate?.errorFields ?? {}).some(Boolean))
    );
}

/**
 * Check if the policy has any errors within the categories.
 */
function hasPolicyCategoriesError(policyCategories: OnyxEntry<PolicyCategories>): boolean {
    return Object.keys(policyCategories ?? {}).some((categoryName) => Object.keys(policyCategories?.[categoryName]?.errors ?? {}).length > 0);
}

/**
 * Check if the policy has any errors within the rules.
 */
function hasPolicyRulesError(policy: OnyxEntry<Policy>, hasMerchantRuleErrors: boolean): boolean {
    const agentRules = Object.values(policy?.rules?.agentRules ?? {});

    return hasMerchantRuleErrors || agentRules.some((rule) => rule && Object.keys(rule.errors ?? {}).length > 0);
}

/**
 * Checks if the policy had a sync error.
 */
function shouldShowSyncError(policy: OnyxEntry<Policy>, isSyncInProgress: boolean, connectionNames?: readonly ConnectionName[]): boolean {
    const connectionsToCheck = connectionNames ?? (Object.keys(policy?.connections ?? {}) as ConnectionName[]);
    return isPolicyAdmin(policy) && connectionsToCheck.some((connection) => !!hasSynchronizationErrorMessage(policy, connection, isSyncInProgress));
}

/**
 * Check if the policy has any error fields.
 */
function shouldShowPolicyErrorFields(policy: OnyxEntry<Policy>): boolean {
    return isPolicyAdmin(policy) && Object.values(policy?.errorFields ?? {}).some((fieldErrors) => Object.keys(fieldErrors ?? {}).length > 0);
}

/**
 * Check if the policy has any errors, and if it doesn't, then check if it has any error fields.
 */
function shouldShowPolicyError(policy: OnyxEntry<Policy>): boolean {
    return Object.keys(policy?.errors ?? {}).length > 0 ? isPolicyAdmin(policy) : shouldShowPolicyErrorFields(policy);
}

/**
 * Checks if we have any errors stored within the policy custom units.
 */
function shouldShowCustomUnitsError(policy: OnyxEntry<Policy>): boolean {
    return isPolicyAdmin(policy) && Object.keys(policy?.customUnits?.errors ?? {}).length > 0;
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
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy: OnyxEntry<Policy>, isConnectionInProgress: boolean): ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined {
    if (
        shouldShowEmployeeListError(policy) ||
        shouldShowCustomUnitsError(policy) ||
        shouldShowPolicyErrorFields(policy) ||
        shouldShowSyncError(policy, isConnectionInProgress, getAccountingConnectionNames()) ||
        shouldShowQBOReimbursableExportDestinationAccountError(policy) ||
        shouldShowHRConnectionError(policy, isConnectionInProgress, isPolicyAdmin(policy))
    ) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return undefined;
}

/**
 * Returns whether the Merge HR setup still needs to be completed for a policy.
 */
const isMergeHRCompleteSetupNeededSelector = (policy: OnyxEntry<Policy>) => isMergeHRCompleteSetupNeeded(policy);

/**
 * Returns whether an admin should be warned that the workspace's QuickBooks Online connection is about to expire.
 */
const isQBORefreshTokenExpiringSoonSelector = (policy: OnyxEntry<Policy>) => isPolicyAdmin(policy) && isQBORefreshTokenExpiringSoon(policy);

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

/**
 * Resolve the email of the workspace's Authorized Payer (reimburser), matching the canonical resolution used across the app.
 * Returns undefined when reimbursement is disabled or no payer can be resolved.
 */
function getReimburserEmail(policy: OnyxEntry<Policy>): string | undefined {
    if (!policy) {
        return undefined;
    }

    const reimbursementChoice = getReimbursementChoice(policy);
    const isAutoReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
    const isManualReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;

    // Reimbursement is disabled for this workspace.
    if (!isAutoReimbursement && !isManualReimbursement) {
        return undefined;
    }

    return policy.reimburser ?? policy.achAccount?.reimburser ?? (isManualReimbursement ? policy.owner : undefined);
}

/**
 * Payer fields to merge into the successData of an ownership transfer. The backend keeps the former payer when the
 * workspace has a bank account, so only reassign when there is none and the outgoing owner is the resolved payer.
 */
function getOwnerChangePayerSuccessData(policy: OnyxEntry<Policy>, newOwnerLogin: string): NullishDeep<Policy> {
    if (!policy || policy.achAccount?.bankAccountID || getReimburserEmail(policy) !== policy.owner) {
        return {};
    }

    return {
        ...(policy.reimburser ? {reimburser: newOwnerLogin} : {}),
        ...(policy.achAccount?.reimburser ? {achAccount: {reimburser: newOwnerLogin}} : {}),
    };
}

function isPolicyPayer(policy: OnyxEntry<Policy>, currentUserLogin: string | undefined): boolean {
    if (!policy) {
        return false;
    }

    const isAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
    const reimbursementChoice = getReimbursementChoice(policy);
    const isAutoReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
    const isManualReimbursement = reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;

    // Reimbursement is disabled for this workspace.
    if (!isAutoReimbursement && !isManualReimbursement) {
        return false;
    }

    const reimburserEmail = getReimburserEmail(policy);

    // No designated reimburser means any workspace admin can pay.
    if (!reimburserEmail) {
        return isAdmin;
    }

    const canPayOnPolicy = isAdmin || (!!currentUserLogin && canMemberWrite(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS));

    return canPayOnPolicy && currentUserLogin === reimburserEmail;
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

/**
 * Checks if a policy has any custom categories (categories not in the default list)
 */
function hasCustomCategories(policyCategories: OnyxEntry<PolicyCategories>): boolean {
    if (!policyCategories) {
        return false;
    }

    const defaultCategoryNames = new Set<string>(Object.values(CONST.POLICY.DEFAULT_CATEGORIES));

    return Object.values(policyCategories).some((category) => category && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !defaultCategoryNames.has(category.name));
}

/**
 * Checks whether a policy max expense amount (e.g. `maxExpenseAmountNoReceipt`) is actually configured.
 *
 * `0` is a valid limit meaning "always required", so a falsy check would wrongly treat an explicit $0.00 as unset.
 * Only `undefined` and `CONST.DISABLED_MAX_EXPENSE_VALUE` mean the amount is not set.
 */
function isMaxExpenseAmountSet(value: number | undefined): value is number {
    return value !== undefined && value !== CONST.DISABLED_MAX_EXPENSE_VALUE;
}

/**
 * Checks if a policy has any rules configured (structured rules, individual expense limits, or prohibited expenses).
 */
function hasConfiguredRules(policy: OnyxEntry<Policy>, policyCategories: PolicyCategories | null | undefined, hasExpenseDefaultRules: boolean): boolean {
    if (!policy) {
        return false;
    }

    if (hasExpenseDefaultRules) {
        return true;
    }

    if (!!policy.customRules && policy.customRules.trim().length > 0) {
        return true;
    }

    const {rules: policyRules} = policy;
    if (!!policyRules?.approvalRules && policyRules.approvalRules.length > 0) {
        return true;
    }
    if (!!policyRules?.expenseRules && policyRules.expenseRules.length > 0) {
        return true;
    }
    if (!!policy.maxExpenseAmount && policy.maxExpenseAmount !== CONST.DISABLED_MAX_EXPENSE_VALUE && policy.maxExpenseAmount !== CONST.POLICY.DEFAULT_MAX_EXPENSE_AMOUNT) {
        return true;
    }
    if (!!policy.maxExpenseAge && policy.maxExpenseAge !== CONST.DISABLED_MAX_EXPENSE_VALUE && policy.maxExpenseAge !== CONST.POLICY.DEFAULT_MAX_EXPENSE_AGE) {
        return true;
    }
    if (
        !!policy.maxExpenseAmountNoReceipt &&
        policy.maxExpenseAmountNoReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE &&
        policy.maxExpenseAmountNoReceipt !== CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_RECEIPT
    ) {
        return true;
    }
    if (
        !!policy.maxExpenseAmountNoItemizedReceipt &&
        policy.maxExpenseAmountNoItemizedReceipt !== CONST.DISABLED_MAX_EXPENSE_VALUE &&
        policy.maxExpenseAmountNoItemizedReceipt !== CONST.POLICY.DEFAULT_MAX_AMOUNT_NO_ITEMIZED_RECEIPT
    ) {
        return true;
    }

    if (policy.defaultBillable) {
        return true;
    }
    if (policy.defaultReimbursable === false) {
        return true;
    }
    if (policy.eReceipts) {
        return true;
    }
    if (policy.requireCompanyCardsEnabled) {
        return true;
    }

    const {prohibitedExpenses} = policy;
    if (
        !!prohibitedExpenses &&
        Object.entries(CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES).some(([key, defaultValue]) => {
            const value = prohibitedExpenses[key as keyof typeof CONST.POLICY.DEFAULT_PROHIBITED_EXPENSES];
            return value !== undefined && value !== defaultValue;
        })
    ) {
        return true;
    }

    return hasAnyCategoryRules(policyCategories ?? undefined);
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
 * For backwards compatibility with Expensify Classic, attendee tracking defaults to enabled
 * on Control policies when the property is undefined.
 */
function isAttendeeTrackingEnabled(policy: OnyxEntry<Policy>): boolean {
    return (isControlPolicy(policy) && policy?.isAttendeeTrackingEnabled) ?? true;
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

/**
 * Checks if policy's scheduled submit / auto reporting frequency is "instant".
 * Note: Free policies have "instant" submit always enabled.
 */
function isInstantSubmitEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.autoReporting === true && policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
}

/**
 * Checks if policy's scheduled submit / auto reporting frequency is not "instant".
 */
function isDelayedSubmissionEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.autoReporting === true && policy?.autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
}

/**
 * This gets a "corrected" value for autoReportingFrequency. The purpose of this function is to encapsulate some logic around the "immediate" frequency.
 *
 * - "immediate" is actually not immediate. For that you want "instant".
 * - (immediate && harvesting.enabled) === daily
 * - (immediate && !harvesting.enabled) === manual
 *
 * Note that "daily" and "manual" only exist as options for the API, not in the database or Onyx.
 */
function getCorrectedAutoReportingFrequency(policy: OnyxInputOrEntry<Policy>): ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES> | undefined {
    if (policy?.autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE) {
        return policy?.autoReportingFrequency;
    }

    if (policy?.harvesting?.enabled) {
        // This is actually not really "immediate". It's "daily". Surprise!
        return CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
    }

    // "manual" is really just "immediate" (aka "daily") with harvesting disabled
    return CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL;
}

/**
 * Checks if policy's approval mode is "optional", a.k.a. "Submit & Close"
 */
function isSubmitAndClose(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL;
}

/**
 * Resolves a workspace's reimbursement choice to one of the three values in `CONST.POLICY.REIMBURSEMENT_CHOICES`.
 * Comparing the raw field instead makes a workspace reporting a deprecated value look like it has reimbursement
 * disabled, which hides Pay on its approved reports.
 */
function getReimbursementChoice(policy: OnyxInputOrEntry<Policy>): ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES> | undefined {
    switch (policy?.reimbursementChoice) {
        case CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO:
            return CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
        case CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL:
            return CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
        default:
            return policy?.reimbursementChoice;
    }
}

function arePaymentsEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return getReimbursementChoice(policy) !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
}

/** Whether the workspace has everything auto-pay approved reports needs: workflows, direct reimbursements, and a business bank account. */
function isAutoPayApprovedReportsAvailable(policy: OnyxInputOrEntry<Policy>): boolean {
    return !!policy?.areWorkflowsEnabled && getReimbursementChoice(policy) === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES && !!policy?.achAccount?.bankAccountID;
}

/**
 * Returns true when the user is both a submitter and an approver, mirroring the Submit/Approve suggested-search eligibility in
 * `getSuggestedSearchesVisibility` (SearchUIUtils): a submitter is a member of any group workspace, and an approver is a member of a
 * group workspace with a non-optional approval flow whom `isPolicyApprover` recognizes (named approver or someone reports submit/forward to).
 */
function isSubmitterAndApprover(policies: OnyxCollection<Policy> | null | undefined, currentUserEmail: string | undefined): boolean {
    if (!policies || !currentUserEmail) {
        return false;
    }
    let isSubmitter = false;
    let isApprover = false;
    for (const policy of Object.values(policies)) {
        if (!policy) {
            continue;
        }
        isSubmitter = isSubmitter || isGroupPolicy(policy);
        if (!isApprover) {
            const hasApprovalFlow = isGroupPolicy(policy) && !!policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL;
            isApprover = hasApprovalFlow && isPolicyApprover(policy, currentUserEmail);
        }
        if (isSubmitter && isApprover) {
            return true;
        }
    }
    return false;
}

function isControlOnAdvancedApprovalMode(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE && getApprovalWorkflow(policy) === CONST.POLICY.APPROVAL_MODE.ADVANCED;
}

/**
 * Checks if policy has Dynamic External Workflow enabled
 */
function hasDynamicExternalWorkflow(policy: OnyxEntry<Policy>): boolean {
    return policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL;
}

/**
 * Checks if the approval workflow configuration must stay hidden because the workspace's Dynamic External Workflow has
 * "Hide People Table Columns" set. The backend only returns `dynamicExternalWorkflowHidePeople` when it is `true`, so an
 * absent flag means "show". The approval mode is checked too, so a stale flag can't hide workflows on a policy that no
 * longer uses a Dynamic External Workflow.
 */
function shouldHideDynamicExternalWorkflowPeople(policy: OnyxEntry<Policy>): boolean {
    return hasDynamicExternalWorkflow(policy) && !!policy?.dynamicExternalWorkflowHidePeople;
}

function goBackFromInvalidPolicy() {
    Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
}

function arePolicyRulesEnabled(policy: OnyxEntry<Policy>, policyCategories?: PolicyCategories | null): boolean {
    if (!isPaidGroupPolicy(policy)) {
        return false;
    }
    if (policy?.areRulesEnabled === true) {
        return true;
    }
    if (policy?.areRulesEnabled === false) {
        return false;
    }
    // areRulesEnabled is undefined - this can happen in case of migrated old Control policies, in such case users might have set up category rules in Classic and we should show Rules as enabled
    if (!isControlPolicy(policy)) {
        return false;
    }
    return hasAnyCategoryRules(policyCategories ?? undefined);
}

/**
 * Whether Invoice Fields is enabled for the policy.
 * Respects the `areInvoiceFieldsEnabled` toggle and verifies the policy has access to the feature (Control only).
 */
function isInvoiceFieldsEnabled(policy: OnyxEntry<Policy> | null): boolean {
    return !!policy?.areInvoiceFieldsEnabled && canPolicyAccessFeature(policy ?? undefined, CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED);
}

function isPolicyFeatureEnabled(policy: OnyxEntry<Policy>, featureName: PolicyFeatureName, policyCategories?: PolicyCategories | null): boolean {
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_RULES_ENABLED) {
        return arePolicyRulesEnabled(policy, policyCategories);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_INVOICE_FIELDS_ENABLED) {
        return isInvoiceFieldsEnabled(policy);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED) {
        return !!policy?.tax?.trackingEnabled;
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED) {
        return policy?.[featureName] ? !!policy?.[featureName] : hasAccountingFeatureConnection(policy);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.IS_MCP_ENABLED) {
        return isMCPEnabled(policy);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.IS_HR_ENABLED) {
        return policy?.isHREnabled === true || isAnyHRConnected(policy);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.IS_RECRUITING_ENABLED) {
        return policy?.isRecruitingEnabled === true || isAnyRecruitingConnected(policy);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED) {
        return policy?.receiptPartners?.enabled ?? false;
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED) {
        return isTimeTrackingEnabled(policy);
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.IS_ATTENDEE_TRACKING_ENABLED) {
        return isAttendeeTrackingEnabled(policy);
    }

    return !!policy?.[featureName];
}

function getApprovalWorkflow(policy: OnyxEntry<Policy>): ValueOf<typeof CONST.POLICY.APPROVAL_MODE> {
    if (policy?.type === CONST.POLICY.TYPE.PERSONAL) {
        return CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    }

    return policy?.approvalMode ?? CONST.POLICY.APPROVAL_MODE.ADVANCED;
}

function getDefaultApprover(policy: OnyxEntry<Policy>): string {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return policy?.approver || policy?.owner || '';
}

/**
 * Whether an approver email points at someone who is no longer on the workspace. The owner always counts as a member,
 * and HR advanced (manager) mode is excluded, because its final approver doesn't have to be a workspace member.
 */
function isNonMemberApprover(policy: OnyxEntry<Policy>, approverEmail: string | undefined): boolean {
    return !!approverEmail && !isPolicyMember(policy, approverEmail) && !getHRAdvancedModeFinalApprover(policy);
}

/**
 * Whether the policy has at least one custom approval workflow. A workflow is considered custom when either:
 * - the default workflow was modified by changing its first approver or adding an "Approves to" user, or
 * - a new workflow was created (a member submits to an approver other than the default approver).
 */
function hasCustomApprovalWorkflow(policy: OnyxEntry<Policy>): boolean {
    if (!policy) {
        return false;
    }

    const defaultApprover = getDefaultApprover(policy);

    // The default workflow's first approver was changed away from the workspace owner.
    if (!!policy.approver && !!policy.owner && policy.approver !== policy.owner) {
        return true;
    }

    const employees = policy.employeeList ?? {};

    // The default approver forwards approvals to someone, i.e. an "Approves to" user was added,
    // either unconditionally (forwardsTo) or above an approval limit (overLimitForwardsTo).
    const defaultApproverEmployee = employees[defaultApprover];
    if (!!defaultApprover && (!!defaultApproverEmployee?.forwardsTo || !!defaultApproverEmployee?.overLimitForwardsTo)) {
        return true;
    }

    // A new workflow exists when a member submits to an approver other than the default approver.
    return Object.values(employees).some(
        (employee) => employee?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!employee?.submitsTo && employee.submitsTo !== defaultApprover,
    );
}

function getRuleApprovers(policy: OnyxEntry<Policy>, expenseReport: OnyxEntry<Report>) {
    const categoryApprovers: string[] = [];
    const tagApprovers: string[] = [];
    const allReportTransactions = getAllSortedTransactions(expenseReport?.reportID);

    // Before submitting to their `submitsTo` (in a policy on Advanced Approvals), submit to category/tag approvers.
    // Category approvers are prioritized, then tag approvers.
    for (let i = 0; i < allReportTransactions.length; i++) {
        const transaction = allReportTransactions.at(i);
        const tag = getTag(transaction);
        const category = getCategory(transaction);
        const categoryApprover = getCategoryApproverRule(policy?.rules?.approvalRules ?? [], category)?.approver;
        const tagApprover = getTagApproverRule(policy, tag)?.approver;
        if (categoryApprover) {
            categoryApprovers.push(categoryApprover);
        }

        if (tagApprover) {
            tagApprovers.push(tagApprover);
        }
    }

    // Return the unique approvers list
    return [...new Set([...categoryApprovers, ...tagApprovers])];
}

function getFirstRuleApprover(approvalRules: ApprovalRule[], expenseReport: OnyxEntry<Report>, ownerLogin: string | undefined) {
    // Pre-build a lookup map of { category: { value → approver }, tag: { value → approver } }
    // from the policy's approval rules so that each transaction's category/tag can be resolved in O(1).
    const rulesMap: Record<'category' | 'tag', Record<string, string>> = {
        category: {},
        tag: {},
    };

    for (let i = 0; i < approvalRules.length; i++) {
        const rule = approvalRules.at(i);
        if (!rule) {
            continue;
        }
        for (let j = 0; j < rule.applyWhen.length; j++) {
            const applyWhen = rule.applyWhen.at(j);
            if (applyWhen?.condition !== CONST.POLICY.RULE_CONDITIONS.MATCHES) {
                continue;
            }
            if (applyWhen.field === CONST.POLICY.FIELDS.CATEGORY || applyWhen.field === CONST.POLICY.FIELDS.TAG) {
                rulesMap[applyWhen.field][applyWhen.value] = rule.approver;
            }
        }
    }

    if (isEmptyObject(rulesMap.category) && isEmptyObject(rulesMap.tag)) {
        return '';
    }

    const allReportTransactions = getAllSortedTransactions(expenseReport?.reportID);

    if (!allReportTransactions.length) {
        return '';
    }

    let firstCategoryApprover = '';
    let firstTagApprover = '';

    for (let i = 0; i < allReportTransactions.length; i++) {
        const transaction = allReportTransactions.at(i);
        const category = getCategory(transaction);
        const categoryApprover = rulesMap.category[category];

        // Category approvers take strict priority over tag approvers.
        // Break immediately on the first match so we don't keep scanning transactions unnecessarily.
        if (categoryApprover && categoryApprover !== ownerLogin) {
            firstCategoryApprover = categoryApprover;
            break;
        }

        // Only look for a tag approver if we haven't found one yet — no need to re-check on subsequent transactions.
        if (!firstTagApprover) {
            const tag = getTag(transaction);
            const tagApprover = rulesMap.tag[tag];

            if (tagApprover && tagApprover !== ownerLogin) {
                firstTagApprover = tagApprover;
            }
        }
    }

    return firstCategoryApprover || firstTagApprover;
}

function matchesApprovalWorkflowEmailComparison(node: RuleFilterComparison, email: string | undefined): boolean {
    const expectedEmails = (Array.isArray(node.right) ? node.right : [node.right]).map((value) => String(value).toLowerCase());
    const isMatch = !!email && expectedEmails.includes(email.toLowerCase());
    return node.operator === CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO ? !isMatch : isMatch;
}

function matchesApprovalWorkflowAmountComparison(node: RuleFilterComparison, amount: number): boolean {
    const expectedAmount = typeof node.right === 'number' ? node.right : Number(node.right);
    if (Number.isNaN(expectedAmount)) {
        return false;
    }

    switch (node.operator) {
        case CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO:
            return amount === expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO:
            return amount !== expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN:
            return amount > expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN_OR_EQUAL_TO:
            return amount >= expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN:
            return amount < expectedAmount;
        case CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO:
            return amount <= expectedAmount;
        default:
            return false;
    }
}

function evaluateApprovalWorkflowFilter(node: RuleFilterNode, context: ApprovalWorkflowContext): boolean {
    if (!isRuleFilterComparison(node)) {
        const left = evaluateApprovalWorkflowFilter(node.left, context);
        const right = evaluateApprovalWorkflowFilter(node.right, context);
        return node.operator === CONST.SEARCH.SYNTAX_OPERATORS.OR ? left || right : left && right;
    }

    switch (node.left) {
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM:
            return matchesApprovalWorkflowEmailComparison(node, context.submitterEmail);

        // A report with no current approver has not been approved by anybody yet, so a rule based on who
        // approved it last cannot apply.
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.TO:
            return !!context.currentApproverEmail && matchesApprovalWorkflowEmailComparison(node, context.currentApproverEmail);
        case CONST.SEARCH.SYNTAX_FILTER_KEYS.AMOUNT:
            return matchesApprovalWorkflowAmountComparison(node, Math.abs(context.reportTotal));

        default:
            return false;
    }
}

/**
 * True when every condition in the rule's filter tree is true for `context`.
 */
function evaluateApprovalWorkflowRule(rule: ApprovalWorkflowRule, context: ApprovalWorkflowContext): boolean {
    return evaluateApprovalWorkflowFilter(rule.filters, context);
}

/**
 * Check the policy's approval workflow rules to determine where the report goes next.
 */
function getForwardsToFromRules(policy: OnyxEntry<Policy>, context: ApprovalWorkflowContext, rules: OnyxCollection<Rule>): ApprovalWorkflowRuleMatch | undefined {
    if (!policy?.id || !context.submitterEmail) {
        return undefined;
    }

    const trigger = context.currentApproverEmail ? CONST.RULES.TRIGGERS.REPORT_APPROVE : CONST.RULES.TRIGGERS.REPORT_SUBMIT;

    // Sort by Onyx key so the rule picked stays the same across evaluations when more than one matches (which should not happen).
    const ruleKeys = Object.keys(rules ?? {}).sort();
    for (const ruleKey of ruleKeys) {
        const rule = rules?.[ruleKey];
        if (!rule || rule.scope !== CONST.RULES.SCOPE.POLICY || rule.scopeID !== policy.id || rule.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            continue;
        }
        if (!isApprovalWorkflowRule(rule) || !Object.values(rule.triggers ?? {}).includes(trigger)) {
            continue;
        }
        if (!evaluateApprovalWorkflowRule(rule, context)) {
            continue;
        }

        return {forwardsTo: Object.values(rule.actions ?? {}).find((action) => action.name === CONST.RULES.ACTIONS.FORWARD_TO)?.approver};
    }

    return undefined;
}

function getManagerAccountEmail(policy: OnyxEntry<Policy>, ownerLogin: string | undefined, rules: OnyxCollection<Rule>, reportTotal = 0): string {
    const ruleMatch = getForwardsToFromRules(policy, {submitterEmail: ownerLogin ?? '', reportTotal}, rules);
    if (ruleMatch) {
        return ruleMatch.forwardsTo ?? '';
    }

    const defaultApprover = getDefaultApprover(policy);

    // For policy using the optional or basic workflow, the manager is the policy default approver.
    if (([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy))) {
        return defaultApprover;
    }

    const employee = policy?.employeeList?.[ownerLogin ?? ''];
    if (!employee && !defaultApprover) {
        return '';
    }

    return employee?.submitsTo ?? defaultApprover ?? '';
}

function getManagerAccountID(policy: OnyxEntry<Policy>, ownerLogin: string | undefined, rules: OnyxCollection<Rule>, reportTotal = 0) {
    const managerEmail = getManagerAccountEmail(policy, ownerLogin, rules, reportTotal);
    return managerEmail ? (getAccountIDsByLogins([managerEmail]).at(0) ?? -1) : -1;
}

/**
 * Returns the email the expense report should submit to per workspace approval config
 * (approval rules, employee submitsTo, or default approver for basic/optional workflows).
 */
function getSubmitToEmail(
    policy: OnyxEntry<Policy>,
    expenseReport: OnyxEntry<Report>,
    ownerLogin: string | undefined,
    rules: OnyxCollection<Rule>,
    shouldFallBackWhenManagerIsNotMember = false,
): string {
    const approvalRules = policy?.rules?.approvalRules;

    if (!isSubmitAndClose(policy) && approvalRules?.length) {
        const ruleApprover = getFirstRuleApprover(approvalRules, expenseReport, ownerLogin);
        if (ruleApprover) {
            return ruleApprover;
        }
    }

    const ruleMatch = getForwardsToFromRules(policy, {submitterEmail: ownerLogin ?? '', reportTotal: expenseReport?.total ?? 0}, rules);
    if (ruleMatch) {
        return ruleMatch.forwardsTo ?? '';
    }

    const managerEmail = getManagerAccountEmail(policy, ownerLogin, rules, expenseReport?.total ?? 0);

    // Falls back to the default approver when the manager is unavailable.
    if (shouldFallBackWhenManagerIsNotMember && managerEmail && !policy?.employeeList?.[managerEmail] && !getHRAdvancedModeFinalApprover(policy)) {
        return getDefaultApprover(policy);
    }

    return managerEmail;
}

/**
 * Returns the accountID to whom the given expenseReport submits reports to in the given Policy.
 */
function getSubmitToAccountID(
    policy: OnyxEntry<Policy>,
    expenseReport: OnyxEntry<Report>,
    ownerLogin: string | undefined,
    rules: OnyxCollection<Rule>,
    shouldFallBackWhenManagerIsNotMember = false,
): number {
    const submitToEmail = getSubmitToEmail(policy, expenseReport, ownerLogin, rules, shouldFallBackWhenManagerIsNotMember);
    return submitToEmail ? (getAccountIDsByLogins([submitToEmail]).at(0) ?? CONST.DEFAULT_NUMBER_ID) : CONST.DEFAULT_NUMBER_ID;
}

function getSubmitReportManagerAccountID(
    policy: OnyxEntry<Policy>,
    expenseReport: OnyxEntry<Report>,
    submitterLogin: string | undefined,
    rules: OnyxCollection<Rule>,
    personalDetailsByLogins: PersonalDetailsByLogin,
): number | undefined {
    const approvalRules = policy?.rules?.approvalRules;
    const ruleApprover = !isSubmitAndClose(policy) && approvalRules?.length ? getFirstRuleApprover(approvalRules, expenseReport, submitterLogin) : '';
    const hasReliablePolicyRoute =
        ([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy)) ||
        !!ruleApprover ||
        !!policy?.employeeList?.[submitterLogin ?? ''];

    if (!hasReliablePolicyRoute) {
        return undefined;
    }

    const submitToEmail = getSubmitToEmail(policy, expenseReport, submitterLogin, rules, true);
    const submitToAccountID = submitToEmail ? personalDetailsByLogins[submitToEmail]?.accountID : undefined;
    if (submitToAccountID === undefined || !isValidAccountRoute(submitToAccountID)) {
        return undefined;
    }

    return submitToAccountID;
}

/**
 * Returns the email of the account to forward the report to depending on the approver's approval limit.
 * Used for advanced approval mode only.
 *
 * `submitterEmail` is needed to consult the workspace's approval workflow rules, which describe each hop in
 * terms of who submitted the report as well as who is approving it. Without it only the legacy employeeList
 * forwardsTo/overLimitForwardsTo is considered.
 */
function getForwardsToAccount(policy: OnyxEntry<Policy>, employeeEmail: string, reportTotal: number, rules: OnyxCollection<Rule>, submitterEmail?: string): string {
    const ruleMatch = submitterEmail ? getForwardsToFromRules(policy, {submitterEmail, currentApproverEmail: employeeEmail, reportTotal}, rules) : undefined;
    if (ruleMatch) {
        return ruleMatch.forwardsTo ?? '';
    }

    if (!isControlOnAdvancedApprovalMode(policy)) {
        return '';
    }

    const employee = policy?.employeeList?.[employeeEmail];
    if (!employee) {
        return '';
    }

    const positiveReportTotal = Math.abs(reportTotal);
    if (employee.approvalLimit && employee.overLimitForwardsTo && positiveReportTotal > employee.approvalLimit) {
        return employee.overLimitForwardsTo;
    }
    return employee.forwardsTo ?? '';
}

/**
 * Returns the accountID of the policy reimburser, if not available returns -1.
 */
function getReimburserAccountID(policy: OnyxEntry<Policy>): number {
    const reimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner ?? '';
    return reimburserEmail ? (getAccountIDsByLogins([reimburserEmail]).at(0) ?? -1) : -1;
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

function areSettingsInErrorFields(settings?: string[], errorFields?: ErrorFields) {
    if (settings === undefined || errorFields === undefined) {
        return false;
    }

    const keys = Object.keys(errorFields);
    return settings.some((setting) => keys.includes(setting));
}

function settingsPendingAction(settings?: string[], pendingFields?: PendingFields<string>): PendingAction | undefined {
    if (settings === undefined || pendingFields === undefined) {
        return null;
    }

    const key = Object.keys(pendingFields).find((setting) => settings.includes(setting));
    if (!key) {
        return;
    }
    return pendingFields[key];
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

function getTagApproverRule(policy: OnyxEntry<Policy>, tagName: string) {
    if (!policy) {
        return;
    }

    const approvalRules = policy.rules?.approvalRules ?? [];
    const approverRule = approvalRules.find((rule) =>
        rule.applyWhen.find(({condition, field, value}) => condition === CONST.POLICY.RULE_CONDITIONS.MATCHES && field === CONST.POLICY.FIELDS.TAG && value === tagName),
    );

    return approverRule;
}

function getDomainNameForPolicy(policyID?: string): string {
    if (!policyID) {
        return '';
    }

    return `${CONST.EXPENSIFY_POLICY_DOMAIN}${policyID.toLowerCase()}${CONST.EXPENSIFY_POLICY_DOMAIN_EXTENSION}`;
}

function getWorkflowApprovalsUnavailable(policy: OnyxEntry<Policy>) {
    return policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL || !!policy?.errorFields?.approvalMode;
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

/**
 * Returns if the policy has the Time Tracking feature enabled.
 */
function isTimeTrackingEnabled(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.units?.time?.enabled;
}

/** MCP is on for every workspace unless an admin has explicitly turned it off, so an absent flag reads as enabled. */
function isMCPEnabled(policy: OnyxEntry<Policy>): boolean {
    return policy?.isMCPEnabled ?? true;
}

/**
 * Returns the policy's default hourly rate for the Time Tracking feature.
 */
function getDefaultTimeTrackingRate(policy: Partial<OnyxEntry<Policy>>): number | undefined {
    return policy?.units?.time?.rate !== undefined ? convertToBackendAmount(policy.units.time.rate) : undefined;
}

function sortPoliciesByName(policies: Policy[], localeCompare: (a: string, b: string) => number): Policy[] {
    // copy first: callers pass memoized selector output, sorting it in place makes the next deepEqual report a change
    return [...policies].sort((a, b) => localeCompare(a.name || '', b.name || ''));
}

/**
 * Builds a source URL for rendering a policy document PDF.
 * Local blob/file URIs (from optimistic uploads) are returned directly.
 * Remote URLs are routed through the authenticated GetPolicyRulesDocument streaming endpoint.
 * The stored URL (which contains a unique timestamp per upload) is appended as a version
 * parameter so the browser treats each replacement as a distinct resource.
 */
function getRulesDocumentSourceURL(rulesDocumentURL: string | undefined, policyID: string | undefined, encryptedAuthToken: string): string {
    if (!rulesDocumentURL || !policyID) {
        return '';
    }

    const isLocalFile = rulesDocumentURL.startsWith('blob:') || rulesDocumentURL.startsWith('file:');
    if (isLocalFile) {
        return rulesDocumentURL;
    }

    return addEncryptedAuthTokenToURL(
        // Each PDF upload gets a unique S3 key, so rulesDocumentURL changes on every replacement.
        // Encoding it as cacheBuster ensures the full streaming URL is also unique, preventing stale browser/pdfjs cache.
        `${getApiRoot({shouldUseSecure: false})}api/GetPolicyRulesDocument?policyID=${policyID}&cacheBuster=${encodeURIComponent(rulesDocumentURL)}`,
        encryptedAuthToken,
        true,
    );
}

export {
    getActivePolicies,
    getActivePoliciesWithExpenseChat,
    getAdminEmployees,
    getIneligibleInvitees,
    getExcludedUsers,
    getMemberAccountIDsForWorkspace,
    getAccountIDForSubmitManagerEmail,
    getGuideAndAccountManagerInfo,
    getSoftExclusionsForGuideAndAccountManager,
    getExpensifyTeamExclusions,
    filterGuideAndAccountManager,
    getPolicyBrickRoadIndicatorStatus,
    hasCustomCategories,
    hasConfiguredRules,
    isMaxExpenseAmountSet,
    goBackFromInvalidPolicy,
    shouldShowSyncError,
    shouldShowCustomUnitsError,
    shouldShowEmployeeListError,
    hasPolicyCategoriesError,
    hasPolicyRulesError,
    shouldShowPolicyError,
    shouldShowTaxRateError,
    isExpensifyTeam,
    shouldFilterExpensifyTeam,
    createFilteredMemberCountSelector,
    createInvoiceConfigurationTextSelector,
    isDeletedPolicyEmployee,
    isInstantSubmitEnabled,
    isDelayedSubmissionEnabled,
    getCorrectedAutoReportingFrequency,
    hasEligibleBankAccountShareRecipient,
    arePolicyRulesEnabled,
    isPolicyFeatureEnabled,
    isPolicyFieldListEmpty,
    canUnarchivePolicy,
    isPolicyMember,
    isMemberInHomeAndOfficeWorkspace,
    isPolicyPayer,
    getReimburserEmail,
    getOwnerChangePayerSuccessData,
    arePaymentsEnabled,
    isAutoPayApprovedReportsAvailable,
    getReimbursementChoice,
    isSubmitterAndApprover,
    isSubmitAndClose,
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
    getDefaultApprover,
    isNonMemberApprover,
    hasCustomApprovalWorkflow,
    getApprovalWorkflow,
    getReimburserAccountID,
    isAttendeeTrackingEnabled,
    hasOnlyPersonalPolicies,
    areSettingsInErrorFields,
    settingsPendingAction,
    getGroupPaidPolicies,
    getGroupPoliciesWhereReportCanBeCreated,
    getDefaultChatEnabledPolicy,
    getDefaultChatEnabledPolicySelection,
    getForwardsToAccount,
    getForwardsToFromRules,
    evaluateApprovalWorkflowRule,
    getSubmitToAccountID,
    getSubmitReportManagerAccountID,
    getTagApproverRule,
    getDomainNameForPolicy,
    getWorkflowApprovalsUnavailable,
    getUserFriendlyWorkspaceType,
    getDefaultWorkspacePlanType,
    isPolicyAccessible,
    hasOtherControlWorkspaces,
    shouldBlockWorkspaceDeletionForInvoicifyUser,
    getManagerAccountEmail,
    getSubmitToEmail,
    getRuleApprovers,
    canModifyPlan,
    getAdminsPrivateEmailDomains,
    getMostFrequentEmailDomain,
    getPolicyIDFromDomainName,
    getPolicyForAssignedCard,
    getDescriptionForPolicyDomainCard,
    getManagerAccountID,
    getActiveEmployeeWorkspaces,
    isPolicyMemberWithoutPendingDelete,
    hasDynamicExternalWorkflow,
    shouldHideDynamicExternalWorkflowPeople,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled,
    getPoliciesForRoomCreation,
    isInvoiceFieldsEnabled,
    getTravelStep,
    isWorkspaceProvisionedForTravel,
    hasAcceptedTravelTerms,
    isNonUSDPolicy,
    isTimeTrackingEnabled,
    isMCPEnabled,
    getDefaultTimeTrackingRate,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
    sortPoliciesByName,
    hasActiveExpensifyCard,
    tryNavigateToSubmitWorkspaceUpgrade,
    tryNavigateToControlPolicyUpgrade,
    getRulesDocumentSourceURL,
    hasAnyPaidPolicy,
    isMergeHRCompleteSetupNeededSelector,
    isQBORefreshTokenExpiringSoonSelector,
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

export type {MemberEmailsToAccountIDs};
