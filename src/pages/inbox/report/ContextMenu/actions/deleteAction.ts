import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {getOriginalMessage, isMessageDeleted, isMoneyRequestAction, isReportPreviewAction} from '@libs/ReportActionsUtils';
import {canDeleteReportAction} from '@libs/ReportUtils';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction, Transaction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type DeleteActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    hideAndRun: (callback?: () => void) => void;
    trashcanIcon: IconAsset;
};

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

function createDeleteAction({reportID, reportAction, moneyRequestAction, hideAndRun, translate, trashcanIcon}: DeleteActionParams): ContextMenuAction {
    return {
        id: 'delete',
        icon: trashcanIcon,
        text: translate('common.delete'),
        onPress: () => {
            const iouReportID = isMoneyRequestAction(moneyRequestAction) ? getOriginalMessage(moneyRequestAction)?.IOUReportID : undefined;
            const effectiveReportID = iouReportID && Number(iouReportID) !== 0 ? iouReportID : reportID;
            const actionSourceID = effectiveReportID !== reportID ? reportID : undefined;
            hideAndRun(() => showDeleteModal(effectiveReportID, moneyRequestAction ?? reportAction, undefined, undefined, undefined, actionSourceID));
        },
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE,
    };
}

export default createDeleteAction;
export {shouldShowDeleteAction};
