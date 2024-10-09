import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {OnyxInputOrEntry, Policy, PolicyCategories, PolicyEmployeeList, PolicyTagLists, PolicyTags, TaxRate} from '@src/types/onyx';
import type {ErrorFields, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {
    ConnectionLastSync,
    ConnectionName,
    Connections,
    CustomUnit,
    InvoiceItem,
    NetSuiteAccount,
    NetSuiteConnection,
    NetSuiteCustomList,
    NetSuiteCustomSegment,
    NetSuiteTaxAccount,
    NetSuiteVendor,
    PolicyConnectionSyncProgress,
    PolicyFeatureName,
    Rate,
    Tenant,
} from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {hasSynchronizationErrorMessage} from './actions/connections';
import * as Localize from './Localize';
import Navigation from './Navigation/Navigation';
import * as NetworkStore from './Network/NetworkStore';
import {getAccountIDsByLogins, getLoginsByAccountIDs, getPersonalDetailByEmail} from './PersonalDetailsUtils';

type MemberEmailsToAccountIDs = Record<string, number>;

type WorkspaceDetails = {
    policyID: string | undefined;
    name: string;
};

type ConnectionWithLastSyncData = {
    /** State of the last synchronization */
    lastSync?: ConnectionLastSync;
};

let allPolicies: OnyxCollection<Policy>;

Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (value) => (allPolicies = value),
});

/**
 * Filter out the active policies, which will exclude policies with pending deletion
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePolicies(policies: OnyxCollection<Policy> | null): Policy[] {
    return Object.values(policies ?? {}).filter<Policy>(
        (policy): policy is Policy => !!policy && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!policy.name && !!policy.id,
    );
}

/**
 * Checks if we have any errors stored within the policy?.employeeList. Determines whether we should show a red brick road error or not.
 */
function hasEmployeeListError(policy: OnyxEntry<Policy>): boolean {
    return Object.values(policy?.employeeList ?? {}).some((employee) => Object.keys(employee?.errors ?? {}).length > 0);
}

/**
 *  Check if the policy has any tax rate errors.
 */
function hasTaxRateError(policy: OnyxEntry<Policy>): boolean {
    return Object.values(policy?.taxRates?.taxes ?? {}).some((taxRate) => Object.keys(taxRate?.errors ?? {}).length > 0 || Object.values(taxRate?.errorFields ?? {}).some(Boolean));
}

/**
 * Check if the policy has any errors within the categories.
 */
function hasPolicyCategoriesError(policyCategories: OnyxEntry<PolicyCategories>): boolean {
    return Object.keys(policyCategories ?? {}).some((categoryName) => Object.keys(policyCategories?.[categoryName]?.errors ?? {}).length > 0);
}

/**
 * Checks if the policy had a sync error.
 */
function hasSyncError(policy: OnyxEntry<Policy>, isSyncInProgress: boolean): boolean {
    return (Object.keys(policy?.connections ?? {}) as ConnectionName[]).some((connection) => !!hasSynchronizationErrorMessage(policy, connection, isSyncInProgress));
}

/**
 * Check if the policy has any error fields.
 */
