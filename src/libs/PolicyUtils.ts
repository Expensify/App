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
import type {OnyxInputOrEntry, Policy, PolicyCategories, PolicyEmployeeList, PolicyTagList, PolicyTags, TaxRate} from '@src/types/onyx';
import type {
    ConnectionLastSync,
    ConnectionName,
    Connections,
    CustomUnit,
    NetSuiteAccount,
    NetSuiteConnection,
    NetSuiteCustomList,
    NetSuiteCustomSegment,
    PolicyFeatureName,
    Rate,
    Tenant,
} from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
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

function getRateDisplayValue(value: number, toLocaleDigit: (arg: string) => string): string {
    const numValue = getNumericValue(value, toLocaleDigit);
    if (Number.isNaN(numValue)) {
        return '';
    }
    return numValue.toString().replace('.', toLocaleDigit('.')).substring(0, value.toString().length);
}

function getUnitRateValue(toLocaleDigit: (arg: string) => string, customUnitRate?: Rate) {
    return getRateDisplayValue((customUnitRate?.rate ?? 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET, toLocaleDigit);
}

/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy: OnyxEntry<Policy>): ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined {
    if (hasEmployeeListError(policy) || hasCustomUnitsError(policy) || hasPolicyErrorFields(policy)) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return undefined;
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
        (policy?.type !== CONST.POLICY.TYPE.PERSONAL || !!policy?.isJoinRequestPending) &&
        (isOffline || policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy.errors ?? {}).length > 0) &&
        !!policy?.role
    );
}

function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the current user is an admin of the policy.
 */
const isPolicyAdmin = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean =>
    (policy?.role ?? (currentUserLogin && policy?.employeeList?.[currentUserLogin]?.role)) === CONST.POLICY.ROLE.ADMIN;

/**
 * Checks if the current user is of the role "user" on the policy.
 */
const isPolicyUser = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean =>
    (policy?.role ?? (currentUserLogin && policy?.employeeList?.[currentUserLogin]?.role)) === CONST.POLICY.ROLE.USER;

/**
 * Checks if the policy is a free group policy.
 */
