/**
 * Whether a workspace feature is enabled, including rules, invoice fields, attendee tracking, time tracking, and MCP.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import {hasAnyCategoryRules} from '@libs/CategoryUtils';
import {convertToBackendAmount} from '@libs/CurrencyUtils';
import {isAnyHRConnected} from '@libs/merge/HRUtils';
import {isAnyRecruitingConnected} from '@libs/merge/RecruitingUtils';

import CONST from '@src/CONST';
import type {Policy, PolicyCategories} from '@src/types/onyx';
import type {PolicyFeatureName} from '@src/types/onyx/Policy';

import type {OnyxEntry} from 'react-native-onyx';

import {hasAccountingFeatureConnection} from './connections';
import {canPolicyAccessFeature, isControlPolicy, isPaidGroupPolicy} from './policyType';

/**
 * For backwards compatibility with Expensify Classic, attendee tracking defaults to enabled
 * on Control policies when the property is undefined.
 */
function isAttendeeTrackingEnabled(policy: OnyxEntry<Policy>): boolean {
    return (isControlPolicy(policy) && policy?.isAttendeeTrackingEnabled) ?? true;
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

export {isAttendeeTrackingEnabled, arePolicyRulesEnabled, isInvoiceFieldsEnabled, isPolicyFeatureEnabled, isTimeTrackingEnabled, getDefaultTimeTrackingRate};
