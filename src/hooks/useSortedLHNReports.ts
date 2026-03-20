import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getPolicyEmployeeListByIdWithoutCurrentUser} from '@libs/PolicyUtils';
import SidebarUtils from '@libs/SidebarUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportNameValuePairs} from '@src/types/onyx';
import type PriorityMode from '@src/types/onyx/PriorityMode';
import useLocalize from './useLocalize';
import type {ReportsToDisplayInLHN} from './useReportsToDisplayInLHN';

type SidebarOrderedReportsStateContextValue = {
    orderedReports: OnyxTypes.Report[];
    orderedReportIDs: string[];
    currentReportID: string | undefined;
    policyMemberAccountIDs: number[];
};

function useSortedLHNReports(
    reportsToDisplayInLHN: ReportsToDisplayInLHN,
    priorityMode: OnyxEntry<PriorityMode>,
    reportsDrafts: OnyxCollection<string> | null | undefined,
    reportNameValuePairs: OnyxCollection<ReportNameValuePairs> | null | undefined,
    conciergeReportID: string | undefined,
    derivedCurrentReportID: string | undefined,
    shouldUseNarrowLayout: boolean,
    chatReports: OnyxCollection<OnyxTypes.Report> | null | undefined,
    policies: Record<string, Pick<OnyxTypes.Policy, 'type' | 'name' | 'avatarURL' | 'employeeList'> | undefined> | undefined,
    accountID: number | undefined,
) {
    const {localeCompare} = useLocalize();

    // Build the draft map from reportsDrafts. React Compiler memoizes this based on reportsDrafts.
    const hasDraftByReportID: Record<string, boolean> = {};
    if (reportsDrafts) {
        for (const [key, value] of Object.entries(reportsDrafts)) {
            if (value) {
                hasDraftByReportID[key.replace(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT, '')] = true;
            }
        }
    }

    const policyMemberAccountIDs = getPolicyEmployeeListByIdWithoutCurrentUser(policies, undefined, accountID);

    const getOrderedReportIDs = () =>
        SidebarUtils.sortReportsToDisplayInLHN(reportsToDisplayInLHN, priorityMode, localeCompare, hasDraftByReportID, reportNameValuePairs ?? undefined, conciergeReportID);

    const orderedReportIDs = getOrderedReportIDs();

    const getOrderedReports = (reportIDs: string[]): OnyxTypes.Report[] => {
        if (!chatReports) {
            return [];
        }
        return reportIDs.map((reportID) => chatReports[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]).filter(Boolean) as OnyxTypes.Report[];
    };

    const orderedReports = getOrderedReports(orderedReportIDs);

    // We need to make sure the current report is in the list of reports, but we do not want
    // to have to re-generate the list every time the currentReportID changes. To do that
    // we first generate the list as if there was no current report, then we check if
    // the current report is missing from the list, which should very rarely happen. In this
    // case we re-generate the list a 2nd time with the current report included.

    // We also execute the following logic if `shouldUseNarrowLayout` is false because this is
    // requirement for web. Consider a case, where we have report with expenses and we click on
    // any expense, a new LHN item is added in the list and is visible on web. But on mobile, we
    // just navigate to the screen with expense details, so there seems no point to execute this logic on mobile.
    let stateValue: SidebarOrderedReportsStateContextValue;
    if ((!shouldUseNarrowLayout || orderedReportIDs.length === 0) && derivedCurrentReportID && derivedCurrentReportID !== '-1' && orderedReportIDs.indexOf(derivedCurrentReportID) === -1) {
        const updatedReportIDs = getOrderedReportIDs();
        stateValue = {
            orderedReports: getOrderedReports(updatedReportIDs),
            orderedReportIDs: updatedReportIDs,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
        };
    } else {
        stateValue = {
            orderedReports,
            orderedReportIDs,
            currentReportID: derivedCurrentReportID,
            policyMemberAccountIDs,
        };
    }

    return stateValue;
}

export default useSortedLHNReports;
export type {SidebarOrderedReportsStateContextValue};
