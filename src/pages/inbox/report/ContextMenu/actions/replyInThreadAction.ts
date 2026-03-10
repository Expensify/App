import type {OnyxEntry} from 'react-native-onyx';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {shouldDisableThread} from '@libs/ReportUtils';
import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, Report as ReportType} from '@src/types/onyx';
import type IconAsset from '@src/types/utils/IconAsset';
import KeyboardUtils from '@src/utils/keyboard';
import type {BaseContextMenuActionParams, ContextMenuAction} from './actionConfig';

type ReplyInThreadActionParams = BaseContextMenuActionParams & {
    childReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    hideAndRun: (callback?: () => void) => void;
    chatBubbleReplyIcon: IconAsset;
};

function shouldShowReplyInThreadAction({
    reportAction,
    reportID,
    isThreadReportParentAction,
    isArchivedRoom,
}: {
    reportAction: OnyxEntry<ReportAction>;
    reportID: string | undefined;
    isThreadReportParentAction: boolean;
    isArchivedRoom: boolean;
}): boolean {
    if (!reportID) {
        return false;
    }
    return !shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
}

function createReplyInThreadAction({
    childReport,
    reportAction,
    originalReport,
    currentUserAccountID,
    hideAndRun,
    translate,
    chatBubbleReplyIcon,
}: ReplyInThreadActionParams): ContextMenuAction {
    return {
        id: 'replyInThread',
        icon: chatBubbleReplyIcon,
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
export {shouldShowReplyInThreadAction};
