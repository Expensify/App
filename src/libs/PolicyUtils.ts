import {Str} from 'expensify-common';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {LocaleContextProps, LocalizedTranslate} from '@components/LocaleContextProvider';
import type {SelectorType} from '@components/SelectionScreen';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/NetSuiteCustomFieldForm';
import type {OnyxInputOrEntry, Policy, PolicyCategories, PolicyEmployeeList, PolicyTagLists, PolicyTags, Report, TaxRate, Transaction, TravelSettings} from '@src/types/onyx';
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
    SageIntacctDataElement,
    SageIntacctDataElementWithValue,
    Tenant,
} from '@src/types/onyx/Policy';
import type PolicyEmployee from '@src/types/onyx/PolicyEmployee';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import {getBankAccountFromID} from './actions/BankAccounts';
import {hasSynchronizationErrorMessage, isConnectionUnverified} from './actions/connections';
import {shouldShowQBOReimbursableExportDestinationAccountError} from './actions/connections/QuickbooksOnline';
import {getCategoryApproverRule} from './CategoryUtils';
import {convertToBackendAmount} from './CurrencyUtils';
import Navigation from './Navigation/Navigation';
import {isOffline as isOfflineNetworkStore} from './Network/NetworkStore';
import {formatMemberForList} from './OptionsListUtils';
import type {MemberForList} from './OptionsListUtils';
import {getAccountIDsByLogins, getLoginsByAccountIDs, getPersonalDetailByEmail} from './PersonalDetailsUtils';
import {getAllSortedTransactions, getCategory, getTag, getTagArrayFromName} from './TransactionUtils';
import {isPublicDomain} from './ValidationUtils';

type MemberEmailsToAccountIDs = Record<string, number>;

type TravelStep = ValueOf<typeof CONST.TRAVEL.STEPS>;

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
 * and policies the current user doesn't belong to.
 * These are policies that we can use to create reports with in NewDot.
 */
function getActivePolicies(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return Object.values(policies ?? {}).filter<Policy>(
        (policy): policy is Policy =>
            !!policy && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !!policy.name && !!policy.id && !!getPolicyRole(policy, currentUserLogin),
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
            policy.isPolicyExpenseChatEnabled,
    );
}

function getActivePoliciesWithExpenseChatAndPerDiemEnabled(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return getActivePoliciesWithExpenseChat(policies, currentUserLogin).filter((policy) => policy?.arePerDiemRatesEnabled);
}

function getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return getActivePoliciesWithExpenseChat(policies, currentUserLogin).filter((policy) => {
        const perDiemCustomUnit = getPerDiemCustomUnit(policy);
        return policy?.arePerDiemRatesEnabled && !isEmptyObject(perDiemCustomUnit?.rates);
    });
}

function getActivePoliciesWithExpenseChatAndTimeEnabled(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    return getActivePoliciesWithExpenseChat(policies, currentUserLogin).filter(isTimeTrackingEnabled);
}

/**
 * Checks if the current user is an admin of the policy.
 */
const isPolicyAdmin = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean => getPolicyRole(policy, currentUserLogin) === CONST.POLICY.ROLE.ADMIN;

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
 * Checks if the policy had a sync error.
 */
