/**
 * Policy error flags, the brick-road indicator, and settings error and pending-action helpers.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import {isQBORefreshTokenExpiringSoon} from '@libs/AccountingUtils';
import {hasSynchronizationErrorMessage} from '@libs/actions/connections';
import {isMergeHRCompleteSetupNeeded, shouldShowHRConnectionError} from '@libs/merge/HRUtils';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import type {ErrorFields, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {ConnectionName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {getAccountingConnectionNames} from './connections';
import {isPolicyAdmin} from './permissions';

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

function shouldShowReimbursableExportDestinationAccountError(policy: OnyxEntry<Policy>, connectionNames?: readonly ConnectionName[]): boolean {
    if (!isPolicyAdmin(policy)) {
        return false;
    }
    const connectionsToCheck = connectionNames ?? getAccountingConnectionNames();
    for (const connection of connectionsToCheck) {
        switch (connection) {
            case CONST.POLICY.CONNECTIONS.NAME.QBO: {
                const qboConfig = policy?.connections?.[connection]?.config;
                if (!!qboConfig?.reimbursableExpensesExportDestination && !qboConfig.reimbursableExpensesAccount) {
                    return true;
                }
                break;
            }
            case CONST.POLICY.CONNECTIONS.NAME.RILLET: {
                const rilletConfig = policy?.connections?.[connection]?.config;
                if (rilletConfig?.export?.reimbursable === CONST.RILLET_EXPORT_REIMBURSABLE.REIMBURSEMENT && !rilletConfig.export.reimbursementAccountCode) {
                    return true;
                }
                break;
            }
            default:
                break;
        }
    }
    return false;
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
        shouldShowReimbursableExportDestinationAccountError(policy) ||
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

export {
    shouldShowEmployeeListError,
    shouldShowTaxRateError,
    hasPolicyCategoriesError,
    hasPolicyRulesError,
    shouldShowSyncError,
    shouldShowPolicyError,
    shouldShowCustomUnitsError,
    shouldShowReimbursableExportDestinationAccountError,
    getPolicyBrickRoadIndicatorStatus,
    isMergeHRCompleteSetupNeededSelector,
    isQBORefreshTokenExpiringSoonSelector,
    areSettingsInErrorFields,
    settingsPendingAction,
};
