import React from 'react';
import RenderHTML from '@components/RenderHTML';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import Parser from '@libs/Parser';
import {getOriginalMessage} from '@libs/ReportActionsUtils';
import {getUnreportedTransactionMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';

type UnreportedTransactionActionProps = {
    /** The action when a transaction is unreported */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION>;
};

function UnreportedTransactionAction({action}: UnreportedTransactionActionProps) {
    const unreportedTransactionOriginalMessage = getOriginalMessage(action);
    const fromReportID = unreportedTransactionOriginalMessage?.fromReportID;

    const {translate} = useLocalize();
    const [fromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`);

    const isPendingDelete = fromReport?.pendingFields?.preview === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const unreportedTransactionMessage = getUnreportedTransactionMessage(translate, action);
    const htmlContent = isPendingDelete
        ? `<del><comment><muted-text>${Parser.htmlToText(unreportedTransactionMessage)}</muted-text></comment></del>`
        : `<comment><muted-text>${unreportedTransactionMessage}</muted-text></comment>`;

    return (
        <ReportActionItemBasicMessage message="">
            <RenderHTML html={htmlContent} />
        </ReportActionItemBasicMessage>
    );
}

export default UnreportedTransactionAction;
