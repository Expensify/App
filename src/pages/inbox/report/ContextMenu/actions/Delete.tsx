import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu, showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';

function Delete({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, reportAction, moneyRequestAction, isMini} = useContextMenuPayload();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const {translate} = useLocalize();

    const closePopover = !isMini;

    const handlePress = () => {
        const iouReportID = isMoneyRequestAction(moneyRequestAction) ? getOriginalMessage(moneyRequestAction)?.IOUReportID : undefined;
        const effectiveReportID = iouReportID && Number(iouReportID) !== 0 ? iouReportID : reportID;
        const actionSourceID = effectiveReportID !== reportID ? reportID : undefined;
        if (closePopover) {
            hideContextMenu(false, () => showDeleteModal(effectiveReportID, moneyRequestAction ?? reportAction, undefined, undefined, undefined, actionSourceID));
            return;
        }
        showDeleteModal(effectiveReportID, moneyRequestAction ?? reportAction, undefined, undefined, undefined, actionSourceID);
    };

    return (
        <ContextMenuItem
            icon={icons.Trashcan}
            text={translate('common.delete')}
            isMini={isMini}
            onPress={handlePress}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE}
        />
    );
}

export default Delete;
