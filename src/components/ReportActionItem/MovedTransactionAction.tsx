import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Parser from '@libs/Parser';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {getMovedTransactionMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

type MovedTransactionActionProps = {
    /** The moved transaction action data */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION>;

    /** The element to render when there is no report that the transaction was moved to or from */
    emptyHTML: React.JSX.Element;
};

function MovedTransactionAction({action, emptyHTML}: MovedTransactionActionProps) {
    const {translate} = useLocalize();
    const movedTransactionOriginalMessage = getOriginalMessage(action);
    const toReportID = movedTransactionOriginalMessage?.toReportID;
    const fromReportID = movedTransactionOriginalMessage?.fromReportID;

    const [toReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${toReportID}`);
    const [fromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`);

    const isPendingDelete = fromReport?.pendingFields?.preview === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    // When the transaction is moved from personal space (unreported), fromReportID will be "0" which doesn't exist in allReports
    const hasFromReport = fromReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? true : !!fromReport;
    const htmlContent = isPendingDelete
        ? `<del><comment><muted-text>${Parser.htmlToText(getMovedTransactionMessage(translate, action))}</muted-text></comment></del>`
        : `<comment><muted-text>${getMovedTransactionMessage(translate, action)}</muted-text></comment>`;

    // When expenses are merged multiple times, the previous fromReportID may reference a deleted report,
    // making it impossible to retrieve the report name for display
    // Ref: https://github.com/Expensify/App/issues/70338
    if (!toReport && !hasFromReport) {
        return emptyHTML;
    }

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default MovedTransactionAction;
