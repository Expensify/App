import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getOutstandingReportsForUser, isSelfDM} from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {createPoliciesSelector} from '@src/selectors/Policy';
import type {Policy} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useOnyx from './useOnyx';

const policyIdSelector = (policy: OnyxEntry<Policy>) => policy?.id;

const policiesSelector = (policies: OnyxCollection<Policy>) => createPoliciesSelector(policies, policyIdSelector);

export default function useOutstandingReports(selectedReportID: string | undefined, selectedPolicyID: string | undefined, ownerAccountID: number | undefined, isEditing: boolean) {
    const [outstandingReportsByPolicyID] = useOnyx(ONYXKEYS.DERIVED.OUTSTANDING_REPORTS_BY_POLICY_ID, {canBeMissing: true});
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID, {canBeMissing: true});
    const [allPoliciesID] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {selector: policiesSelector, canBeMissing: false});
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {canBeMissing: true});
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`, {canBeMissing: true});

    // Early return if no reports are available to prevent useless loop
    if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
        return [];
    }

    if (!selectedPolicyID || selectedPolicyID === personalPolicyID || isSelfDM(selectedReport)) {
        return Object.values(allPoliciesID ?? {})
            .filter((policyID) => personalPolicyID !== policyID)
            .flatMap((policyID) => {
                if (!policyID) {
                    return [];
                }
                const reports = getOutstandingReportsForUser(
                    policyID,
                    ownerAccountID,
                    outstandingReportsByPolicyID?.[policyID ?? CONST.DEFAULT_NUMBER_ID] ?? {},
                    reportNameValuePairs,
                    isEditing,
                );

                return reports;
            });
    }

    return getOutstandingReportsForUser(selectedPolicyID, ownerAccountID, outstandingReportsByPolicyID?.[selectedPolicyID ?? CONST.DEFAULT_NUMBER_ID] ?? {}, reportNameValuePairs, isEditing);
}
