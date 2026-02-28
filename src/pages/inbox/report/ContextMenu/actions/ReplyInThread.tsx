import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {ContextMenuActionFocusProps} from '@pages/inbox/report/ContextMenu/BaseReportActionContextMenu';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';

function ReplyInThread({isFocused, onFocus, onBlur}: ContextMenuActionFocusProps) {
    const {childReport, reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, isMini} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply'] as const);

    const closePopover = !isMini;

    const handlePress = () =>
        interceptAnonymousUser(() => {
            if (closePopover) {
                hideContextMenu(false, () => {
                    KeyboardUtils.dismiss().then(() => {
                        navigateToAndOpenChildReport(childReport, reportAction, originalReport, currentUserAccountID);
                    });
                });
                return;
            }
            navigateToAndOpenChildReport(childReport, reportAction, originalReport, currentUserAccountID);
        }, false);

    return (
        <ContextMenuItem
            icon={icons.ChatBubbleReply}
            text={translate('reportActionContextMenu.replyInThread')}
            isMini={isMini}
            onPress={handlePress}
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD}
        />
    );
}

export default ReplyInThread;
