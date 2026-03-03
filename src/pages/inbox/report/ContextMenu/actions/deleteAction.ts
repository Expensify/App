import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createDeleteAction(params: ContextMenuActionParams): ActionDescriptor {
    const {payload, icons} = params;
    const {reportID, reportAction, moneyRequestAction, hideAndRun, translate} = payload;

    return {
        id: 'delete',
        icon: icons.Trashcan,
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
