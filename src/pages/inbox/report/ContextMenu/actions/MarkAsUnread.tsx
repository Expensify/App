import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';

function MarkAsUnread({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {reportID, reportActions, reportAction, currentUserAccountID, isMini, interceptAnonymousUser} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleUnread', 'Checkmark'] as const);

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
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD}
        />
    );
}

export default MarkAsUnread;