const isFreeGroupPolicy = (policy: OnyxEntry<Policy>): boolean => policy?.type === CONST.POLICY.TYPE.FREE;

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
function getMemberAccountIDsForWorkspace(employeeList: PolicyEmployeeList | undefined, includeMemberWithErrors = false): MemberEmailsToAccountIDs {
    const members = employeeList ?? {};
    const memberEmailsToAccountIDs: MemberEmailsToAccountIDs = {};
    Object.keys(members).forEach((email) => {
        if (!includeMemberWithErrors) {
            const member = members?.[email];
            if (Object.keys(member?.errors ?? {})?.length > 0) {
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

function getSortedTagKeys(policyTagList: OnyxEntry<PolicyTagList>): Array<keyof PolicyTagList> {
    if (isEmptyObject(policyTagList)) {
        return [];
    }

    return Object.keys(policyTagList).sort((key1, key2) => policyTagList[key1].orderWeight - policyTagList[key2].orderWeight);
}

/**
 * Gets a tag name of policy tags based on a tag's orderWeight.
 */
function getTagListName(policyTagList: OnyxEntry<PolicyTagList>, orderWeight: number): string {
    if (isEmptyObject(policyTagList)) {
        return '';
    }

    return Object.values(policyTagList).find((tag) => tag.orderWeight === orderWeight)?.name ?? '';
}

/**
 * Gets all tag lists of a policy
 */
function getTagLists(policyTagList: OnyxEntry<PolicyTagList>): Array<ValueOf<PolicyTagList>> {
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
function getTagList(policyTagList: OnyxEntry<PolicyTagList>, tagIndex: number): ValueOf<PolicyTagList> {
    const tagLists = getTagLists(policyTagList);

    return (
        tagLists[tagIndex] ?? {
            name: '',
            required: false,
            tags: {},
        }
    );
}

/**
 * Cleans up escaping of colons (used to create multi-level tags, e.g. "Parent: Child") in the tag name we receive from the backend
 */
function getCleanedTagName(tag: string) {
    return tag?.replace(/\\{1,2}:/g, CONST.COLON);
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
function isMultiLevelTags(policyTagList: OnyxEntry<PolicyTagList>): boolean {
    return Object.keys(policyTagList ?? {}).length > 1;
}

function isPendingDeletePolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isPaidGroupPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM || policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function isControlPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function isTaxTrackingEnabled(isPolicyExpenseChat: boolean, policy: OnyxEntry<Policy>, isDistanceRequest: boolean): boolean {
    const distanceUnit = getCustomUnit(policy);
    const customUnitID = distanceUnit?.customUnitID ?? 0;
    const isPolicyTaxTrackingEnabled = isPolicyExpenseChat && policy?.tax?.trackingEnabled;
    const isTaxEnabledForDistance = isPolicyTaxTrackingEnabled && policy?.customUnits?.[customUnitID]?.attributes?.taxEnabled;

    return !!(isDistanceRequest ? isTaxEnabledForDistance : isPolicyTaxTrackingEnabled);
}

/**
 * Checks if policy's scheduled submit / auto reporting frequency is "instant".
 * Note: Free policies have "instant" submit always enabled.
 */
function isInstantSubmitEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.FREE || (policy?.autoReporting === true && policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
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

/**
 * Whether the tax rate can be deleted and disabled
 */
function canEditTaxRate(policy: Policy, taxID: string): boolean {
    return policy.taxRates?.defaultExternalID !== taxID;
}

function isPolicyFeatureEnabled(policy: OnyxEntry<Policy>, featureName: PolicyFeatureName): boolean {
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED) {
        return !!policy?.tax?.trackingEnabled;
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
    const employeeLogin = getLoginsByAccountIDs([employeeAccountID])[0];
    const defaultApprover = getDefaultApprover(policy);

    // For policy using the optional or basic workflow, the manager is the policy default approver.
    if (([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy))) {
        return getAccountIDsByLogins([defaultApprover])[0];
    }

    const employee = policy?.employeeList?.[employeeLogin];
    if (!employee) {
        return -1;
    }

    return getAccountIDsByLogins([employee.submitsTo ?? defaultApprover])[0];
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
function getActiveAdminWorkspaces(policies: OnyxCollection<Policy> | null): Policy[] {
    const activePolicies = getActivePolicies(policies);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, NetworkStore.isOffline()) && isPolicyAdmin(policy));
}

/** Whether the user can send invoice */
function canSendInvoice(policies: OnyxCollection<Policy> | null): boolean {
    return getActiveAdminWorkspaces(policies).length > 0;
}

function hasDependentTags(policy: OnyxEntry<Policy>, policyTagList: OnyxEntry<PolicyTagList>) {
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

function getXeroBankAccountsWithDefaultSelect(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const bankAccounts = policy?.connections?.xero?.data?.bankAccounts ?? [];
    const isMatchFound = bankAccounts?.some(({id}) => id === selectedBankAccountId);

    return (bankAccounts ?? []).map(({id, name}, index) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: isMatchFound ? selectedBankAccountId === id : index === 0,
    }));
}

function getNetSuiteVendorOptions(policy: Policy | undefined, selectedVendorId: string | undefined): SelectorType[] {
    const vendors = policy?.connections?.netsuite.options.data.vendors ?? [];

    return (vendors ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedVendorId === id,
    }));
}

function getNetSuitePayableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList ?? [];

    return (payableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

function getNetSuiteReceivableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const receivableAccounts = policy?.connections?.netsuite.options.data.receivableList ?? [];

    return (receivableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

function getNetSuiteInvoiceItemOptions(policy: Policy | undefined, selectedItemId: string | undefined): SelectorType[] {
    const invoiceItems = policy?.connections?.netsuite.options.data.items ?? [];

    return (invoiceItems ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedItemId === id,
    }));
}

function getNetSuiteTaxAccountOptions(policy: Policy | undefined, subsidiaryCountry?: string, selectedAccountId?: string): SelectorType[] {
    const taxAccounts = policy?.connections?.netsuite.options.data.taxAccountsList ?? [];

    return (taxAccounts ?? [])
        .filter(({country}) => country === subsidiaryCountry)
        .map(({externalID, name}) => ({
            value: externalID,
            text: name,
            keyForList: externalID,
            isSelected: selectedAccountId === externalID,
        }));
}

function canUseTaxNetSuite(canUseNetSuiteUSATax?: boolean, subsidiaryCountry?: string) {
    return !!canUseNetSuiteUSATax || CONST.NETSUITE_TAX_COUNTRIES.includes(subsidiaryCountry ?? '');
}

function canUseProvincialTaxNetSuite(subsidiaryCountry?: string) {
    return subsidiaryCountry === '_canada';
}

function getNetSuiteReimbursableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList ?? [];
    const accountOptions = (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.BANK || type === CONST.NETSUITE_ACCOUNT_TYPE.CREDIT_CARD);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

function getNetSuiteCollectionAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList ?? [];
    const accountOptions = (payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.BANK);

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
    }));
}

function getNetSuiteApprovalAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite.options.data.payableList ?? [];
    const defaultApprovalAccount: NetSuiteAccount = {
        id: CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
        name: Localize.translateLocal('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
        type: CONST.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE,
    };
    const accountOptions = [defaultApprovalAccount].concat((payableAccounts ?? []).filter(({type}) => type === CONST.NETSUITE_ACCOUNT_TYPE.ACCOUNTS_PAYABLE));

    return accountOptions.map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedBankAccountId === id,
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

    const importedValueLabel = translate(`workspace.netsuite.import.customersOrJobs.label`, importFields, translate(`workspace.accounting.importTypes.${importedValue}`).toLowerCase());
    return importedValueLabel.charAt(0).toUpperCase() + importedValueLabel.slice(1);
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

function getIntegrationLastSuccessfulDate(connection?: Connections[keyof Connections]) {
    if (!connection) {
        return undefined;
    }
    if ((connection as NetSuiteConnection)?.lastSyncDate) {
        return (connection as NetSuiteConnection)?.lastSyncDate;
    }
    return (connection as ConnectionWithLastSyncData)?.lastSync?.successfulDate;
}

function getCurrentSageIntacctEntityName(policy?: Policy): string | undefined {
    const currentEntityID = policy?.connections?.intacct?.config?.entity;
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
    getSubmitToAccountID,
    getTagList,
    getTagListName,
    getTagLists,
    getTaxByID,
    getUnitRateValue,
    goBackFromInvalidPolicy,
    hasAccountingConnections,
    hasCustomUnitsError,
    hasEmployeeListError,
    hasIntegrationAutoSync,
    hasPolicyCategoriesError,
    hasPolicyError,
    hasPolicyErrorFields,
    hasTaxRateError,
    isExpensifyTeam,
    isDeletedPolicyEmployee,
    isFreeGroupPolicy,
    isInstantSubmitEnabled,
    getCorrectedAutoReportingFrequency,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyUser,
    isPolicyEmployee,
    isPolicyFeatureEnabled,
    isPolicyOwner,
    isSubmitAndClose,
    isTaxTrackingEnabled,
    shouldShowPolicy,
    getActiveAdminWorkspaces,
    canSendInvoice,
    hasDependentTags,
    getXeroTenants,
    findCurrentXeroOrganization,
    getCurrentXeroOrganizationName,
    getXeroBankAccountsWithDefaultSelect,
    getNetSuiteVendorOptions,
    canUseTaxNetSuite,
    canUseProvincialTaxNetSuite,
    getNetSuiteReimbursableAccountOptions,
    getNetSuiteCollectionAccountOptions,
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
    isControlPolicy,
    isNetSuiteCustomSegmentRecord,
    getNameFromNetSuiteCustomField,
    isNetSuiteCustomFieldPropertyEditable,
    getCurrentSageIntacctEntityName,
    hasNoPolicyOtherThanPersonalType,
};

export type {MemberEmailsToAccountIDs};
