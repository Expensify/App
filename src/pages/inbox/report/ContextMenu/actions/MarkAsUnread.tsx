import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import {ACTION_IDS} from './actionConfig';

function MarkAsUnread() {
    const {reportID, reportActions, reportAction, currentUserAccountID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleUnread', 'Checkmark'] as const);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.MARK_AS_UNREAD);
    if (actionIndex === -1) {
        return null;
    }
    const closePopover = !isMini;

    const handlePress = () => {
        markCommentAsUnread(reportID, reportActions, reportAction, currentUserAccountID);
        if (closePopover) {
            hideContextMenu(true, ReportActionComposeFocusManager.focus);
        }
    };

    return (
        <ContextMenuItem
            icon={icons.ChatBubbleUnread}
            text={translate('reportActionContextMenu.markAsUnread')}
            successIcon={icons.Checkmark}
            isMini={isMini}
            onPress={() => interceptAnonymousUser(handlePress)}
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD}
        />
    );
}

export default MarkAsUnread;
