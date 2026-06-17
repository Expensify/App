import {getAllPolicyExpenseChatReportActions} from '@libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Returns reportActions filtered to only policy expense chat reports (non-thread).
 */
function useAllPolicyExpenseChatReportActions() {
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    return getAllPolicyExpenseChatReportActions(allReports, allReportActions);
}

export default useAllPolicyExpenseChatReportActions;
