import {getOneTransactionThreadReportID} from '@libs/ReportActionsUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useNetwork from './useNetwork';
import useOnyx from './useOnyx';

function useOneTransactionThreadReportID(reportID: string | undefined) {
    const {isOffline} = useNetwork();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const [oneTransactionThreadReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        selector: (actions) => getOneTransactionThreadReportID(report, chatReport, actions, isOffline),
    });

    return oneTransactionThreadReportID;
}

export default useOneTransactionThreadReportID;
