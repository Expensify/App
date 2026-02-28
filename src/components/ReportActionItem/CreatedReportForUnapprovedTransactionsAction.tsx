import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {getCreatedReportForUnapprovedTransactionsMessage, getOriginalMessage} from '@libs/ReportActionsUtils';
import {getReportName} from '@libs/ReportNameUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

type CreatedReportForUnapprovedTransactionsActionProps = {
    /** The report action when a report was created for unapproved transactions  */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS>;
};

function CreatedReportForUnapprovedTransactionsAction({action}: CreatedReportForUnapprovedTransactionsActionProps) {
    const {originalID} = getOriginalMessage(action) ?? {};
    const {translate} = useLocalize();
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${originalID}`);
    const reportName = getReportName(report);
    const htmlContent = `<comment><muted-text>${getCreatedReportForUnapprovedTransactionsMessage(originalID, reportName, translate)}</muted-text></comment>`;

    return (
        <ReportActionItemBasicMessage>
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default CreatedReportForUnapprovedTransactionsAction;
