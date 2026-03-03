import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createReplyInThreadAction(params: ContextMenuActionParams): ActionDescriptor {
    const {childReport, reportAction, originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate} = params.payload;
    const {ChatBubbleReply} = params.icons;

    return {
        id: 'replyInThread',
        icon: ChatBubbleReply,
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

export default createReplyInThreadAction;
