import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getReportNextStep} from '@libs/NextStepUtils';
import {getFilteredReportActionsForReportView} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import {pendingExpenseActionSelector} from '@selectors/ReportMetaData';

import useCurrentUserPersonalDetails from './useCurrentUserPersonalDetails';
import useNetwork from './useNetwork';
import useOnyx from './useOnyx';
import usePaginatedReportActions from './usePaginatedReportActions';
import useReportIsArchived from './useReportIsArchived';
import useStrictPolicyRules from './useStrictPolicyRules';
import useTheme from './useTheme';
import useTransactionsAndViolationsForReport from './useTransactionsAndViolationsForReport';

function useNextStep(reportID: string | undefined) {
    const theme = useTheme();
    const {isOffline} = useNetwork();
    const {accountID: currentUserAccountID, email: currentUserEmail, login: currentUserLogin} = useCurrentUserPersonalDetails();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const reportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const {transactions, violations} = useTransactionsAndViolationsForReport(report?.reportID);
    const {areStrictPolicyRulesEnabled} = useStrictPolicyRules();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const [pendingExpenseActionMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`, {selector: pendingExpenseActionSelector});

    return getReportNextStep({
        currentUserLogin: currentUserLogin ?? '',
        currentUserEmail: currentUserEmail ?? '',
        currentUserAccountID,
        report,
        reportMetadata: pendingExpenseActionMetadata,
        reportActions,
        transactions,
        violations,
        policy,
        rules,
        areStrictPolicyRulesEnabled,
        isReportArchived,
        theme,
        isOffline,
    });
}

export default useNextStep;