function shouldShowSyncError(policy: OnyxEntry<Policy>, isSyncInProgress: boolean): boolean {
    return isPolicyAdmin(policy) && (Object.keys(policy?.connections ?? {}) as ConnectionName[]).some((connection) => !!hasSynchronizationErrorMessage(policy, connection, isSyncInProgress));
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

function getNumericValue(value: number | string, toLocaleDigit: (arg: string) => string): number | string {
    const numValue = parseFloat(value.toString().replace(toLocaleDigit('.'), '.'));
    if (Number.isNaN(numValue)) {
        return NaN;
    }
    // Rounding to 4 decimal places
    return parseFloat(numValue.toFixed(CONST.MAX_TAX_RATE_DECIMAL_PLACES));
}

/**
 * Retrieves the distance custom unit object for the given policy
 */
function getDistanceRateCustomUnit(policy: OnyxEntry<Policy>): CustomUnit | undefined {
    return Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
}

/**
 * Retrieves the per diem custom unit object for the given policy
 */
function getPerDiemCustomUnit(policy: OnyxEntry<Policy>): CustomUnit | undefined {
    return Object.values(policy?.customUnits ?? {}).find((unit) => unit.name === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL);
}

/**
 * Finds a policy that contains the customUnitID from the transaction
 */
function getPolicyByCustomUnitID(transaction: OnyxEntry<Transaction>, policies: OnyxCollection<Policy>): OnyxEntry<Policy> {
    const customUnitID = transaction?.comment?.customUnit?.customUnitID;

    if (!customUnitID || !policies) {
        return undefined;
    }

    return Object.values(policies).find((policy) => {
        if (!policy?.customUnits || !policy?.arePerDiemRatesEnabled) {
            return false;
        }
        return customUnitID in policy.customUnits;
    });
}

/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getDistanceRateCustomUnitRate(policy: OnyxEntry<Policy>, customUnitRateID: string): Rate | undefined {
    const distanceUnit = getDistanceRateCustomUnit(policy);
    return distanceUnit?.rates[customUnitRateID];
}

/**
 * Return admins from active policies
 */
function getEligibleBankAccountShareRecipients(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined, bankAccountID: string | undefined): MemberForList[] {
    const currentBankAccount = getBankAccountFromID(Number(bankAccountID));
    const activePolicies = getActiveAdminWorkspaces(policies, currentUserLogin);
    if (!activePolicies) {
        return [];
    }
    const adminMap = new Map<string, MemberForList>();
    // O(1) checks for already-shared emails
    const shareesSet = new Set(currentBankAccount?.accountData?.sharees ?? []);
    for (const policy of Object.values(activePolicies)) {
        for (const admin of getAdminEmployees(policy)) {
            const email = admin?.email;
            // Check if the email is for the active user or an existing user in the sharees array or admins list to avoid extra iterations
            if (!email || email === currentUserLogin || adminMap.has(email) || shareesSet.has(email)) {
                continue;
            }
            const personalDetails = getPersonalDetailByEmail(email);
            if (!personalDetails) {
                continue;
            }
            adminMap.set(
                email,
                formatMemberForList({
                    text: personalDetails.displayName,
                    alternateText: personalDetails.login,
                    keyForList: personalDetails.login,
                    accountID: personalDetails.accountID,
                    login: personalDetails.login,
                    pendingAction: personalDetails.pendingAction,
                    reportID: '',
                }),
            );
        }
    }

    return Array.from(adminMap.values());
}

/**
 * Return true if there is at least one eligible admin in active policies
 */
function hasEligibleActiveAdminFromWorkspaces(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined, bankAccountID: string | undefined): boolean {
    const currentBankAccount = getBankAccountFromID(Number(bankAccountID));
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    if (!activePolicies) {
        return false;
    }
    // Normalize sharees to a Set for O(1) lookups
    const alreadySharedSharees = new Set(currentBankAccount?.accountData?.sharees ?? []);
    for (const policy of Object.values(activePolicies)) {
        const admins = getAdminEmployees(policy);
        for (const admin of admins) {
            const email = admin?.email;
            if (!email || email === currentUserLogin || alreadySharedSharees.has(email)) {
                continue;
            }

            return true;
        }
    }

    return false;
}

function getCustomUnitsForDuplication(policy: Policy, isCustomUnitsOptionSelected: boolean, isPerDiemOptionSelected: boolean): Record<string, CustomUnit> | undefined {
    const customUnits = policy?.customUnits;
    if ((!isCustomUnitsOptionSelected && !isPerDiemOptionSelected) || !customUnits || Object.keys(customUnits).length === 0) {
        return undefined;
    }

    if (isCustomUnitsOptionSelected && isPerDiemOptionSelected) {
        return customUnits;
    }

    if (isCustomUnitsOptionSelected) {
        const distanceCustomUnit = Object.values(customUnits).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_DISTANCE);
        if (!distanceCustomUnit) {
            return undefined;
        }
        return {[distanceCustomUnit.customUnitID]: distanceCustomUnit};
    }

    const perDiemUnit = Object.values(customUnits).find((customUnit) => customUnit.name === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL);
    if (!perDiemUnit) {
        return undefined;
    }
    return {[perDiemUnit.customUnitID]: perDiemUnit};
}

/**
 * Retrieves custom unit rate object from the given customUnitRateID
 */
function getPerDiemRateCustomUnitRate(policy: OnyxEntry<Policy>, customUnitRateID: string): Rate | undefined {
    const perDiemUnit = getPerDiemCustomUnit(policy);
    return perDiemUnit?.rates[customUnitRateID];
}

function getRateDisplayValue(value: number, toLocaleDigit: (arg: string) => string, withDecimals?: boolean): string {
    const numValue = getNumericValue(value, toLocaleDigit);
    if (Number.isNaN(numValue)) {
        return '';
    }

    if (withDecimals) {
        const decimalPart = numValue.toString().split('.').at(1) ?? '';
        // Set the fraction digits to be between 2 and 4 (OD Behavior)
        const fractionDigits = Math.min(Math.max(decimalPart.length, CONST.MIN_TAX_RATE_DECIMAL_PLACES), CONST.MAX_TAX_RATE_DECIMAL_PLACES);
        return Number(numValue).toFixed(fractionDigits).toString().replace('.', toLocaleDigit('.'));
    }

    return numValue.toString().replace('.', toLocaleDigit('.')).substring(0, value.toString().length);
}

function getUnitRateValue(toLocaleDigit: (arg: string) => string, customUnitRate?: Partial<Rate>, withDecimals?: boolean) {
    return getRateDisplayValue((customUnitRate?.rate ?? 0) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET, toLocaleDigit, withDecimals);
}

/**
 * Get the brick road indicator status for a policy. The policy has an error status if there is a policy member error, a custom unit error or a field error.
 */
function getPolicyBrickRoadIndicatorStatus(policy: OnyxEntry<Policy>, isConnectionInProgress: boolean): ValueOf<typeof CONST.BRICK_ROAD_INDICATOR_STATUS> | undefined {
    if (
        shouldShowEmployeeListError(policy) ||
        shouldShowCustomUnitsError(policy) ||
        shouldShowPolicyErrorFields(policy) ||
        shouldShowSyncError(policy, isConnectionInProgress) ||
        shouldShowQBOReimbursableExportDestinationAccountError(policy)
    ) {
        return CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR;
    }
    return undefined;
}

function getPolicyRole(policy: OnyxInputOrEntry<Policy>, currentUserLogin: string | undefined): string | undefined {
    if (policy?.role) {
        return policy.role;
    }

    if (!currentUserLogin) {
        return;
    }

    return policy?.employeeList?.[currentUserLogin]?.role;
}

