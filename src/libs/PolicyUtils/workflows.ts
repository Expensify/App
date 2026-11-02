/**
 * Auto-reporting (scheduled submit) frequency, Submit & Close, and Dynamic External Workflow.
 * Extracted from PolicyUtils/index.ts to keep that file smaller.
 */
import CONST from '@src/CONST';
import type {OnyxInputOrEntry, Policy} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {isSubmitPolicy} from './policyType';

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
 * Whether the policy has approvals turned on. False while the policy hasn't loaded yet (no `approvalMode`),
 * unlike `!isSubmitAndClose(policy)`, which reads an unresolved policy as approvals-enabled.
 *
 * Submit workspaces are created in advanced mode even though configuring approvals is a paid upgrade for them, so
 * they are excluded here to match the off state the Workflows tab shows them.
 */
function areApprovalsEnabled(policy: OnyxInputOrEntry<Policy>): boolean {
    return !!policy?.approvalMode && !isSubmitPolicy(policy) && !isSubmitAndClose(policy);
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

export {
    isInstantSubmitEnabled,
    isDelayedSubmissionEnabled,
    getCorrectedAutoReportingFrequency,
    isSubmitAndClose,
    areApprovalsEnabled,
    hasDynamicExternalWorkflow,
    shouldHideDynamicExternalWorkflowPeople,
};
