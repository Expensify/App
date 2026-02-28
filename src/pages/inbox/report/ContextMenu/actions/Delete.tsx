import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {getOriginalMessage, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu, showDeleteModal} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function Delete() {
    const {reportID, reportAction, moneyRequestAction, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const icons = useMemoizedLazyExpensifyIcons(['Trashcan'] as const);
    const {translate} = useLocalize();

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.DELETE);
    if (actionIndex === -1) {
        return null;
    }

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
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.DELETE}
        />
    );
}

export default Delete;