function getPolicyNameByID(policyID: string): string {
    return allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`]?.name ?? '';
}

/**
 * Check if the policy can be displayed
 * If shouldShowPendingDeletePolicy is true, show the policy pending deletion.
 * If shouldShowPendingDeletePolicy is false, show the policy pending deletion only if there is an error.
 * Note: Using a local ONYXKEYS.NETWORK subscription will cause a delay in
 * updating the screen. Passing the offline status from the component.
 */
function shouldShowPolicy(policy: OnyxEntry<Policy>, shouldShowPendingDeletePolicy: boolean, currentUserLogin: string | undefined): boolean {
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
 */
function isPolicyMember(policy: OnyxEntry<Policy>, userLogin: string | undefined): boolean {
    return !!policy && !!userLogin && (!!policy.employeeList?.[userLogin] || policy.owner === userLogin);
}

function isPolicyMemberWithoutPendingDelete(currentUserLogin: string | undefined, policy: OnyxEntry<Policy>): boolean {
    if (!currentUserLogin || !policy?.id) {
        return false;
    }

    const policyEmployee = policy?.employeeList?.[currentUserLogin];
    return !!policyEmployee && policyEmployee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

function isPolicyPayer(policy: OnyxEntry<Policy>, currentUserLogin: string | undefined): boolean {
    if (!policy) {
        return false;
    }

    const isAdmin = policy.role === CONST.POLICY.ROLE.ADMIN;
    const isReimburser = policy.reimburser === currentUserLogin;

    if (policy.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES) {
        return policy.reimburser ? isReimburser : isAdmin;
    }

    if (policy.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL) {
        return isAdmin;
    }

    return false;
}

function getUberConnectionErrorDirectlyFromPolicy(policy: OnyxEntry<Policy>) {
    const receiptUber = policy?.receiptPartners?.uber;

    return !!receiptUber?.error;
}

function isExpensifyTeam(email: string | undefined): boolean {
    const emailDomain = Str.extractEmailDomain(email ?? '');
    return emailDomain === CONST.EXPENSIFY_PARTNER_NAME || emailDomain === CONST.EMAIL.GUIDES_DOMAIN;
}

/**
 * Checks if the user with login is an admin of the policy.
 */
const isUserPolicyAdmin = (policy: OnyxInputOrEntry<Policy>, login?: string) => !!(policy && policy.employeeList && login && policy.employeeList[login]?.role === CONST.POLICY.ROLE.ADMIN);

/**
 * Checks if the current user is of the role "user" on the policy.
 */
const isPolicyUser = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean => getPolicyRole(policy, currentUserLogin) === CONST.POLICY.ROLE.USER;

/**
 * Checks if the current user is an auditor of the policy
 */
const isPolicyAuditor = (policy: OnyxInputOrEntry<Policy>, currentUserLogin?: string): boolean =>
    (policy?.role ?? (currentUserLogin && policy?.employeeList?.[currentUserLogin]?.role)) === CONST.POLICY.ROLE.AUDITOR;

const isPolicyEmployee = (policyID: string | undefined, policy: OnyxEntry<Policy>): boolean => {
    return !!policyID && policyID === policy?.id;
};

/**
 * Checks if the current user is an owner (creator) of the policy.
 */
const isPolicyOwner = (policy: OnyxInputOrEntry<Policy>, currentUserAccountID: number | undefined): boolean => !!currentUserAccountID && policy?.ownerAccountID === currentUserAccountID;

/**
 * Create an object mapping member emails to their accountIDs. Filter for members without errors if includeMemberWithErrors is false, and get the login email from the personalDetail object using the accountID.
 *
 * If includeMemberWithErrors is false, We only return members without errors. Otherwise, the members with errors would immediately be removed before the user has a chance to read the error.
 */
function getMemberAccountIDsForWorkspace(employeeList: PolicyEmployeeList | undefined, includeMemberWithErrors = false, includeMemberWithPendingDelete = true): MemberEmailsToAccountIDs {
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
        const personalDetail = getPersonalDetailByEmail(email);
        if (!personalDetail?.login) {
            continue;
        }
        memberEmailsToAccountIDs[email] = Number(personalDetail.accountID);
    }
    return memberEmailsToAccountIDs;
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
 * Checks if a policy has any tags
 */
function hasTags(policyTagList: OnyxEntry<PolicyTagLists>): boolean {
    const tagLists = getTagLists(policyTagList);
    return tagLists.some((tagList) => Object.keys(tagList.tags ?? {}).length > 0);
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

/**
 * Gets a tag list of a policy by a tag's orderWeight.
 */
function getTagListByOrderWeight(policyTagList: OnyxEntry<PolicyTagLists>, orderWeight: number): ValueOf<PolicyTagLists> {
    const tagListEmpty = {
        name: '',
        required: false,
        tags: {},
        orderWeight: 0,
    };
    if (isEmptyObject(policyTagList)) {
        return tagListEmpty;
    }

    return Object.values(policyTagList).find((tag) => tag.orderWeight === orderWeight) ?? tagListEmpty;
}

function getTagNamesFromTagsLists(policyTagLists: PolicyTagLists): string[] {
    const uniqueTagNames = new Set<string>();

    for (const policyTagList of Object.values(policyTagLists ?? {})) {
        for (const tag of Object.values(policyTagList.tags ?? {})) {
            uniqueTagNames.add(tag.name);
        }
    }
    return Array.from(uniqueTagNames);
}

/**
 * Cleans up escaping of colons (used to create multi-level tags, e.g. "Parent: Child") in the tag name we receive from the backend
 */
function getCleanedTagName(tag: string) {
    return tag?.replaceAll('\\:', CONST.COLON);
}

/**
 * Converts a colon-delimited tag string into a comma-separated string, filtering out empty tags.
 */
function getCommaSeparatedTagNameWithSanitizedColons(tag: string): string {
    return getTagArrayFromName(tag)
        .filter((tagItem) => tagItem !== '')
        .map(getCleanedTagName)
        .join(', ');
}

function getLengthOfTag(tag: string): number {
    if (!tag) {
        return 0;
    }
    return getTagArrayFromName(tag).length;
}

/**
 * Escape colon from tag name
 */
function escapeTagName(tag: string) {
    return tag?.replaceAll(CONST.COLON, '\\:');
}

/**
 * Checks if a tag list name is the default 'Tag' name
 */
function isDefaultTagName(tagName: string | undefined): boolean {
    if (!tagName) {
        return false;
    }
    return tagName.trim().toLowerCase() === CONST.POLICY.DEFAULT_TAG_NAME.trim().toLowerCase();
}

/**
 * Gets a count of enabled tags of a policy
 */
function getCountOfEnabledTagsOfList(policyTags: PolicyTags | undefined): number {
    if (!policyTags) {
        return 0;
    }
    return Object.values(policyTags).filter((policyTag) => policyTag.enabled).length;
}
/**
 * Gets count of required tag lists of a policy
 */
function getCountOfRequiredTagLists(policyTagLists: OnyxEntry<PolicyTagLists>): number {
    if (!policyTagLists) {
        return 0;
    }
    return Object.values(policyTagLists).filter((tagList) => tagList.required).length;
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

function isPaidGroupPolicy(policy: OnyxInputOrEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM || policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function getOwnedPaidPolicies(policies: OnyxCollection<Policy> | null, currentUserAccountID: number | undefined): Policy[] {
    return Object.values(policies ?? {}).filter((policy): policy is Policy => isPolicyOwner(policy, currentUserAccountID ?? CONST.DEFAULT_NUMBER_ID) && isPaidGroupPolicy(policy));
}

function isControlPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.CORPORATE;
}

function isCollectPolicy(policy: OnyxEntry<Policy>): boolean {
    return policy?.type === CONST.POLICY.TYPE.TEAM;
}

function isTaxTrackingEnabled(
    isPolicyExpenseChatOrUnreportedExpense: boolean,
    policy: OnyxEntry<Policy>,
    isDistanceRequest: boolean,
    isPerDiemRequest = false,
    isTimeRequest = false,
): boolean {
    if (isPerDiemRequest || isTimeRequest) {
        return false;
    }
    const distanceUnit = getDistanceRateCustomUnit(policy);
    const customUnitID = distanceUnit?.customUnitID ?? CONST.DEFAULT_NUMBER_ID;
    const isPolicyTaxTrackingEnabled = isPolicyExpenseChatOrUnreportedExpense && policy?.tax?.trackingEnabled;
    const isTaxEnabledForDistance = isPolicyTaxTrackingEnabled && !!customUnitID && policy?.customUnits?.[customUnitID]?.attributes?.taxEnabled;

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

function arePaymentsEnabled(policy: OnyxEntry<Policy>): boolean {
    return policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
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
 * Whether the policy has active accounting integration connections.
 * `getCurrentConnectionName` only returns connections supported in NewDot.
 * `hasSupportedOnlyOnOldDotIntegration` detects connections that are supported only on OldDot.
 */
function hasAccountingConnections(policy: OnyxEntry<Policy>) {
    return !!getCurrentConnectionName(policy) || hasSupportedOnlyOnOldDotIntegration(policy);
}

function getPolicyEmployeeListByIdWithoutCurrentUser(policies: OnyxCollection<Pick<Policy, 'employeeList'>>, currentPolicyID?: string, currentUserAccountID?: number) {
    const policy = policies?.[`${ONYXKEYS.COLLECTION.POLICY}${currentPolicyID}`] ?? null;
    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
    return Object.values(policyMemberEmailsToAccountIDs)
        .map((policyMemberAccountID) => Number(policyMemberAccountID))
        .filter((policyMemberAccountID) => policyMemberAccountID !== currentUserAccountID);
}

function getPolicyEmployeeAccountIDs(policy: OnyxEntry<Pick<Policy, 'employeeList'>>, currentUserAccountID?: number) {
    if (!policy) {
        return [];
    }

    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(policy?.employeeList);
    return Object.values(policyMemberEmailsToAccountIDs)
        .map((policyMemberAccountID) => Number(policyMemberAccountID))
        .filter((policyMemberAccountID) => policyMemberAccountID !== currentUserAccountID);
}

function goBackFromInvalidPolicy() {
    Navigation.goBack(ROUTES.WORKSPACES_LIST.route);
}

/** Get a tax with given ID from policy */
function getTaxByID(policy: OnyxEntry<Policy>, taxID: string): TaxRate | undefined {
    return policy?.taxRates?.taxes?.[taxID];
}

/** Get a tax rate object built like Record<TaxRateName, RelatedTaxRateKeys>.
 * We want to allow user to choose over TaxRateName and there might be a situation when one TaxRateName has two possible keys in different policies */
function getAllTaxRatesNamesAndKeys(policies: OnyxCollection<Policy>): Record<string, string[]> {
    const allTaxRates: Record<string, string[]> = {};

    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.taxRates?.taxes) {
            continue;
        }

        for (const [taxRateKey, taxRate] of Object.entries(policy?.taxRates?.taxes ?? {})) {
            if (!allTaxRates[taxRate.name]) {
                allTaxRates[taxRate.name] = [taxRateKey];
                continue;
            }
            if (allTaxRates[taxRate.name].includes(taxRateKey)) {
                continue;
            }
            allTaxRates[taxRate.name].push(taxRateKey);
        }
    }

    return allTaxRates;
}

/** Get a tax rate object built like Record<TaxID, TaxRate> */
function getAllTaxRatesNamesAndValues(policies: OnyxCollection<Policy>): Record<string, TaxRate> {
    const allTaxRates: Record<string, TaxRate> = {};

    for (const policy of Object.values(policies ?? {})) {
        if (!policy?.taxRates?.taxes) {
            continue;
        }

        for (const [taxRateKey, taxRate] of Object.entries(policy?.taxRates?.taxes ?? {})) {
            if (!allTaxRates[taxRateKey]) {
                allTaxRates[taxRateKey] = taxRate;
            }
        }
    }

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
    if (featureName === CONST.POLICY.MORE_FEATURES.ARE_RECEIPT_PARTNERS_ENABLED) {
        return policy?.receiptPartners?.enabled ?? false;
    }
    if (featureName === CONST.POLICY.MORE_FEATURES.IS_TIME_TRACKING_ENABLED) {
        return isTimeTrackingEnabled(policy);
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

function getManagerAccountID(policy: OnyxEntry<Policy>, expenseReport: OnyxEntry<Report> | {ownerAccountID: number}) {
    const employeeAccountID = expenseReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const employeeLogin = getLoginsByAccountIDs([employeeAccountID]).at(0) ?? '';
    const defaultApprover = getDefaultApprover(policy);

    // For policy using the optional or basic workflow, the manager is the policy default approver.
    if (([CONST.POLICY.APPROVAL_MODE.OPTIONAL, CONST.POLICY.APPROVAL_MODE.BASIC] as Array<ValueOf<typeof CONST.POLICY.APPROVAL_MODE>>).includes(getApprovalWorkflow(policy))) {
        return getAccountIDsByLogins([defaultApprover]).at(0) ?? -1;
    }

    const employee = policy?.employeeList?.[employeeLogin];
    if (!employee && !defaultApprover) {
        return -1;
    }

    return getAccountIDsByLogins([employee?.submitsTo ?? defaultApprover]).at(0) ?? -1;
}

/**
 * Returns the accountID to whom the given expenseReport submits reports to in the given Policy.
 */
function getSubmitToAccountID(policy: OnyxEntry<Policy>, expenseReport: OnyxEntry<Report>): number {
    const ruleApprovers = getRuleApprovers(policy, expenseReport);
    const employeeAccountID = expenseReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const employeeLogin = getLoginsByAccountIDs([employeeAccountID]).at(0) ?? '';
    if (ruleApprovers.length > 0 && ruleApprovers.at(0) === employeeLogin) {
        ruleApprovers.shift();
    }
    if (ruleApprovers.length > 0 && !isSubmitAndClose(policy)) {
        return getAccountIDsByLogins([ruleApprovers.at(0) ?? '']).at(0) ?? -1;
    }

    return getManagerAccountID(policy, expenseReport);
}

function getManagerAccountEmail(policy: OnyxEntry<Policy>, expenseReport: OnyxEntry<Report>): string {
    const managerAccountID = getManagerAccountID(policy, expenseReport);
    return getLoginsByAccountIDs([managerAccountID]).at(0) ?? '';
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
    return reimburserEmail ? (getAccountIDsByLogins([reimburserEmail]).at(0) ?? -1) : -1;
}

/** @deprecated Please use ONYXKEYS.PERSONAL_POLICY_ID to find the personal policyID */
function getPersonalPolicy() {
    return Object.values(allPolicies ?? {}).find((policy) => policy?.type === CONST.POLICY.TYPE.PERSONAL);
}

function getAdminEmployees(policy: OnyxEntry<Policy>): PolicyEmployee[] {
    if (!policy || !policy.employeeList) {
        return [];
    }
    return Object.keys(policy.employeeList)
        .map((email) => ({...policy.employeeList?.[email], email}))
        .filter((employee) => employee.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && employee.role === CONST.POLICY.ROLE.ADMIN);
}

/**
 * Returns the policy of the report
 * @deprecated Get the data straight from Onyx - This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
 */
function getPolicy(policyID: string | undefined, policies: OnyxCollection<Policy> = allPolicies): OnyxEntry<Policy> {
    if (!policies || !policyID) {
        return undefined;
    }
    return policies[`${ONYXKEYS.COLLECTION.POLICY}${policyID}`];
}

/** Return active policies where current user is an admin */
function getActiveAdminWorkspaces(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, isOfflineNetworkStore(), currentUserLogin) && isPolicyAdmin(policy, currentUserLogin));
}

/** Return active policies where current user is an employee (of the role "user") */
function getActiveEmployeeWorkspaces(policies: OnyxCollection<Policy> | null, currentUserLogin: string | undefined): Policy[] {
    const activePolicies = getActivePolicies(policies, currentUserLogin);
    return activePolicies.filter((policy) => shouldShowPolicy(policy, isOfflineNetworkStore(), currentUserLogin) && isPolicyUser(policy, currentUserLogin));
}

/**
 * Given a list of admin policies for the current user, checks whether any of them
 * has a Xero accounting software integration configured.
 */
function hasPolicyWithXeroConnection(adminPolicies: Policy[] | undefined) {
    return adminPolicies?.some((policy) => !!policy?.connections?.[CONST.POLICY.CONNECTIONS.NAME.XERO]) ?? false;
}

/** Whether the user can send invoice from the workspace */
function canSendInvoiceFromWorkspace(policyID: string | undefined): boolean {
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const policy = getPolicy(policyID);
    return policy?.areInvoicesEnabled ?? false;
}

/** Whether the user can submit per diem expense from the workspace */
function canSubmitPerDiemExpenseFromWorkspace(policy: OnyxEntry<Policy>): boolean {
    const perDiemCustomUnit = getPerDiemCustomUnit(policy);
    return !!policy?.isPolicyExpenseChatEnabled && !isEmptyObject(perDiemCustomUnit) && !!perDiemCustomUnit?.enabled;
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

function hasIndependentTags(policy: OnyxEntry<Policy>, policyTagList: OnyxEntry<PolicyTagLists>) {
    if (!policy?.hasMultipleTagLists) {
        return false;
    }
    return Object.values(policyTagList ?? {}).every((tagList) => Object.values(tagList.tags).every((tag) => !tag.rules?.parentTagsFilter && !tag.parentTagsFilter));
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
    if (!key) {
        return;
    }
    return pendingFields[key];
}

function findSelectedVendorWithDefaultSelect(vendors: NetSuiteVendor[] | undefined, selectedVendorId: string | undefined) {
    const selectedVendor = (vendors ?? []).find(({id}) => id === selectedVendorId);
    return selectedVendor ?? vendors?.[0] ?? undefined;
}

function findSelectedSageVendorWithDefaultSelect(vendors: SageIntacctDataElementWithValue[] | SageIntacctDataElement[] | undefined, selectedVendorID: string | undefined) {
    const selectedVendor = (vendors ?? []).find(({id}) => id === selectedVendorID);
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
    const vendors = policy?.connections?.netsuite?.options.data.vendors;

    const selectedVendor = findSelectedVendorWithDefaultSelect(vendors, selectedVendorId);

    return (vendors ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedVendor?.id === id,
    }));
}

function getNetSuitePayableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;

    const selectedPayableAccount = findSelectedBankAccountWithDefaultSelect(payableAccounts, selectedBankAccountId);

    return (payableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedPayableAccount?.id === id,
    }));
}

function getNetSuiteReceivableAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined): SelectorType[] {
    const receivableAccounts = policy?.connections?.netsuite?.options.data.receivableList;

    const selectedReceivableAccount = findSelectedBankAccountWithDefaultSelect(receivableAccounts, selectedBankAccountId);

    return (receivableAccounts ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedReceivableAccount?.id === id,
    }));
}

function getNetSuiteInvoiceItemOptions(policy: Policy | undefined, selectedItemId: string | undefined): SelectorType[] {
    const invoiceItems = policy?.connections?.netsuite?.options.data.items;

    const selectedInvoiceItem = findSelectedInvoiceItemWithDefaultSelect(invoiceItems, selectedItemId);

    return (invoiceItems ?? []).map(({id, name}) => ({
        value: id,
        text: name,
        keyForList: id,
        isSelected: selectedInvoiceItem?.id === id,
    }));
}

function getNetSuiteTaxAccountOptions(policy: Policy | undefined, subsidiaryCountry?: string, selectedAccountId?: string): SelectorType[] {
    const taxAccounts = policy?.connections?.netsuite?.options.data.taxAccountsList;
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
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
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
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
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

function getNetSuiteApprovalAccountOptions(policy: Policy | undefined, selectedBankAccountId: string | undefined, translate: LocalizedTranslate): SelectorType[] {
    const payableAccounts = policy?.connections?.netsuite?.options.data.payableList;
    const defaultApprovalAccount: NetSuiteAccount = {
        id: CONST.NETSUITE_APPROVAL_ACCOUNT_DEFAULT,
        name: translate('workspace.netsuite.advancedConfig.defaultApprovalAccount'),
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

    const importedValueLabel = translate(`workspace.netsuite.import.customersOrJobs.label`, importFields, translate(`workspace.accounting.importTypes.${importedValue}`).toLowerCase());
    return importedValueLabel.charAt(0).toUpperCase() + importedValueLabel.slice(1);
}

function getNetSuiteImportCustomFieldLabel(
    policy: Policy | undefined,
    importField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>,
    translate: LocaleContextProps['translate'],
    localeCompare: LocaleContextProps['localeCompare'],
): string | undefined {
    const fieldData = policy?.connections?.netsuite?.options?.config.syncOptions?.[importField] ?? [];
    if (fieldData.length === 0) {
        return undefined;
    }

    const mappingSet = new Set(fieldData.map((item) => item.mapping));
    const importedTypes = Array.from(mappingSet)
        .sort((a, b) => localeCompare(b, a))
        .map((mapping) => translate(`workspace.netsuite.import.importTypes.${mapping !== '' ? mapping : 'TAG'}.label`).toLowerCase());
    return translate(`workspace.netsuite.import.importCustomFields.label`, importedTypes);
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

function getIntegrationLastSuccessfulDate(
    getLocalDateFromDatetime: LocaleContextProps['getLocalDateFromDatetime'],
    connection?: Connections[keyof Connections],
    connectionSyncProgress?: PolicyConnectionSyncProgress,
) {
    let syncSuccessfulDate;
    if (!connection) {
        return undefined;
    }
    if ((connection as NetSuiteConnection)?.lastSyncDate) {
        syncSuccessfulDate = (connection as NetSuiteConnection)?.lastSyncDate;
    } else {
        syncSuccessfulDate = (connection as ConnectionWithLastSyncData)?.lastSync?.successfulDate;
    }

    const connectionSyncTimeStamp = getLocalDateFromDatetime(connectionSyncProgress?.timestamp).toISOString();

    if (
        connectionSyncProgress &&
        connectionSyncProgress.stageInProgress === CONST.POLICY.CONNECTIONS.SYNC_STAGE_NAME.JOB_DONE &&
        syncSuccessfulDate &&
        connectionSyncTimeStamp > getLocalDateFromDatetime(syncSuccessfulDate).toISOString()
    ) {
        syncSuccessfulDate = connectionSyncTimeStamp;
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

/**
 * Takes removes pendingFields and errorFields from a customUnit
 */
function removePendingFieldsFromCustomUnit(customUnit: CustomUnit): CustomUnit {
    const cleanedCustomUnit = {...customUnit};

    delete cleanedCustomUnit.pendingFields;
    delete cleanedCustomUnit.errorFields;

    return cleanedCustomUnit;
}

function goBackWhenEnableFeature(policyID: string) {
    setTimeout(() => {
        Navigation.goBack(ROUTES.WORKSPACE_INITIAL.getRoute(policyID));
    }, CONST.WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY);
}

function navigateToExpensifyCardPage(policyID: string) {
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.WORKSPACE_EXPENSIFY_CARD.getRoute(policyID));
    });
}

function getConnectedIntegration(policy: Policy | undefined, accountingIntegrations?: ConnectionName[]) {
    return (accountingIntegrations ?? Object.values(CONST.POLICY.CONNECTIONS.NAME)).find((integration) => !!policy?.connections?.[integration]);
}

function getValidConnectedIntegration(policy: Policy | undefined, accountingIntegrations?: ConnectionName[]) {
    return (accountingIntegrations ?? Object.values(CONST.POLICY.CONNECTIONS.NAME)).find(
        (integration) => !!policy?.connections?.[integration] && !isConnectionUnverified(policy, integration),
    );
}

function hasIntegrationAutoSync(policy: Policy | undefined, connectedIntegration?: ConnectionName) {
    return (connectedIntegration && policy?.connections?.[connectedIntegration]?.config?.autoSync?.enabled) ?? false;
}

function hasUnsupportedIntegration(policy: Policy | undefined) {
    return Object.values(CONST.POLICY.CONNECTIONS.UNSUPPORTED_NAMES).some((integration) => !!(policy?.connections as Record<string, unknown>)?.[integration]);
}

function hasSupportedOnlyOnOldDotIntegration(policy: Policy | undefined) {
    return Object.values(CONST.POLICY.CONNECTIONS.SUPPORTED_ONLY_ON_OLDDOT).some((integration) => !!(policy?.connections as Record<string, unknown>)?.[integration]);
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

function hasOnlyPersonalPolicies(policies: OnyxCollection<Policy>) {
    return !Object.values(policies ?? {}).some((policy) => policy && policy.type !== CONST.POLICY.TYPE.PERSONAL && policy.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
}

function getCurrentTaxID(policy: OnyxEntry<Policy>, taxID: string): string | undefined {
    return Object.keys(policy?.taxRates?.taxes ?? {}).find((taxIDKey) => policy?.taxRates?.taxes?.[taxIDKey].previousTaxCode === taxID || taxIDKey === taxID);
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
        default:
            return translate('workspace.type.free');
    }
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

function areAllGroupPoliciesExpenseChatDisabled(policies: OnyxCollection<Policy> | null) {
    const groupPolicies = Object.values(policies ?? {}).filter(isPaidGroupPolicy);
    if (groupPolicies.length === 0) {
        return false;
    }
    return !groupPolicies.some((policy) => !!policy?.isPolicyExpenseChatEnabled);
}

function getGroupPaidPoliciesWithExpenseChatEnabled(policies: OnyxCollection<Policy> | null) {
    if (isEmptyObject(policies)) {
        return CONST.EMPTY_ARRAY;
    }
    return Object.values(policies).filter((policy) => isPaidGroupPolicy(policy) && policy?.isPolicyExpenseChatEnabled);
}

/**
 * This method checks if the active policy has expense chat enabled and is a paid group policy.
 * If true, it returns the active policy itself, else it returns the first policy from groupPoliciesWithChatEnabled.
 *
 * Further, if groupPoliciesWithChatEnabled is empty, then it returns undefined
 * and the user would be taken to the workspace selection page.
 */
function getDefaultChatEnabledPolicy(groupPoliciesWithChatEnabled: Array<OnyxInputOrEntry<Policy>>, activePolicy?: OnyxInputOrEntry<Policy> | null): OnyxInputOrEntry<Policy> | undefined {
    if (activePolicy && activePolicy.isPolicyExpenseChatEnabled && isPaidGroupPolicy(activePolicy)) {
        return activePolicy;
    }

    if (groupPoliciesWithChatEnabled.length === 1) {
        return groupPoliciesWithChatEnabled.at(0);
    }

    return undefined;
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

const getDescriptionForPolicyDomainCard = (domainName: string, policies?: OnyxCollection<Policy>): string => {
    // A domain name containing a policyID indicates that this is a workspace feed
    const policyID = domainName.match(CONST.REGEX.EXPENSIFY_POLICY_DOMAIN_NAME)?.[1];
    if (policyID) {
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = getPolicy(policyID.toUpperCase(), policies);
        return policy?.name ?? domainName;
    }
    return domainName;
};

function isPreferredExporter(policy: Policy, currentUserLogin: string) {
    const exporters = getConnectionExporters(policy);

    return exporters.some((exporter) => exporter && exporter === currentUserLogin);
}

/**
 * Checks if the current user is a member of any policyExpenseChatEnabled policy
 */
function isCurrentUserMemberOfAnyPolicy(): boolean {
    return Object.values(allPolicies ?? {}).some((policy) => policy?.isPolicyExpenseChatEnabled && policy?.id && policy.id !== CONST.POLICY.ID_FAKE);
}

/**
 * Whether the given policy member is an admin of the given policy
 */
function isMemberPolicyAdmin(policy: OnyxEntry<Policy>, memberEmail: string | undefined): boolean {
    if (!policy || !memberEmail) {
        return false;
    }
    const admins = getAdminEmployees(policy);
    return admins.some((admin) => admin.email === memberEmail);
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
 * Returns an array of connection exporters from the policy's accounting integrations
 */
function getConnectionExporters(policy: OnyxInputOrEntry<Policy>): Array<string | undefined> {
    return [
        policy?.connections?.intacct?.config?.export?.exporter,
        policy?.connections?.quickbooksDesktop?.config?.export?.exporter,
        policy?.connections?.quickbooksOnline?.config?.export?.exporter,
        policy?.connections?.xero?.config?.export?.exporter,
        policy?.connections?.netsuite?.options?.config?.exporter,
    ];
}

function isTimeTrackingEnabled(policy: OnyxEntry<Policy>): boolean {
    return !!policy?.units?.time?.enabled;
}

function getDefaultTimeTrackingRate(policy: Partial<OnyxEntry<Policy>>): number | undefined {
    return policy?.units?.time?.rate ? convertToBackendAmount(policy.units.time.rate) : undefined;
}

export {
    canEditTaxRate,
    escapeTagName,
    getActivePolicies,
    getAdminEmployees,
    getCleanedTagName,
    getCommaSeparatedTagNameWithSanitizedColons,
    getConnectedIntegration,
    getConnectionExporters,
    getValidConnectedIntegration,
    getCountOfEnabledTagsOfList,
    getIneligibleInvitees,
    getMemberAccountIDsForWorkspace,
    getNumericValue,
    isMultiLevelTags,
    // This will be fixed as part of https://github.com/Expensify/App/issues/66397
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getPersonalPolicy,
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getPolicy,
    getPolicyBrickRoadIndicatorStatus,
    getPolicyEmployeeListByIdWithoutCurrentUser,
    getSortedTagKeys,
    getTagList,
    getTagListByOrderWeight,
    getTagListName,
    getTagLists,
    hasTags,
    hasCustomCategories,
    getTaxByID,
    getUnitRateValue,
    getRateDisplayValue,
    goBackFromInvalidPolicy,
    hasAccountingConnections,
    shouldShowSyncError,
    shouldShowCustomUnitsError,
    shouldShowEmployeeListError,
    hasIntegrationAutoSync,
    hasPolicyCategoriesError,
    shouldShowPolicyError,
    shouldShowPolicyErrorFields,
    shouldShowTaxRateError,
    isControlOnAdvancedApprovalMode,
    isExpensifyTeam,
    isDeletedPolicyEmployee,
    isInstantSubmitEnabled,
    isDelayedSubmissionEnabled,
    getCorrectedAutoReportingFrequency,
    isPaidGroupPolicy,
    isPendingDeletePolicy,
    isUserPolicyAdmin,
    isPolicyAdmin,
    isPolicyUser,
    isPolicyAuditor,
    hasEligibleActiveAdminFromWorkspaces,
    isPolicyEmployee,
    isPolicyFeatureEnabled,
    getUberConnectionErrorDirectlyFromPolicy,
    isPolicyOwner,
    isPolicyMember,
    isPolicyPayer,
    arePaymentsEnabled,
    isSubmitAndClose,
    isTaxTrackingEnabled,
    shouldShowPolicy,
    getActiveAdminWorkspaces,
    getOwnedPaidPolicies,
    canSendInvoiceFromWorkspace,
    canSubmitPerDiemExpenseFromWorkspace,
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
    findSelectedSageVendorWithDefaultSelect,
    hasPolicyWithXeroConnection,
    getNetSuiteVendorOptions,
    canUseTaxNetSuite,
    canUseProvincialTaxNetSuite,
    getEligibleBankAccountShareRecipients,
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
    getDistanceRateCustomUnit,
    getPerDiemCustomUnit,
    getPolicyByCustomUnitID,
    getDistanceRateCustomUnitRate,
    getPerDiemRateCustomUnitRate,
    sortWorkspacesBySelected,
    removePendingFieldsFromCustomUnit,
    goBackWhenEnableFeature,
    navigateToExpensifyCardPage,
    getIntegrationLastSuccessfulDate,
    getCurrentConnectionName,
    getCustomersOrJobsLabelNetSuite,
    getDefaultApprover,
    getApprovalWorkflow,
    getReimburserAccountID,
    isControlPolicy,
    isCollectPolicy,
    isNetSuiteCustomSegmentRecord,
    getNameFromNetSuiteCustomField,
    isNetSuiteCustomFieldPropertyEditable,
    getCurrentSageIntacctEntityName,
    hasOnlyPersonalPolicies,
    getCurrentTaxID,
    areSettingsInErrorFields,
    settingsPendingAction,
    getGroupPaidPoliciesWithExpenseChatEnabled,
    getDefaultChatEnabledPolicy,
    getForwardsToAccount,
    getSubmitToAccountID,
    getAllTaxRatesNamesAndKeys as getAllTaxRates,
    getAllTaxRatesNamesAndValues,
    getTagNamesFromTagsLists,
    getTagApproverRule,
    getDomainNameForPolicy,
    hasUnsupportedIntegration,
    hasSupportedOnlyOnOldDotIntegration,
    getWorkflowApprovalsUnavailable,
    getNetSuiteImportCustomFieldLabel,
    getUserFriendlyWorkspaceType,
    isPolicyAccessible,
    hasOtherControlWorkspaces,
    shouldBlockWorkspaceDeletionForInvoicifyUser,
    getManagerAccountEmail,
    getRuleApprovers,
    canModifyPlan,
    getAdminsPrivateEmailDomains,
    getPolicyNameByID,
    getMostFrequentEmailDomain,
    getDescriptionForPolicyDomainCard,
    getManagerAccountID,
    isPreferredExporter,
    getCustomUnitsForDuplication,
    areAllGroupPoliciesExpenseChatDisabled,
    getCountOfRequiredTagLists,
    getActiveEmployeeWorkspaces,
    isCurrentUserMemberOfAnyPolicy,
    getPolicyRole,
    hasIndependentTags,
    getLengthOfTag,
    isPolicyMemberWithoutPendingDelete,
    hasDynamicExternalWorkflow,
    getPolicyEmployeeAccountIDs,
    isMemberPolicyAdmin,
    getActivePoliciesWithExpenseChatAndPerDiemEnabled,
    getTravelStep,
    getActivePoliciesWithExpenseChatAndPerDiemEnabledAndHasRates,
    isDefaultTagName,
    isTimeTrackingEnabled,
    getDefaultTimeTrackingRate,
    getActivePoliciesWithExpenseChatAndTimeEnabled,
};

export type {MemberEmailsToAccountIDs};
