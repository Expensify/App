import type {OnyxEntry} from 'react-native-onyx';
import {getOutstandingReportsForUser, isReportIneligibleForMoveExpenses, isSelfDM} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useMappedPolicies from './useMappedPolicies';
import useOnyx from './useOnyx';

// Only the fields isReportIneligibleForMoveExpenses needs (via isInstantSubmitEnabled and
// isSubmitAndClose). Reading just these fields lets the hook share a single Onyx subscription
// to ONYXKEYS.COLLECTION.POLICY through useMappedPolicies, instead of subscribing to the
// full collection twice.
type PolicyEligibilitySnapshot = Pick<Policy, 'id' | 'autoReporting' | 'autoReportingFrequency' | 'approvalMode'>;

const policyEligibilityMapper = (policy: OnyxEntry<Policy>): PolicyEligibilitySnapshot | undefined =>
    policy
        ? {
              id: policy.id,
              autoReporting: policy.autoReporting,
              autoReportingFrequency: policy.autoReportingFrequency,
              approvalMode: policy.approvalMode,
          }
        : undefined;

export default function useOutstandingReports(selectedReportID: string | undefined, selectedPolicyID: string | undefined, ownerAccountID: number | undefined, isEditing: boolean) {
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [policiesEligibility] = useMappedPolicies(policyEligibilityMapper);
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`);

    // Early return if no reports are available to prevent useless loop
    if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
        return [];
    }

    // Hide reports the backend will reject as move-expense destinations (instant submit +
    // submit-and-close + only non-reimbursable transactions returns a 403 — issue #70423). The
    // currently-selected source report is always kept so the picker still renders for in-place
    // editing — e.g. the "Remove from report" footer for retracted reports (deploy blocker
    // #88424). Optimistic create reports are guarded inside isReportIneligibleForMoveExpenses
    // itself to handle the create→move microtask race (deploy blocker #88425).
    const filterEligibleReports = (reports: Array<OnyxEntry<Report>>) =>
        reports.filter((report) => {
            if (!report) {
                return false;
            }
            if (selectedReportID && report.reportID === selectedReportID) {
                return true;
            }
            // Structural cast: PolicyEligibilitySnapshot exposes exactly the fields
            // isReportIneligibleForMoveExpenses reads through isInstantSubmitEnabled and
            // isSubmitAndClose. Building a full Policy here just to satisfy the type would
            // negate the point of the narrow mapper.
            const policy = policiesEligibility?.[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`] as OnyxEntry<Policy>;
            return !isReportIneligibleForMoveExpenses(report, policy);
        });

    if (!selectedPolicyID || selectedPolicyID === personalPolicyID || isSelfDM(selectedReport)) {
        const result = [];
        for (const mappedPolicy of Object.values(policiesEligibility ?? {})) {
            const policyID = mappedPolicy?.id;
            if (!policyID || policyID === personalPolicyID) {
                continue;
            }

            const reports = getOutstandingReportsForUser(policyID, ownerAccountID, outstandingReportsByPolicyID[policyID] ?? {}, reportNameValuePairs, isEditing);
            result.push(...reports);
        }
        return filterEligibleReports(result);
    }

    return filterEligibleReports(
        getOutstandingReportsForUser(selectedPolicyID, ownerAccountID, outstandingReportsByPolicyID?.[selectedPolicyID ?? CONST.DEFAULT_NUMBER_ID] ?? {}, reportNameValuePairs, isEditing),
    );
}
