import {useMemo} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import getOutstandingReportsByPolicyIDFromReportCollection from '@libs/OutstandingReportsUtils';
import getReportNameValuePairsForReports from '@libs/ReportNameValuePairsUtils';
import {getOutstandingReportsForUser, isSelfDM} from '@libs/ReportUtils';
import {withSnapshotReports} from '@pages/Search/SearchEditMultiple/SearchEditMultipleUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OutstandingReportsByPolicyIDDerivedValue, Policy, Report, ReportNameValuePairs, SearchResults} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import useMappedPolicies from './useMappedPolicies';
import useOnyx from './useOnyx';

const policyIdMapper = (policy: OnyxEntry<Policy>) => policy?.id;

const createOutstandingReportsNVPsSelector =
    (
        outstandingReportsByPolicyID: OnyxEntry<OutstandingReportsByPolicyIDDerivedValue>,
        selectedPolicyID: string | undefined,
        personalPolicyID: string | undefined,
        allPoliciesID: OnyxCollection<string>,
        shouldUseAllPolicies: boolean,
    ) =>
    (allNVPs: OnyxCollection<ReportNameValuePairs>): OnyxCollection<ReportNameValuePairs> | undefined => {
        if (!outstandingReportsByPolicyID || !allNVPs) {
            return undefined;
        }

        const result: OnyxCollection<ReportNameValuePairs> = {};
        if (shouldUseAllPolicies) {
            for (const policyID of Object.values(allPoliciesID ?? {})) {
                if (!policyID || policyID === personalPolicyID) {
                    continue;
                }
                Object.assign(result, getReportNameValuePairsForReports(outstandingReportsByPolicyID[policyID], allNVPs));
            }
            return result;
        }

        return getReportNameValuePairsForReports(outstandingReportsByPolicyID[selectedPolicyID ?? CONST.DEFAULT_NUMBER_ID], allNVPs);
    };

/**
 * Resolves outstanding destination reports for Search bulk "move expenses", merging
 * search snapshot reports that may not yet exist in COLLECTION.REPORT (e.g. after refresh).
 */
function useSearchOutstandingReports(
    selectedReportID: string | undefined,
    selectedPolicyID: string | undefined,
    ownerAccountID: number | undefined,
    isEditing: boolean,
    snapshotData: SearchResults['data'] | undefined,
): Array<OnyxEntry<Report>> {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [personalPolicyID] = useOnyx(ONYXKEYS.PERSONAL_POLICY_ID);
    const [allPoliciesID] = useMappedPolicies(policyIdMapper);
    const [selectedReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${selectedReportID}`);

    const mergedReports = useMemo(() => withSnapshotReports(allReports, snapshotData), [allReports, snapshotData]);
    const outstandingReportsByPolicyID = useMemo(() => getOutstandingReportsByPolicyIDFromReportCollection(mergedReports), [mergedReports]);

    const shouldUseAllPolicies = !selectedPolicyID || selectedPolicyID === personalPolicyID || isSelfDM(selectedReport);
    const [reportNameValuePairs] = useOnyx(
        ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        {selector: createOutstandingReportsNVPsSelector(outstandingReportsByPolicyID, selectedPolicyID, personalPolicyID, allPoliciesID, shouldUseAllPolicies)},
        [outstandingReportsByPolicyID, selectedPolicyID, personalPolicyID, allPoliciesID, shouldUseAllPolicies],
    );

    if (!outstandingReportsByPolicyID || isEmptyObject(outstandingReportsByPolicyID)) {
        return [];
    }

    if (shouldUseAllPolicies) {
        const result: Array<OnyxEntry<Report>> = [];
        for (const policyID of Object.values(allPoliciesID ?? {})) {
            if (!policyID || policyID === personalPolicyID) {
                continue;
            }

            const reports = getOutstandingReportsForUser(policyID, ownerAccountID, outstandingReportsByPolicyID[policyID] ?? {}, reportNameValuePairs, isEditing);
            result.push(...reports);
        }
        return result;
    }

    return getOutstandingReportsForUser(selectedPolicyID, ownerAccountID, outstandingReportsByPolicyID[selectedPolicyID ?? CONST.DEFAULT_NUMBER_ID] ?? {}, reportNameValuePairs, isEditing);
}

export default useSearchOutstandingReports;
