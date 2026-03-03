import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ActionDescriptor} from './ActionDescriptor';
import type {ContextMenuActionParams} from './actionTypes';

function createMarkAsUnreadAction(params: ContextMenuActionParams): ActionDescriptor {
    const {reportID, reportActions, reportAction, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate} = params.payload;
    const {ChatBubbleUnread, Checkmark} = params.icons;

    return {
        id: 'markAsUnread',
        icon: ChatBubbleUnread,
        text: translate('reportActionContextMenu.markAsUnread'),
        successIcon: Checkmark,
        onPress: () =>
            interceptAnonymousUser(() => {
                markCommentAsUnread(reportID, reportActions, reportAction, currentUserAccountID);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD,
    };
}

export default createMarkAsUnreadAction;
