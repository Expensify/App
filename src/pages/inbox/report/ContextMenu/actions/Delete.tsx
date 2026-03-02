import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useDeleteAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {reportID, reportAction, moneyRequestAction, hideAndRun} = useContextMenuPayload(payloadOverride);
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const {translate} = useLocalize();

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

export default useDeleteAction;
