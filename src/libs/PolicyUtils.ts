import Str from 'expensify-common/lib/str';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Policy, PolicyCategories, PolicyEmployeeList, PolicyTagList, PolicyTags, TaxRate} from '@src/types/onyx';
import type {PolicyFeatureName, Rate, Tenant} from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import Navigation from './Navigation/Navigation';
import * as NetworkStore from './Network/NetworkStore';
import {getAccountIDsByLogins, getLoginsByAccountIDs, getPersonalDetailByEmail} from './PersonalDetailsUtils';

type MemberEmailsToAccountIDs = Record<string, number>;

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
function getActivePolicies(policies: OnyxCollection<Policy>): Policy[] {
    return Object.values(policies ?? {}).filter<Policy>(
        (policy): policy is Policy => policy !== null && policy && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!policy.name && !!policy.id,
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
        (policy?.isPolicyExpenseChatEnabled || Boolean(policy?.isJoinRequestPending)) &&
        (isOffline || policy?.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || Object.keys(policy.errors ?? {}).length > 0)
    );
}

function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the current user is an admin of the policy.
 */
const isPolicyAdmin = (policy: OnyxEntry<Policy> | EmptyObject): boolean => policy?.role === CONST.POLICY.ROLE.ADMIN;

/**
 * Checks if the policy is a free group policy.
 */
const isFreeGroupPolicy = (policy: OnyxEntry<Policy> | EmptyObject): boolean => policy?.type === CONST.POLICY.TYPE.FREE;

const isPolicyEmployee = (policyID: string, policies: OnyxCollection<Policy>): boolean => Object.values(policies ?? {}).some((policy) => policy?.id === policyID);

/**
 * Checks if the current user is an owner (creator) of the policy.
 */
const isPolicyOwner = (policy: OnyxEntry<Policy>, currentUserAccountID: number): boolean => policy?.ownerAccountID === currentUserAccountID;

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

function isPaidGroupPolicy(policy: OnyxEntry<Policy> | EmptyObject): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM || policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function isTaxTrackingEnabled(isPolicyExpenseChat: boolean, policy: OnyxEntry<Policy>, isDistanceRequest: boolean): boolean {
    const distanceUnit = Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
    const customUnitID = distanceUnit?.customUnitID ?? 0;
    const isPolicyTaxTrackingEnabled = isPolicyExpenseChat && policy?.tax?.trackingEnabled;
    const isTaxEnabledForDistance = isPolicyTaxTrackingEnabled && policy?.customUnits?.[customUnitID]?.attributes?.taxEnabled;

    return !!(isDistanceRequest ? isTaxEnabledForDistance : isPolicyTaxTrackingEnabled);
}

/**
 * Checks if policy's scheduled submit / auto reporting frequency is "instant".
 * Note: Free policies have "instant" submit always enabled.
 */
function isInstantSubmitEnabled(policy: OnyxEntry<Policy> | EmptyObject): boolean {
    return policy?.type === CONST.POLICY.TYPE.FREE || (policy?.autoReporting === true && policy?.autoReportingFrequency === CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
}

/**
 * Checks if policy's approval mode is "optional", a.k.a. "Submit & Close"
 */
function isSubmitAndClose(policy: OnyxEntry<Policy> | EmptyObject): boolean {
    return policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL;
}

function extractPolicyIDFromPath(path: string) {
    return path.match(CONST.REGEX.POLICY_ID_FROM_PATH)?.[1];
}

/**
 * Whether the policy has active accounting integration connections
 */
function hasAccountingConnections(policy: OnyxEntry<Policy>) {
    return Boolean(policy?.connections);
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

function isPolicyFeatureEnabled(policy: OnyxEntry<Policy> | EmptyObject, featureName: PolicyFeatureName): boolean {
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED) {
        return Boolean(policy?.tax?.trackingEnabled);
    }

    return Boolean(policy?.[featureName]);
}

function getApprovalWorkflow(policy: OnyxEntry<Policy> | EmptyObject): ValueOf<typeof CONST.POLICY.APPROVAL_MODE> {
    if (policy?.type === CONST.POLICY.TYPE.PERSONAL) {
        return CONST.POLICY.APPROVAL_MODE.OPTIONAL;
    }

    return policy?.approvalMode ?? CONST.POLICY.APPROVAL_MODE.ADVANCED;
}

function getDefaultApprover(policy: OnyxEntry<Policy> | EmptyObject): string {
    return policy?.approver ?? policy?.owner ?? '';
}

/**
 * Returns the accountID to whom the given employeeAccountID submits reports to in the given Policy.
 */
function getSubmitToAccountID(policy: OnyxEntry<Policy> | EmptyObject, employeeAccountID: number): number {
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
    return Object.values(policy?.employeeList ?? {}).filter((employee) => employee.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Returns the policy of the report
 */
function getPolicy(policyID: string | undefined): Policy | EmptyObject {
    if (!allPolicies || !policyID) {
        return {};
    }
    return allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`] ?? {};
}

/** Return active policies where current user is an admin */
function getActiveAdminWorkspaces(policies: OnyxCollection<Policy>): Policy[] {
    const activePolicies = getActivePolicies(policies);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, NetworkStore.isOffline()) && isPolicyAdmin(policy));
}

/** Whether the user can send invoice */
function canSendInvoice(policies: OnyxCollection<Policy>): boolean {
    return getActiveAdminWorkspaces(policies).length > 0;
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

export {
    canEditTaxRate,
    extractPolicyIDFromPath,
    escapeTagName,
    getActivePolicies,
    getAdminEmployees,
    getCleanedTagName,
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
    hasPolicyCategoriesError,
    hasPolicyError,
    hasPolicyErrorFields,
    hasTaxRateError,
    isExpensifyTeam,
    isFreeGroupPolicy,
    isInstantSubmitEnabled,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isPolicyAdmin,
    isPolicyEmployee,
    isPolicyFeatureEnabled,
    isPolicyOwner,
    isSubmitAndClose,
    isTaxTrackingEnabled,
    shouldShowPolicy,
    getActiveAdminWorkspaces,
    canSendInvoice,
    getXeroTenants,
    findCurrentXeroOrganization,
    getCurrentXeroOrganizationName,
};

export type {MemberEmailsToAccountIDs};
