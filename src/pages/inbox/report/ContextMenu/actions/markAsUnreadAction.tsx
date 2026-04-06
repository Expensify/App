import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isActionOfType} from '@libs/ReportActionsUtils';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

type PopoverMarkAsUnreadItemProps = {
    reportID: string | undefined;
    reportActions: OnyxEntry<ReportActions>;
    reportAction: ReportAction;
    currentUserAccountID: number;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverMarkAsUnreadItem({reportID, reportActions, reportAction, currentUserAccountID, hideAndRun, isFocused, onFocus, onBlur}: PopoverMarkAsUnreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleUnread', 'Checkmark'] as const);

    return (
        <ContextMenuItem
            text={translate('reportActionContextMenu.markAsUnread')}
            icon={icons.ChatBubbleUnread}
            successIcon={icons.Checkmark}
            onPress={() =>
                interceptAnonymousUser(() => {
                    markCommentAsUnread(reportID, reportActions, reportAction, currentUserAccountID);
                    hideAndRun(ReportActionComposeFocusManager.focus);
                })
            }
            isFocused={isFocused}
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD}
        />
    );
}

type MiniMarkAsUnreadItemProps = {
    reportID: string | undefined;
    reportActions: OnyxEntry<ReportActions>;
    reportAction: ReportAction;
    currentUserAccountID: number;
    hideAndRun: (callback?: () => void) => void;
};

function MiniMarkAsUnreadItem({reportID, reportActions, reportAction, currentUserAccountID, hideAndRun}: MiniMarkAsUnreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleUnread', 'Checkmark'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.markAsUnread')}
            icon={icons.ChatBubbleUnread}
            successIcon={icons.Checkmark}
            onPress={() =>
                interceptAnonymousUser(() => {
                    markCommentAsUnread(reportID, reportActions, reportAction, currentUserAccountID);
                    hideAndRun(ReportActionComposeFocusManager.focus);
                })
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MARK_AS_UNREAD}
        />
    );
}

function shouldShowMarkAsUnreadForReportAction({reportAction}: {reportAction: OnyxEntry<ReportAction>}): boolean {
    return !isActionOfType(reportAction, CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED);
}

function shouldShowMarkAsUnreadForReport({isUnreadChat}: {isUnreadChat: boolean}): boolean {
    return !isUnreadChat;
}

export {shouldShowMarkAsUnreadForReportAction, shouldShowMarkAsUnreadForReport, PopoverMarkAsUnreadItem, MiniMarkAsUnreadItem};
