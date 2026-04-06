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
import ReportActionComposeFocusManager from '@libs/ReportActionComposeFocusManager';
import {isActionableTrackExpense, isCreatedAction, isCreatedTaskReportAction, isDeletedAction, isMoneyRequestAction, isReportPreviewAction, isWhisperAction} from '@libs/ReportActionsUtils';
import {getChildReportNotificationPreference, shouldDisableThread, shouldDisplayThreadReplies} from '@libs/ReportUtils';
import {toggleSubscribeToChildReport} from '@userActions/Report';
import CONST from '@src/CONST';
import type {Beta, IntroSelected, ReportAction, Report as ReportType} from '@src/types/onyx';

type PopoverJoinThreadItemProps = {
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean | undefined;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
    isFocused?: boolean;
    onFocus?: () => void;
    onBlur?: () => void;
};

function PopoverJoinThreadItem({
    reportAction,
    originalReport,
    currentUserAccountID,
    introSelected,
    isSelfTourViewed,
    betas,
    hideAndRun,
    isFocused,
    onFocus,
    onBlur,
}: PopoverJoinThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bell'] as const);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    return (
        <FocusableMenuItem
            title={translate('reportActionContextMenu.joinThread')}
            icon={icons.Bell}
            onPress={() =>
                interceptAnonymousUser(() => {
                    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                    hideAndRun(() => {
                        ReportActionComposeFocusManager.focus();
                        toggleSubscribeToChildReport(
                            reportAction?.childReportID,
                            currentUserAccountID,
                            reportAction,
                            originalReport,
                            introSelected,
                            isSelfTourViewed,
                            betas,
                            childReportNotificationPreference,
                        );
                    });
                }, false)
            }
            wrapperStyle={[styles.pr8]}
            style={StyleUtils.getContextMenuItemStyles(windowWidth)}
            focused={isFocused}
            interactive
            onFocus={onFocus}
            onBlur={onBlur}
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.JOIN_THREAD}
        />
    );
}

type MiniJoinThreadItemProps = {
    reportAction: ReportAction;
    originalReport: OnyxEntry<ReportType>;
    currentUserAccountID: number;
    introSelected: OnyxEntry<IntroSelected>;
    isSelfTourViewed: boolean | undefined;
    betas: OnyxEntry<Beta[]>;
    hideAndRun: (callback?: () => void) => void;
};

function MiniJoinThreadItem({reportAction, originalReport, currentUserAccountID, introSelected, isSelfTourViewed, betas, hideAndRun}: MiniJoinThreadItemProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['Bell'] as const);

    return (
        <MiniContextMenuItem
            tooltipText={translate('reportActionContextMenu.joinThread')}
            icon={icons.Bell}
            onPress={() =>
                interceptAnonymousUser(() => {
                    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
                    hideAndRun(() => {
                        ReportActionComposeFocusManager.focus();
                        toggleSubscribeToChildReport(
                            reportAction?.childReportID,
                            currentUserAccountID,
                            reportAction,
                            originalReport,
                            introSelected,
                            isSelfTourViewed,
                            betas,
                            childReportNotificationPreference,
                        );
                    });
                }, false)
            }
            sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.JOIN_THREAD}
        />
    );
}

function shouldShowJoinThreadAction({
    reportAction,
    isArchivedRoom,
    isThreadReportParentAction,
    isHarvestReport,
}: {
    reportAction: OnyxEntry<ReportAction>;
    isArchivedRoom: boolean;
    isThreadReportParentAction: boolean;
    isHarvestReport: boolean;
}): boolean {
    const childReportNotificationPreference = getChildReportNotificationPreference(reportAction);
    const isDeletedActionResult = isDeletedAction(reportAction);
    const shouldDisplayReplies = shouldDisplayThreadReplies(reportAction, isThreadReportParentAction);
    const subscribed = childReportNotificationPreference !== 'hidden';
    const isWhisper = isWhisperAction(reportAction) || isActionableTrackExpense(reportAction);
    const isExpenseReportAction = isMoneyRequestAction(reportAction) || isReportPreviewAction(reportAction);
    const isTaskAction = isCreatedTaskReportAction(reportAction);
    const isHarvestCreatedExpenseReportAction = !!isHarvestReport && isCreatedAction(reportAction);
    const shouldDisableJoin = shouldDisableThread(reportAction, isThreadReportParentAction, isArchivedRoom);
    return (
        !subscribed &&
        !isWhisper &&
        !isTaskAction &&
        !isExpenseReportAction &&
        !isThreadReportParentAction &&
        !isHarvestCreatedExpenseReportAction &&
        !shouldDisableJoin &&
        (shouldDisplayReplies || (!isDeletedActionResult && !isArchivedRoom))
    );
}

export {shouldShowJoinThreadAction, PopoverJoinThreadItem, MiniJoinThreadItem};
