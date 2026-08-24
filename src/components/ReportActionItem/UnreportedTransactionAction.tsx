import RenderHTML from '@components/RenderHTML';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {useDerivedReportNameByReportID} from '@hooks/useReportAttributes';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Parser from '@libs/Parser';
import {hasReasoning} from '@libs/ReportActionsUtils';
import {getUnreportedTransactionMessage, parseMovedTransactionReportIDs} from '@libs/ReportUtils';

import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemMessageWithExplain from '@pages/inbox/report/ReportActionItemMessageWithExplain';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportAction} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';

type UnreportedTransactionActionProps = {
    /** The action when a transaction is unreported */
    action: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<Report>;
};

function UnreportedTransactionAction({action, originalReport}: UnreportedTransactionActionProps) {
    const {fromReportID} = parseMovedTransactionReportIDs(action);

    const {translate} = useLocalize();
    const [fromReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${fromReportID}`);
    const [childReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(action.childReportID)}`);

    const isPendingDelete = fromReport?.pendingFields?.preview === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    const derivedReportName = useDerivedReportNameByReportID(fromReportID);
    const unreportedTransactionMessage = getUnreportedTransactionMessage({translate, fromReport, fromReportID, derivedReportName});

    if (hasReasoning(action)) {
        return (
            <ReportActionItemMessageWithExplain
                message={unreportedTransactionMessage}
                action={action}
                childReport={childReport}
                originalReport={originalReport}
            />
        );
    }

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
