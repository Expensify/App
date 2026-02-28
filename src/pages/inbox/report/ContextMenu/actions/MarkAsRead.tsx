import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function MarkAsRead() {
    const {reportID, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Mail', 'Checkmark'] as const);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.MARK_AS_READ);
    if (actionIndex === -1) {
        return null;
    }
    const closePopover = !isMini;

    return (
        <ContextMenuItem
            icon={icons.Mail}
            text={translate('reportActionContextMenu.markAsRead')}
            successIcon={icons.Checkmark}
            isMini={isMini}
            onPress={() => {
                readNewestAction(reportID, true, true);
                if (closePopover) {
                    hideContextMenu(true, ReportActionComposeFocusManager.focus);
                }
            }}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_READ}
        />
    );
}

export default MarkAsRead;
