import useIsArchived from '@hooks/useIsArchived';
import useOnyx from '@hooks/useOnyx';
import {getMovedReportID} from '@libs/ModifiedExpenseMessage';
import {getLastMessageTextForReport} from '@libs/OptionsListUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useLastActorDetails from './useLastActorDetails';
import useLastReportAction from './useLastReportAction';

function useLastMessageTextFromReport(reportID: string) {
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {canBeMissing: true});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const isReportArchived = useIsArchived(reportID);
    const lastAction = useLastReportAction(reportID);
    const movedFromReportID = getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.FROM);
    const movedToReportID = getMovedReportID(lastAction, CONST.REPORT.MOVE_TYPE.TO);
    const [movedFromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${movedFromReportID}`, {canBeMissing: true});
    const [movedToReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${movedToReportID}`, {canBeMissing: true});
    const lastActorDetails = useLastActorDetails(lastAction, report);

    return getLastMessageTextForReport({
        report,
        lastActorDetails,
        movedFromReport,
        movedToReport,
        policy,
        isReportArchived,
    });
}

export default useLastMessageTextFromReport;
