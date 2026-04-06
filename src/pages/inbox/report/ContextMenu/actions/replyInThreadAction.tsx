import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {shouldDisableThread} from '@libs/ReportUtils';
import {navigateToAndOpenChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Beta, IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';
import KeyboardUtils from '@src/utils/keyboard';

type PopoverReplyInThreadItemProps = {
    childReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverReplyInThreadItem({
    childReport,
    reportAction,
    originalReport,
    currentUserAccountID,
    introSelected,
    betas,
    hideAndRun,
    isFocused,
    onFocus,
    onBlur,
}: PopoverReplyInThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.replyInThread')}
            icon={icons.ChatBubbleReply}
            onPress={() =>
                interceptAnonymousUser(() => {
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() => navigateToAndOpenChildReport(childReport, reportAction, originalReport, currentUserAccountID, introSelected, betas));
                    });
                }, false)
            }
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD}
        />
    );
}

type MiniReplyInThreadItemProps = {
    childReport: OnyxEntry<ReportType>;
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
};

function MiniReplyInThreadItem({childReport, reportAction, originalReport, currentUserAccountID, introSelected, betas, hideAndRun}: MiniReplyInThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['ChatBubbleReply'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.replyInThread')}
            icon={icons.ChatBubbleReply}
            onPress={() =>
                interceptAnonymousUser(() => {
                    hideAndRun(() => {
                        KeyboardUtils.dismiss().then(() => navigateToAndOpenChildReport(childReport, reportAction, originalReport, currentUserAccountID, introSelected, betas));
                    });
                }, false)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.REPLY_IN_THREAD}
        />
    );
}

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

export {shouldShowReplyInThreadAction, PopoverReplyInThreadItem, MiniReplyInThreadItem};
