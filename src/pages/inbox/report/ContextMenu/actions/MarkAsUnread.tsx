import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';

function useMarkAsUnreadAction(): ActionDescriptor | null {
    const {reportID, reportActions, reportAction, currentUserAccountID, interceptAnonymousUser, hideAndRun} = useContextMenuPayload();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleUnread', 'Checkmark'] as const);

    return {
        id: 'markAsUnread',
        icon: icons.ChatBubbleUnread,
        text: translate('reportActionContextMenu.markAsUnread'),
        successIcon: icons.Checkmark,
        onPress: () =>
            interceptAnonymousUser(() => {
                markCommentAsUnread(reportID, reportActions, reportAction, currentUserAccountID);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD,
    };
}

export default useMarkAsUnreadAction;
