import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getOriginalMessage, isMessageDeleted, isMoneyRequestAction, isReportPreviewAction} from '@libs/ReportActionsUtils';
import {canDeleteReportAction} from '@libs/ReportUtils';
import type {ReportAction, Transaction} from '@src/types/onyx';

function shouldShowDeleteAction({
    reportAction,
    isArchivedRoom,
    isChronosReport,
    reportID,
    moneyRequestAction,
    iouTransaction,
    transactions,
    childReportActions,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isChronosReport: boolean;
    reportID: string | undefined;
    moneyRequestAction: ReportAction | undefined;
    iouTransaction: OnyxEntry<Transaction>;
    transactions: OnyxCollection<Transaction> | undefined;
    childReportActions: OnyxCollection<ReportAction>;
}): boolean {
    let effectiveReportID: string | undefined = reportID;
    if (isMoneyRequestAction(moneyRequestAction)) {
        effectiveReportID = getOriginalMessage(moneyRequestAction)?.IOUReportID;
    } else if (isReportPreviewAction(reportAction)) {
        effectiveReportID = reportAction?.childReportID;
    }
    return (
        !!reportID &&
        canDeleteReportAction(moneyRequestAction ?? reportAction, effectiveReportID, iouTransaction, transactions, childReportActions) &&
        !isArchivedRoom &&
        !isChronosReport &&
        !isMessageDeleted(reportAction)
    );
}

// eslint-disable-next-line import/prefer-default-export -- named utility export per module convention
export {shouldShowDeleteAction};
