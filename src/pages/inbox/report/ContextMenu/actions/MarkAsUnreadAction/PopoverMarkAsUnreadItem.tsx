import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import ContextMenuItem from '@components/ContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {markCommentAsUnread} from '@userActions/Report';
import CONST from '@src/CONST';
import type {ReportAction, ReportActions} from '@src/types/onyx';

type PopoverMarkAsUnreadItemProps = {
    reportID: string | undefined;
    reportActions: OnyxEntry<ReportActions>;
    reportAction?: ReportAction;
    currentUserAccountID: number;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

export default function PopoverMarkAsUnreadItem({reportID, reportActions, reportAction, currentUserAccountID, hideAndRun, isFocused, onFocus, onBlur}: PopoverMarkAsUnreadItemProps) {
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