function hasPolicyErrorFields(policy: OnyxEntry<Policy>): boolean {
    return Object.values(policy?.errorFields ?? {}).some((fieldErrors) => Object.keys(fieldErrors ?? {}).length > 0);
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

function getNumericValue(value: number | string, toLocaleDigit: (arg: string) => string): number | string {
    const numValue = parseFloat(value.toString().replace(toLocaleDigit('.'), '.'));
    if (Number.isNaN(numValue)) {
        return NaN;
    }
    return numValue.toFixed(CONST.CUSTOM_UNITS.RATE_DECIMALS);
}

/**
 * Retrieves the distance custom unit object for the given policy
 */
function getCustomUnit(policy: OnyxEntry<Policy>): CustomUnit | undefined {
    return Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
}

/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getCustomUnitRate(policy: OnyxEntry<Policy>, customUnitRateID: string): Rate | undefined {
    const distanceUnit = getCustomUnit(policy);
    return distanceUnit?.rates[customUnitRateID];
}

function getRateDisplayValue(value: number, toLocaleDigit: (arg: string) => string, withDecimals?: boolean): string {
    const numValue = getNumericValue(value, toLocaleDigit);
    if (Number.isNaN(numValue)) {
        return '';
    }

    if (withDecimals) {
        const decimalPart = numValue.toString().split('.').at(1);
        if (decimalPart) {
            const fixedDecimalPoints = decimalPart.length > 2 && !decimalPart.endsWith('0') ? 3 : 2;
            return Number(numValue).toFixed(fixedDecimalPoints).toString().replace('.', toLocaleDigit('.'));
        }
    }

    return numValue.toString().replace('.', toLocaleDigit('.')).substring(0, value.toString().length);
}

function getUnitRateValue(toLocaleDigit: (arg: string) => string, customUnitRate?: Rate, withDecimals?: boolean) {
    return getRateDisplayValue((customUnitRate?.rate ?? 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET, toLocaleDigit, withDecimals);
}

/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy: OnyxEntry<Policy>, isConnectionInProgress: boolean): ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined {
    if (hasEmployeeListError(policy) || hasCustomUnitsError(policy) || hasPolicyErrorFields(policy) || hasSyncError(policy, isConnectionInProgress)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return undefined;
}

function getPolicyRole(policy: OnyxInputOrEntry<Policy>, currentUserLogin: string | undefined) {
    return policy?.role ?? policy?.employeeList?.[currentUserLogin ?? '-1']?.role;
}

/**
 * Check if the policy can be displayed
 * If offline, always show the policy pending deletion.
 * If online, show the policy pending deletion only if there is an error.
 * Note: Using a local ONYXKEYS.NETWORK subscription will cause a delay in
 * updating the screen. Passing the offline status from the component.
 */
function shouldShowPolicy(policy: OnyxEntry<Policy>, isOffline: boolean, currentUserLogin: string | undefined): boolean {
    return (
        !!policy &&
        (policy?.type !== CONST.POLICY.TYPE.PERSONAL || !!policy?.isJoinRequestPending) &&
        (isOffline || policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy.errors ?? {}).length > 0) &&
        !!getPolicyRole(policy, currentUserLogin)
    );
}

function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the current user is an admin of the policy.
 */
const isPolicyAdmin = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean => getPolicyRole(policy, currentUserLogin) === CONST.POLICY.ROLE.ADMIN;

/**
 * Checks if the current user is of the role "user" on the policy.
 */
const isPolicyUser = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean => getPolicyRole(policy, currentUserLogin) === CONST.POLICY.ROLE.USER;

/**
 * Checks if the current user is an auditor of the policy
 */
const isPolicyAuditor = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean =>
    (policy?.role ?? (currentUserLogin && policy?.employeeList?.[currentUserLogin]?.role)) === CONST.POLICY.ROLE.AUDITOR;

const isPolicyEmployee = (policyID: string, policies: OnyxCollection<Policy>): boolean => Object.values(policies ?? {}).some((policy) => policy?.id === policyID);

/**
 * Checks if the current user is an owner (creator) of the policy.
 */
const isPolicyOwner = (policy: OnyxInputOrEntry<Policy>, currentUserAccountID: number): boolean => policy?.ownerAccountID === currentUserAccountID;

/**
 * Create an object mapping member emails to their accountIDs. Filter for members without errors if includeMemberWithErrors is false, and get the login email from the personalDetail object using the accountID.
 *
 * If includeMemberWithErrors is false, We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getMemberAccountIDsForWorkspace(employeeList: PolicyEmployeeList | undefined, includeMemberWithErrors = false, includeMemberWithPendingDelete = true): MemberEmailsToAccountIDs {
    const members = employeeList ?? {};
    const memberEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
    Object.keys(members).forEach((email) => {
        if (!includeMemberWithErrors) {
            const member = members?.[email];
            if (Object.keys(member?.errors ?? {})?.length > 0) {
                return;
            }
        }
        if (!includeMemberWithPendingDelete) {
            const member = members?.[email];
            if (member.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                return;
            }
        }
        const personalDetail = getPersonalDetailByEmail(email);
        if (!personalDetail?.login) {
            return;
        }
        memberEmailsToAccountIDs[email] = Number(personalDetail.accountID);
    });
    return memberEmailsToAccountIDs;
}

/**
 * Get login list that we should not show in the workspace invite options
 */
function getIneligibleInvitees(employeeList?: PolicyEmployeeList): string[] {
    const policyEmployeeList = employeeList ?? {};
    const memberEmailsToExclude: string[] = [...CONST.EXPENSIFY_EMAILS];
    Object.keys(policyEmployeeList).forEach((email) => {
        const policyEmployee = policyEmployeeList?.[email];
        // Policy members that are pending delete or have errors are not valid and we should show them in the invite options (don't exclude them).
        if (policyEmployee?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policyEmployee?.errors ?? {}).length > 0) {
            return;
        }
        if (!email) {
            return;
        }
        memberEmailsToExclude.push(email);
    });

    return memberEmailsToExclude;
}

function getSortedTagKeys(policyTagList: OnyxEntry<PolicyTagLists>): Array<keyof PolicyTagLists> {
    if (isEmptyObject(policyTagList)) {
        return [];
    }

    return Object.keys(policyTagList).sort((key1, key2) => policyTagList[key1].orderWeight - policyTagList[key2].orderWeight);
}

/**
 * Gets a tag name of policy tags based on a tag's orderWeight.
 */
