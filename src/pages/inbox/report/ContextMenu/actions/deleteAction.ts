import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ReportAction} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type DeleteActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportAction: ReportAction;
    moneyRequestAction: ReportAction | undefined;
    hideAndRun: (callback?: () => void) => void;
    trashcanIcon: IconAsset;
};

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
