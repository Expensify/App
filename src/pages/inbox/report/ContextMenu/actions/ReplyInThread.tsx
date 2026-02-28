import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import {useContextMenuVisibility} from '@pages/inbox/report/ContextMenu/ContextMenuLayout';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {hideContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import {ACTION_IDS} from './actionConfig';

function ReplyInThread() {
    const {childReport, reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, isMini} = useContextMenuPayload();
    const {visibleActionIds, focusedIndex, setFocusedIndex} = useContextMenuVisibility();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply'] as const);

    const actionIndex = visibleActionIds.indexOf(ACTION_IDS.REPLY_IN_THREAD);
    if (actionIndex === -1) {
        return null;
    }
    const closePopover = !isMini;

    return (
        <ContextMenuItem
            icon={icons.ChatBubbleReply}
            text={translate('reportActionContextMenu.replyInThread')}
            isMini={isMini}
            onPress={() =>
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
                }, false)
            }
            isFocused={focusedIndex === actionIndex}
            onFocus={() => setFocusedIndex(actionIndex)}
            onBlur={() => (actionIndex === visibleActionIds.length - 1 || actionIndex === 1) && setFocusedIndex(-1)}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD}
        />
    );
}

export default ReplyInThread;