function getTagListName(policyTagList: OnyxEntry<PolicyTagLists>, orderWeight: number): string {
    if (isEmptyObject(policyTagList)) {
        return '';
    }

    return Object.values(policyTagList).find((tag) => tag.orderWeight === orderWeight)?.name ?? '';
}

/**
 * Gets all tag lists of a policy
 */
function getTagLists(policyTagList: OnyxEntry<PolicyTagLists>): Array<ValueOf<PolicyTagLists>> {
    if (isEmptyObject(policyTagList)) {
        return [];
    }

    return Object.values(policyTagList)
        .filter((policyTagListValue) => policyTagListValue !== null)
        .sort((tagA, tagB) => tagA.orderWeight - tagB.orderWeight);
}

/**
 * Gets a tag list of a policy by a tag index
 */
function getTagList(policyTagList: OnyxEntry<PolicyTagLists>, tagIndex: number): ValueOf<PolicyTagLists> {
    const tagLists = getTagLists(policyTagList);
    return (
        tagLists.at(tagIndex) ?? {
            name: '',
            required: false,
            tags: {},
            orderWeight: 0,
        }
    );
}

function getTagNamesFromTagsLists(policyTagLists: PolicyTagLists): string[] {
    const uniqueTagNames = new Set<string>();

    for (const policyTagList of Object.values(policyTagLists ?? {})) {
        for (const tag of Object.values(policyTagList.tags ?? {})) {
            uniqueTagNames.add(getCleanedTagName(tag.name));
        }
    }
    return Array.from(uniqueTagNames);
}

/**
 * Cleans up escaping of colons (used to create multi-level tags, e.g. "Parent: Child") in the tag name we receive from the backend
 */
function getCleanedTagName(tag: string) {
    return tag?.replace(/\\:/g, CONST.COLON);
}

/**
 * Escape colon from tag name
 */
function escapeTagName(tag: string) {
    return tag?.replaceAll(CONST.COLON, '\\:');
}

/**
 * Gets a count of enabled tags of a policy
 */
function getCountOfEnabledTagsOfList(policyTags: PolicyTags) {
    return Object.values(policyTags).filter((policyTag) => policyTag.enabled).length;
}

/**
 * Whether the policy has multi-level tags
 */
function isMultiLevelTags(policyTagList: OnyxEntry<PolicyTagLists>): boolean {
    return Object.keys(policyTagList ?? {}).length > 1;
}

function isPendingDeletePolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isPaidGroupPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM || policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function getOwnedPaidPolicies(policies: OnyxCollection<Policy> | null, currentUserAccountID: number): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => isPolicyOwner(policy, currentUserAccountID) && isPaidGroupPolicy(policy));
}

function isControlPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function isTaxTrackingEnabled(isPolicyExpenseChat: boolean, policy: OnyxEntry<Policy>, isDistanceRequest: boolean): boolean {
    const distanceUnit = getCustomUnit(policy);
    const customUnitID = distanceUnit?.customUnitID;
    const isPolicyTaxTrackingEnabled = isPolicyExpenseChat && policy?.tax?.trackingEnabled;
    const isTaxEnabledForDistance = isPolicyTaxTrackingEnabled && policy?.customUnits?.[customUnitID]?.attributes?.taxEnabled;

    return !!(isDistanceRequest ? isTaxEnabledForDistance : isPolicyTaxTrackingEnabled);
}

/**
 * Checks if policy's scheduled submit / auto reporting frequency is "instant".
 * Note: Free policies have "instant" submit always enabled.
 */
function isInstantSubmitEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.autoReporting === true && policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
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

function arePaymentsEnabled(policy: OnyxEntry<Policy>): boolean {
    return policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
}

function isControlOnAdvancedApprovalMode(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE && getApprovalWorkflow(policy) === CONST.POLICY.APPROVAL_MODE.ADVANCED;
}

function extractPolicyIDFromPath(path: string) {
    return path.match(CONST.REGEX.POLICY_ID_FROM_PATH)?.[1];
}

/**
 * Whether the policy has active accounting integration connections
 */
function hasAccountingConnections(policy: OnyxEntry<Policy>) {
    return !isEmptyObject(policy?.connections);
}

function getPathWithoutPolicyID(path: string) {
    return path.replace(CONST.REGEX.PATH_WITHOUT_POLICY_ID, '/');
}

