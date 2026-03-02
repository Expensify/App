import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import type {ContextMenuPayloadContextValue} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {useContextMenuPayload} from '@pages/inbox/report/ContextMenu/ContextMenuPayloadProvider';
import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import type {ActionDescriptor} from './ActionDescriptor';

function useReplyInThreadAction(payloadOverride?: ContextMenuPayloadContextValue): ActionDescriptor | null {
    const {childReport, reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun} = useContextMenuPayload(payloadOverride);
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply'] as const);

    return {
        id: 'replyInThread',
        icon: icons.ChatBubbleReply,
        text: translate('reportActionContextMenu.replyInThread'),
        onPress: () =>
            interceptAnonymousUser(() => {
                hideAndRun(() => {
                    KeyboardUtils.dismiss().then(() => {
                        navigateToAndOpenChildReport(childReport, reportAction, originalReport, currentUserAccountID);
                    });
                });
            }, false),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD,
    };
}

export default useReplyInThreadAction;
