import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getExpenseReportChatContext} from '@libs/actions/IOU/SplitTransactionUpdate';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {SplitExpense} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import useOnyx from './useOnyx';

type Params = {
    splitExpenses: SplitExpense[];
    allReportsList: OnyxCollection<OnyxTypes.Report>;
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
};

function usePolicyTagListByReportID({splitExpenses, allReportsList, expenseReport, currentUserPersonalDetails}: Params): Record<string, OnyxTypes.PolicyTagLists> {
    const {fallbackPolicyParentChatReport, participants} = getExpenseReportChatContext({allReportsList, expenseReport, currentUserPersonalDetails});

    // Step 1: compute the policyID key for each split expense reportID
    const policyIDByReportID: Record<string, string | undefined> = {};
    for (const splitExpense of splitExpenses) {
        if (!splitExpense.reportID) {
            continue;
        }
        policyIDByReportID[splitExpense.reportID] =
            allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${splitExpense.reportID}`]?.policyID ??
            fallbackPolicyParentChatReport?.policyID ??
            allReportsList?.[`${ONYXKEYS.COLLECTION.REPORT}${participants.at(0)?.reportID}`]?.policyID;
    }

    // Step 2: fetch only the specific policy tags needed
    const [policyTagsByPolicyID] = useOnyx(ONYXKEYS.COLLECTION.POLICY_TAGS, {
        selector: (allTags) => {
            const uniquePolicyIDs = new Set(Object.values(policyIDByReportID).filter((id): id is string => !!id));
            const result: Record<string, OnyxTypes.PolicyTagLists> = {};
            for (const policyID of uniquePolicyIDs) {
                result[policyID] = allTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
            }
            return result;
        },
    });

    // Step 3: assemble policyTagListByReportID from the fetched tags
    return Object.fromEntries(Object.entries(policyIDByReportID).map(([reportID, policyID]) => [reportID, (policyID ? policyTagsByPolicyID?.[policyID] : undefined) ?? {}]));
}

export default usePolicyTagListByReportID;
