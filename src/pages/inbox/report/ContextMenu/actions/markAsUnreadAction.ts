import type {OnyxEntry} from 'react-native-onyx';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionTypes';

type MarkAsUnreadActionParams = BaseContextMenuActionParams & {
    reportID: string | undefined;
    reportActions: OnyxEntry<ReportActions>;
    reportAction: ReportAction;
    currentUserAccountID: number;
    interceptAnonymousUser: (callback: () => void, isAnonymousAction?: boolean) => void;
    hideAndRun: (callback?: () => void) => void;
    chatBubbleUnreadIcon: IconAsset;
    checkmarkIcon: IconAsset;
};

function createMarkAsUnreadAction({
    reportID,
    reportActions,
    reportAction,
    currentUserAccountID,
    interceptAnonymousUser,
    hideAndRun,
    translate,
    chatBubbleUnreadIcon,
    checkmarkIcon,
}: MarkAsUnreadActionParams): ContextMenuAction {
    return {
        id: 'markAsUnread',
        icon: chatBubbleUnreadIcon,
        text: translate('reportActionContextMenu.markAsUnread'),
        successIcon: checkmarkIcon,
        onPress: () =>
            interceptAnonymousUser(() => {
                markCommentAsUnread(reportID, reportActions, reportAction, currentUserAccountID);
                hideAndRun(ReportActionComposeFocusManager.focus);
            }),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD,
    };
}

export default createMarkAsUnreadAction;