function getPolicyEmployeeListByIdWithoutCurrentUser(policies: OnyxCollection<Pick<Policy, 'employeeList'>>, currentPolicyID?: string, currentUserAccountID?: number) {
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${currentPolicyID}`] ?? null;
    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
    return Object.values(policyMemberEmailsToAccountIDs)
        .map((policyMemberAccountID) => Number(policyMemberAccountID))
        .filter((policyMemberAccountID) => policyMemberAccountID !== currentUserAccountID);
}

function goBackFromInvalidPolicy() {
    Navigation.navigate(ROUTES.SETTINGS_WORKSPACES);
}

/** Get a tax with given ID from policy */
function getTaxByID(policy: OnyxEntry<Policy>, taxID: string): TaxRate | undefined {
    return policy?.taxRates?.taxes?.[taxID];
}

/** Get a tax rate object built like Record<TaxRateName, RelatedTaxRateKeys>.
 * We want to allow user to choose over TaxRateName and there might be a situation when one TaxRateName has two possible keys in different policies */
function getAllTaxRatesNamesAndKeys(): Record<string, string[]> {
    const allTaxRates: Record<string, string[]> = {};
    Object.values(allPolicies ?? {})?.forEach((policy) => {
        if (!policy?.taxRates?.taxes) {
            return;
        }
        Object.entries(policy?.taxRates?.taxes).forEach(([taxRateKey, taxRate]) => {
            if (!allTaxRates[taxRate.name]) {
                allTaxRates[taxRate.name] = [taxRateKey];
                return;
            }
            allTaxRates[taxRate.name].push(taxRateKey);
        });
    });
    return allTaxRates;
}

/**
 * Whether the tax rate can be deleted and disabled
 */
function canEditTaxRate(policy: Policy, taxID: string): boolean {
    return policy.taxRates?.defaultExternalID !== taxID && policy.taxRates?.foreignTaxDefault !== taxID;
}

function isPolicyFeatureEnabled(policy: OnyxEntry<Policy>, featureName: PolicyFeatureName): boolean {
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED) {
        return !!policy?.tax?.trackingEnabled;
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED) {
        return policy?.[featureName] ? !!policy?.[featureName] : !isEmptyObject(policy?.connections);
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
    return policy?.approver ?? policy?.owner ?? '';
}

/**
 * Returns the accountID to whom the given employeeAccountID submits reports to in the given Policy.
 */
function getSubmitToAccountID(policy: OnyxEntry<Policy>, employeeAccountID: number): number {
    const employeeLogin = getLoginsByAccountIDs([employeeAccountID]).at(0) ?? '';
    const defaultApprover = getDefaultApprover(policy);

    // For policy using the optional or basic workflow, the manager is the policy default approver.
    if (([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy))) {
        return getAccountIDsByLogins([defaultApprover]).at(0) ?? -1;
    }

    const employee = policy?.employeeList?.[employeeLogin];
    if (!employee) {
        return -1;
    }

    return getAccountIDsByLogins([employee.submitsTo ?? defaultApprover]).at(0) ?? -1;
}

function getSubmitToEmail(policy: OnyxEntry<Policy>, employeeAccountID: number): string {
    const submitToAccountID = getSubmitToAccountID(policy, employeeAccountID);
    return getLoginsByAccountIDs([submitToAccountID]).at(0) ?? '';
}

/**
 * Returns the email of the account to forward the report to depending on the approver's approval limit.
 * Used for advanced approval mode only.
 */
function getForwardsToAccount(policy: OnyxEntry<Policy>, employeeEmail: string, reportTotal: number): string {
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
    const reimburserEmail = policy?.achAccount?.reimburser ?? '';
    return reimburserEmail ? getAccountIDsByLogins([reimburserEmail]).at(0) ?? -1 : -1;
}

function getPersonalPolicy() {
    return Object.values(allPolicies ?? {}).find((policy) => policy?.type === CONST.POLICY.TYPE.PERSONAL);
}

function getAdminEmployees(policy: OnyxEntry<Policy>): PolicyEmployee[] {
    if (!policy || !policy.employeeList) {
        return [];
    }
    return Object.keys(policy.employeeList)
        .map((email) => ({...policy.employeeList?.[email], email}))
        .filter((employee) => employee.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Returns the policy of the report
 */
function getPolicy(policyID: string | undefined): OnyxEntry<Policy> {
    if (!allPolicies || !policyID) {
        return undefined;
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/** Return active policies where current user is an admin */
function getActiveAdminWorkspaces(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    const activePolicies = getActivePolicies(policies);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, NetworkStore.isOffline(), currentUserLogin) && isPolicyAdmin(policy, currentUserLogin));
}

/** Whether the user can send invoice from the workspace */
function canSendInvoiceFromWorkspace(policyID: string | undefined): boolean {
    const policy = getPolicy(policyID);
    return policy?.areInvoicesEnabled ?? false;
}

/** Whether the user can send invoice */
function canSendInvoice(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): boolean {
    return getActiveAdminWorkspaces(policies, currentUserLogin).some((policy) => canSendInvoiceFromWorkspace(policy.id));
}

function hasDependentTags(policy: OnyxEntry<Policy>, policyTagList: OnyxEntry<PolicyTagLists>) {
    if (!policy?.hasMultipleTagLists) {
        return false;
    }
    return Object.values(policyTagList ?? {}).some((tagList) => Object.values(tagList.tags).some((tag) => !!tag.rules?.parentTagsFilter || !!tag.parentTagsFilter));
}

/** Get the Xero organizations connected to the policy */
function getXeroTenants(policy: Policy | undefined): Tenant[] {
    // Due to the way optional chain is being handled in this useMemo we are forced to use this approach to properly handle undefined values
    // eslint-disable-next-line @typescript-eslint/prefer-optional-chain
    if (!policy || !policy.connections || !policy.connections.xero || !policy.connections.xero.data) {
        return [];
    }
    return policy.connections.xero.data.tenants ?? [];
}

function findCurrentXeroOrganization(tenants: Tenant[] | undefined, organizationID: string | undefined): Tenant | undefined {
    return tenants?.find((tenant) => tenant.id === organizationID);
}

function getCurrentXeroOrganizationName(policy: Policy | undefined): string | undefined {
    return findCurrentXeroOrganization(getXeroTenants(policy), policy?.connections?.xero?.config?.tenantID)?.name;
}

function getXeroBankAccounts(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const bankAccounts = policy?.connections?.xero?.data?.bankAccounts ?? [];

    return (bankAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
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
    return pendingFields[key ?? '-1'];
}

function findSelectedVendorWithDefaultSelect(vendors: NetSuiteVendor[] | undefined, selectedVendorId: string | undefined) {
    const selectedVendor = (vendors ?? []).find(({id}) => id === selectedVendorId);
    return selectedVendor ?? vendors?.[0] ?? undefined;
}

function findSelectedBankAccountWithDefaultSelect(accounts: NetSuiteAccount[] | undefined, selectedBankAccountId: string | undefined) {
    const selectedBankAccount = (accounts ?? []).find(({id}) => id === selectedBankAccountId);
    return selectedBankAccount ?? accounts?.[0] ?? undefined;
}

function findSelectedInvoiceItemWithDefaultSelect(invoiceItems: InvoiceItem[] | undefined, selectedItemId: string | undefined) {
    const selectedInvoiceItem = (invoiceItems ?? []).find(({id}) => id === selectedItemId);
    return selectedInvoiceItem ?? invoiceItems?.[0] ?? undefined;
}

function findSelectedTaxAccountWithDefaultSelect(taxAccounts: NetSuiteTaxAccount[] | undefined, selectedAccountId: string | undefined) {
    const selectedTaxAccount = (taxAccounts ?? []).find(({externalID}) => externalID === selectedAccountId);
    return selectedTaxAccount ?? taxAccounts?.[0] ?? undefined;
}

function getNetSuiteVendorOptions(policy: Policy | undefined, selectedVendorId: string | undefined): SelectorType[] {
    const vendors = policy?.connections?.netsuite.options.data.vendors;

    const selectedVendor = findSelectedVendorWithDefaultSelect(vendors, selectedVendorId);

    return (vendors ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedVendor?.id === id,
    }));
}

function getNetSuitePayableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList;

    const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(payableAccounts, selectedBankAccountId);

    return (payableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedPayableAccount?.id === id,
    }));
}

function getNetSuiteReceivableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const receivableAccounts = policy?.connections?.netsuite.options.data.receivableList;

    const selectedReceivableAccount = findSelectedBankAccountWithDefaultSelect(receivableAccounts, selectedBankAccountId);

    return (receivableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedReceivableAccount?.id === id,
    }));
}

function getNetSuiteInvoiceItemOptions(policy: Policy | undefined, selectedItemId: string | undefined): SelectorType[] {
    const invoiceItems = policy?.connections?.netsuite.options.data.items;

    const selectedInvoiceItem = findSelectedInvoiceItemWithDefaultSelect(invoiceItems, selectedItemId);

    return (invoiceItems ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedInvoiceItem?.id === id,
    }));
}

function getNetSuiteTaxAccountOptions(policy: Policy | undefined, subsidiaryCountry?: string, selectedAccountId?: string): SelectorType[] {
    const taxAccounts = policy?.connections?.netsuite.options.data.taxAccountsList;
    const accountOptions = (taxAccounts ?? []).filter(({country}) => country === subsidiaryCountry);

    const selectedTaxAccount = findSelectedTaxAccountWithDefaultSelect(accountOptions, selectedAccountId);

    return accountOptions.map(({externalID, name}) => ({
        value: externalID,
        text: name,
        keyForList: externalID,
        isSelected: selectedTaxAccount?.externalID === externalID,
    }));
}

function canUseTaxNetSuite(canUseNetSuiteUSATax?: boolean, subsidiaryCountry?: string) {
    return !!canUseNetSuiteUSATax || CONST.NETSUITE_TAX_COUNTRIES.includes(subsidiaryCountry ?? '');
}

function canUseProvincialTaxNetSuite(subsidiaryCountry?: string) {
    return subsidiaryCountry === '_canada';
}

function getFilteredReimbursableAccountOptions(payableAccounts: NetSuiteAccount[] | undefined) {
    return (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.BANK || type === CONST.NETSUITE_ACCOUNT_TYPE.CREDIT_CARD);
}

function getNetSuiteReimbursableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList;
    const accountOptions = getFilteredReimbursableAccountOptions(payableAccounts);

    const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(accountOptions, selectedBankAccountId);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedPayableAccount?.id === id,
    }));
}

function getFilteredCollectionAccountOptions(payableAccounts: NetSuiteAccount[] | undefined) {
    return (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.BANK);
}

function getNetSuiteCollectionAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList;
    const accountOptions = getFilteredCollectionAccountOptions(payableAccounts);

    const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(accountOptions, selectedBankAccountId);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedPayableAccount?.id === id,
    }));
}

function getFilteredApprovalAccountOptions(payableAccounts: NetSuiteAccount[] | undefined) {
    return (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE);
}

function getNetSuiteApprovalAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList;
    const defaultApprovalAccount: NetSuiteAccount = {
        id: CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
        name: Localize.translateLocal('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
        type: CONST.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
    };
    const accountOptions = getFilteredApprovalAccountOptions([defaultApprovalAccount].concat(payableAccounts ?? []));

    const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(accountOptions, selectedBankAccountId);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedPayableAccount?.id === id,
    }));
}

function getCustomersOrJobsLabelNetSuite(policy: Policy | undefined, translate: LocaleContextProps['translate']): string | undefined {
    const importMapping = policy?.connections?.netsuite?.options?.config?.syncOptions?.mapping;
    if (!importMapping?.customers && !importMapping?.jobs) {
        return undefined;
    }
    const importFields: string[] = [];
    const importCustomer = importMapping?.customers ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;
    const importJobs = importMapping?.jobs ?? CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT;

    if (importCustomer === CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT && importJobs === CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        return undefined;
    }

    const importedValue = importMapping?.customers !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT ? importCustomer : importJobs;

    if (importCustomer !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        importFields.push(translate('workspace.netsuite.import.customersOrJobs.customers'));
    }

    if (importJobs !== CONST.INTEGRATION_ENTITY_MAP_TYPES.NETSUITE_DEFAULT) {
        importFields.push(translate('workspace.netsuite.import.customersOrJobs.jobs'));
    }

    const importedValueLabel = translate(`workspace.netsuite.import.customersOrJobs.label`, {
        importFields,
        importType: translate(`workspace.accounting.importTypes.${importedValue}`).toLowerCase(),
    });
    return importedValueLabel.charAt(0).toUpperCase() + importedValueLabel.slice(1);
}

function getNetSuiteImportCustomFieldLabel(
    policy: Policy | undefined,
    importField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>,
    translate: LocaleContextProps['translate'],
): string | undefined {
    const fieldData = policy?.connections?.netsuite?.options?.config.syncOptions?.[importField] ?? [];
    if (fieldData.length === 0) {
        return undefined;
    }

    const mappingSet = new Set(fieldData.map((item) => item.mapping));
    const importedTypes = Array.from(mappingSet)
        .sort((a, b) => b.localeCompare(a))
        .map((mapping) => translate(`workspace.netsuite.import.importTypes.${mapping}.label`).toLowerCase());
    return translate(`workspace.netsuite.import.importCustomFields.label`, {importedTypes});
}

function isNetSuiteCustomSegmentRecord(customField: NetSuiteCustomList | NetSuiteCustomSegment): boolean {
    return 'segmentName' in customField;
}

function getNameFromNetSuiteCustomField(customField: NetSuiteCustomList | NetSuiteCustomSegment): string {
    return 'segmentName' in customField ? customField.segmentName : customField.listName;
}

function isNetSuiteCustomFieldPropertyEditable(customField: NetSuiteCustomList | NetSuiteCustomSegment, fieldName: string) {
    const fieldsAllowedToEdit = isNetSuiteCustomSegmentRecord(customField) ? [INPUT_IDS.SEGMENT_NAME, INPUT_IDS.INTERNAL_ID, INPUT_IDS.SCRIPT_ID, INPUT_IDS.MAPPING] : [INPUT_IDS.MAPPING];
    const fieldKey = fieldName as keyof typeof customField;
    return fieldsAllowedToEdit.includes(fieldKey);
}

function getIntegrationLastSuccessfulDate(connection?: Connections[keyof Connections], connectionSyncProgress?: PolicyConnectionSyncProgress) {
    let syncSuccessfulDate;
    if (!connection) {
        return undefined;
    }
    if ((connection as NetSuiteConnection)?.lastSyncDate) {
        syncSuccessfulDate = (connection as NetSuiteConnection)?.lastSyncDate;
    } else {
        syncSuccessfulDate = (connection as ConnectionWithLastSyncData)?.lastSync?.successfulDate;
    }

    if (
        connectionSyncProgress &&
        connectionSyncProgress.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
        syncSuccessfulDate &&
        connectionSyncProgress.timestamp > syncSuccessfulDate
    ) {
        syncSuccessfulDate = connectionSyncProgress.timestamp;
    }
    return syncSuccessfulDate;
}

function getCurrentSageIntacctEntityName(policy: Policy | undefined, defaultNameIfNoEntity: string): string | undefined {
    const currentEntityID = policy?.connections?.intacct?.config?.entity;
    if (!currentEntityID) {
        return defaultNameIfNoEntity;
    }
    const entities = policy?.connections?.intacct?.data?.entities;
    return entities?.find((entity) => entity.id === currentEntityID)?.name;
}

function getSageIntacctBankAccounts(policy?: Policy, selectedBankAccountId?: string): SelectorType[] {
    const bankAccounts = policy?.connections?.intacct?.data?.bankAccounts ?? [];
    return (bankAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

function getSageIntacctVendors(policy?: Policy, selectedVendorId?: string): SelectorType[] {
    const vendors = policy?.connections?.intacct?.data?.vendors ?? [];
    return vendors.map(({id, value}) => ({
        value: id,
        text: value,
        keyForList: id,
        isSelected: selectedVendorId === id,
    }));
}

function getSageIntacctNonReimbursableActiveDefaultVendor(policy?: Policy): string | undefined {
    const {
        nonReimbursableCreditCardChargeDefaultVendor: creditCardDefaultVendor,
        nonReimbursableVendor: expenseReportDefaultVendor,
        nonReimbursable,
    } = policy?.connections?.intacct?.config.export ?? {};

    return nonReimbursable === CONST.SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE.CREDIT_CARD_CHARGE ? creditCardDefaultVendor : expenseReportDefaultVendor;
}

function getSageIntacctCreditCards(policy?: Policy, selectedAccount?: string): SelectorType[] {
    const creditCards = policy?.connections?.intacct?.data?.creditCards ?? [];
    return creditCards.map(({name}) => ({
        value: name,
        text: name,
        keyForList: name,
        isSelected: name === selectedAccount,
    }));
}

/**
 * Sort the workspaces by their name, while keeping the selected one at the beginning.
 * @param workspace1 Details of the first workspace to be compared.
 * @param workspace2 Details of the second workspace to be compared.
 * @param selectedWorkspaceID ID of the selected workspace which needs to be at the beginning.
 */
const sortWorkspacesBySelected = (workspace1: WorkspaceDetails, workspace2: WorkspaceDetails, selectedWorkspaceID: string | undefined): number => {
    if (workspace1.policyID === selectedWorkspaceID) {
        return -1;
    }
    if (workspace2.policyID === selectedWorkspaceID) {
        return 1;
    }
    return workspace1.name?.toLowerCase().localeCompare(workspace2.name?.toLowerCase() ?? '') ?? 0;
};

/**
 * Takes removes pendingFields and errorFields from a customUnit
 */
function removePendingFieldsFromCustomUnit(customUnit: CustomUnit): CustomUnit {
    const cleanedCustomUnit = {...customUnit};

    delete cleanedCustomUnit.pendingFields;
    delete cleanedCustomUnit.errorFields;

    return cleanedCustomUnit;
}

function navigateWhenEnableFeature(policyID: string) {
    setTimeout(() => {
        Navigation.navigate(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
    }, CONST.WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY);
}

function getConnectedIntegration(policy: Policy | undefined, accountingIntegrations?: ConnectionName[]) {
    return (accountingIntegrations ?? Object.values(CONST.POLICY.CONNECTIONS.NAME)).find((integration) => !!policy?.connections?.[integration]);
}

function hasIntegrationAutoSync(policy: Policy | undefined, connectedIntegration?: ConnectionName) {
    return (connectedIntegration && policy?.connections?.[connectedIntegration]?.config?.autoSync?.enabled) ?? false;
}

function hasUnsupportedIntegration(policy: Policy | undefined, accountingIntegrations?: ConnectionName[]) {
    return !(accountingIntegrations ?? Object.values(CONST.POLICY.CONNECTIONS.NAME)).some((integration) => !!policy?.connections?.[integration]);
}

function getCurrentConnectionName(policy: Policy | undefined): string | undefined {
    const accountingIntegrations = Object.values(CONST.POLICY.CONNECTIONS.NAME);
    const connectionKey = accountingIntegrations.find((integration) => !!policy?.connections?.[integration]);
    return connectionKey ? CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY[connectionKey] : undefined;
}

/**
 * Check if the policy member is deleted from the workspace
 */
function isDeletedPolicyEmployee(policyEmployee: PolicyEmployee, isOffline: boolean) {
    return !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors);
}

function hasNoPolicyOtherThanPersonalType() {
    return (
        Object.values(allPolicies ?? {}).filter((policy) => policy && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
            .length === 0
    );
}

function getCurrentTaxID(policy: OnyxEntry<Policy>, taxID: string): string | undefined {
    return Object.keys(policy?.taxRates?.taxes ?? {}).find((taxIDKey) => policy?.taxRates?.taxes?.[taxIDKey].previousTaxCode === taxID || taxIDKey === taxID);
}

function getWorkspaceAccountID(policyID: string) {
    const policy = getPolicy(policyID);

    if (!policy) {
        return 0;
    }
    return policy.workspaceAccountID;
}

function getTagApproverRule(policyID: string, tagName: string) {
    const policy = getPolicy(policyID);

    const approvalRules = policy?.rules?.approvalRules ?? [];
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

export {
    canEditTaxRate,
    extractPolicyIDFromPath,
    escapeTagName,
    getActivePolicies,
    getAdminEmployees,
    getCleanedTagName,
    getConnectedIntegration,
    getCountOfEnabledTagsOfList,
    getIneligibleInvitees,
    getMemberAccountIDsForWorkspace,
    getNumericValue,
    isMultiLevelTags,
    getPathWithoutPolicyID,
    getPersonalPolicy,
    getPolicy,
    getPolicyBrickRoadIndicatorStatus,
    getPolicyEmployeeListByIdWithoutCurrentUser,
    getSortedTagKeys,
    getTagList,
    getTagListName,
    getTagLists,
    getTaxByID,
    getUnitRateValue,
    getRateDisplayValue,
    goBackFromInvalidPolicy,
    hasAccountingConnections,
    hasSyncError,
    hasCustomUnitsError,
    hasEmployeeListError,
    hasIntegrationAutoSync,
    hasPolicyCategoriesError,
    hasPolicyError,
    hasPolicyErrorFields,
    hasTaxRateError,
    isControlOnAdvancedApprovalMode,
    isExpensifyTeam,
    isDeletedPolicyEmployee,
    isInstantSubmitEnabled,
    getCorrectedAutoReportingFrequency,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyUser,
    isPolicyAuditor,
    isPolicyEmployee,
    isPolicyFeatureEnabled,
    isPolicyOwner,
    arePaymentsEnabled,
    isSubmitAndClose,
    isTaxTrackingEnabled,
    shouldShowPolicy,
    getActiveAdminWorkspaces,
    getOwnedPaidPolicies,
    canSendInvoiceFromWorkspace,
    canSendInvoice,
    hasDependentTags,
    getXeroTenants,
    findCurrentXeroOrganization,
    getCurrentXeroOrganizationName,
    getXeroBankAccounts,
    findSelectedVendorWithDefaultSelect,
    findSelectedBankAccountWithDefaultSelect,
    findSelectedInvoiceItemWithDefaultSelect,
    findSelectedTaxAccountWithDefaultSelect,
    getNetSuiteVendorOptions,
    canUseTaxNetSuite,
    canUseProvincialTaxNetSuite,
    getFilteredReimbursableAccountOptions,
    getNetSuiteReimbursableAccountOptions,
    getFilteredCollectionAccountOptions,
    getNetSuiteCollectionAccountOptions,
    getFilteredApprovalAccountOptions,
    getNetSuiteApprovalAccountOptions,
    getNetSuitePayableAccountOptions,
    getNetSuiteReceivableAccountOptions,
    getNetSuiteInvoiceItemOptions,
    getNetSuiteTaxAccountOptions,
    getSageIntacctVendors,
    getSageIntacctNonReimbursableActiveDefaultVendor,
    getSageIntacctCreditCards,
    getSageIntacctBankAccounts,
    getCustomUnit,
    getCustomUnitRate,
    sortWorkspacesBySelected,
    removePendingFieldsFromCustomUnit,
    navigateWhenEnableFeature,
    getIntegrationLastSuccessfulDate,
    getCurrentConnectionName,
    getCustomersOrJobsLabelNetSuite,
    getDefaultApprover,
    getApprovalWorkflow,
    getReimburserAccountID,
    isControlPolicy,
    isNetSuiteCustomSegmentRecord,
    getNameFromNetSuiteCustomField,
    isNetSuiteCustomFieldPropertyEditable,
    getCurrentSageIntacctEntityName,
    hasNoPolicyOtherThanPersonalType,
    getCurrentTaxID,
    areSettingsInErrorFields,
    settingsPendingAction,
    getSubmitToEmail,
    getForwardsToAccount,
    getSubmitToAccountID,
    getWorkspaceAccountID,
    getAllTaxRatesNamesAndKeys as getAllTaxRates,
    getTagNamesFromTagsLists,
    getTagApproverRule,
    getDomainNameForPolicy,
    hasUnsupportedIntegration,
    getWorkflowApprovalsUnavailable,
    getNetSuiteImportCustomFieldLabel,
};

export type {MemberEmailsToAccountIDs};
