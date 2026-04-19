import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

type MiniMarkAsUnreadItemProps = {
    reportID: string | undefined;
    reportActions: OnyxEntry<ReportActions>;
    reportAction: ReportAction;
    currentUserAccountID: number;
    hideAndRun: (callback?: () => void) => void;
};

export default function MiniMarkAsUnreadItem({reportID, reportActions, reportAction, currentUserAccountID, hideAndRun}: MiniMarkAsUnreadItemProps) {
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
