import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Parser from '@libs/Parser';
import {getOriginalMessage, hasReasoning} from '@libs/ReportActionsUtils';
import {getMovedTransactionMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

type MovedTransactionActionProps = {
    /** The moved transaction action data */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION>;

    /** The element to render when there is no report that the transaction was moved to or from */
    emptyHTML: React.JSX.Element;

    /** The child report of the action item */
    childReport: OnyxEntry<Report>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

function MovedTransactionAction({action, emptyHTML, childReport, originalReport}: MovedTransactionActionProps) {
    const {translate} = useLocalize();
    const movedTransactionOriginalMessage = getOriginalMessage(action);
    const toReportID = movedTransactionOriginalMessage?.toReportID;
    const fromReportID = movedTransactionOriginalMessage?.fromReportID;

    const [toReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${toReportID}`);
    const [fromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const isPendingDelete = fromReport?.pendingFields?.preview === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    // When the transaction is moved from personal space (unreported), fromReportID will be "0" which doesn't exist in allReports
    const hasFromReport = fromReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? true : !!fromReport;

    // When expenses are merged multiple times, the previous fromReportID may reference a deleted report,
    // making it impossible to retrieve the report name for display
    // Ref: https://github.com/Expensify/App/issues/70338
    if (!toReport && !hasFromReport) {
        return emptyHTML;
    }

    const message = getMovedTransactionMessage(translate, action, conciergeReportID);

    if (hasReasoning(action)) {
        return (
            <ReportActionItemMessageWithExplain
                message={message}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

    const htmlContent = isPendingDelete ? `<del><comment><muted-text>${Parser.htmlToText(message)}</muted-text></comment></del>` : `<comment><muted-text>${message}</muted-text></comment>`;

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default MovedTransactionAction;
