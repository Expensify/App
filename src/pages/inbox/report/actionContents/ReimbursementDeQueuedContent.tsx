import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useLocalize from '@hooks/useLocalize';
import {getReimbursementDeQueuedOrCanceledActionMessage} from '@libs/ReportUtils';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import type CONST from '@src/CONST';
import type {Report, ReportAction} from '@src/types/onyx';

type ReimbursementDeQueuedContentProps = {
    action: ReportAction;
    report: OnyxEntry<Report>;
};

function ReimbursementDeQueuedContent({action, report}: ReimbursementDeQueuedContentProps) {
    const {translate} = useLocalize();
    const message = getReimbursementDeQueuedOrCanceledActionMessage(
        translate,
        action as OnyxEntry<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED | typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED>>,
        report,
    );

    return <ReportActionItemBasicMessage message={message} />;
}

ReimbursementDeQueuedContent.displayName = 'ReimbursementDeQueuedContent';

export default ReimbursementDeQueuedContent;
