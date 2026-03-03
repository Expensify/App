import React, {useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import useEnvironment from '@hooks/useEnvironment';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {canWriteInReport, isUnread} from '@libs/ReportUtils';
import {ACTION_IDS, RESTRICTED_READONLY_ACTION_IDS} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {CONTEXT_MENU_ICON_NAMES} from '@pages/inbox/report/ContextMenu/actions/actionTypes';
import type {ContextMenuAction} from '@pages/inbox/report/ContextMenu/actions/actionTypes';
import createCopyOnyxDataAction, {shouldShowCopyOnyxDataAction} from '@pages/inbox/report/ContextMenu/actions/copyOnyxDataAction';
import createDebugAction, {shouldShowDebugAction} from '@pages/inbox/report/ContextMenu/actions/debugAction';
import createMarkAsReadAction, {shouldShowMarkAsReadAction} from '@pages/inbox/report/ContextMenu/actions/markAsReadAction';
import createMarkAsUnreadAction, {shouldShowMarkAsUnreadForReport} from '@pages/inbox/report/ContextMenu/actions/markAsUnreadAction';
import createPinAction, {shouldShowPinAction} from '@pages/inbox/report/ContextMenu/actions/pinAction';
import createUnpinAction, {shouldShowUnpinAction} from '@pages/inbox/report/ContextMenu/actions/unpinAction';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReportAction} from '@src/types/onyx';
import type {PopoverContentProps} from '..';

const EMPTY_SET = new Set<string>();

function PopoverReportContent({menuState, hideAndRun, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);

    const reportID = menuState.reportID;
    const reportActionID = menuState.reportActionID;
    const originalReportID = menuState.originalReportID;

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {canEvict: false});
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isDebugModeEnabled] = useOnyx(ONYXKEYS.IS_DEBUG_MODE_ENABLED);

    const isOriginalReportArchived = useReportIsArchived(originalReportID);

    const disabledActionIDs = !canWriteInReport(report) ? RESTRICTED_READONLY_ACTION_IDS : EMPTY_SET;
    const isDisabled = (id: string) => disabledActionIDs.has(id);

    const hasValidReportAction = reportActions && reportActionID && reportActionID !== '0' && reportActionID !== '-1';
    const reportAction: OnyxEntry<ReportAction> = hasValidReportAction ? reportActions[reportActionID] : undefined;

    const isPinnedChat = !!report?.isPinned;
    const isUnreadChat = isUnread(report, undefined, isOriginalReportArchived);

    const showMarkAsRead = shouldShowMarkAsReadAction({isUnreadChat}) && !isDisabled(ACTION_IDS.MARK_AS_READ);
    const showMarkAsUnread = shouldShowMarkAsUnreadForReport({isUnreadChat}) && !isDisabled(ACTION_IDS.MARK_AS_UNREAD);
    const showPin = shouldShowPinAction({isPinnedChat}) && !isDisabled(ACTION_IDS.PIN);
    const showUnpin = shouldShowUnpinAction({isPinnedChat}) && !isDisabled(ACTION_IDS.UNPIN);
    const showCopyOnyxData = shouldShowCopyOnyxDataAction({isProduction}) && !isDisabled(ACTION_IDS.COPY_ONYX_DATA);
    const showDebug = shouldShowDebugAction({isDebugModeEnabled}) && !isDisabled(ACTION_IDS.DEBUG);

    const markAsReadActionItem = showMarkAsRead ? createMarkAsReadAction({reportID, hideAndRun, translate, mailIcon: icons.Mail, checkmarkIcon: icons.Checkmark}) : undefined;
    const markAsUnreadActionItem =
        showMarkAsUnread && reportAction
            ? createMarkAsUnreadAction({
                  reportID,
                  reportActions,
                  reportAction,
                  currentUserAccountID: 0,
                  hideAndRun,
                  translate,
                  chatBubbleUnreadIcon: icons.ChatBubbleUnread,
                  checkmarkIcon: icons.Checkmark,
              })
            : undefined;
    const pinActionItem = showPin ? createPinAction({reportID, hideAndRun, translate, pinIcon: icons.Pin}) : undefined;
    const unpinActionItem = showUnpin ? createUnpinAction({reportID, hideAndRun, translate, pinIcon: icons.Pin}) : undefined;
    const copyOnyxDataActionItem = showCopyOnyxData ? createCopyOnyxDataAction({report, translate, copyIcon: icons.Copy, checkmarkIcon: icons.Checkmark}) : undefined;
    const debugActionItem = showDebug && reportAction ? createDebugAction({reportID, reportAction, translate, bugIcon: icons.Bug}) : undefined;

    const visibleActions = useMemo(() => {
        const items: ContextMenuAction[] = [];
        if (markAsReadActionItem) {
            items.push(markAsReadActionItem);
        }
        if (markAsUnreadActionItem) {
            items.push(markAsUnreadActionItem);
        }
        if (pinActionItem) {
            items.push(pinActionItem);
        }
        if (unpinActionItem) {
            items.push(unpinActionItem);
        }
        if (copyOnyxDataActionItem) {
            items.push(copyOnyxDataActionItem);
        }
        if (debugActionItem) {
            items.push(debugActionItem);
        }
        return items;
    }, [markAsReadActionItem, markAsUnreadActionItem, pinActionItem, unpinActionItem, copyOnyxDataActionItem, debugActionItem]);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: [],
        maxIndex: visibleActions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            {visibleActions.map((action: ContextMenuAction, i: number) => (
                <FocusableMenuItem
                    key={action.id}
                    title={action.text}
                    icon={action.icon}
                    onPress={action.onPress}
                    wrapperStyle={[styles.pr8]}
                    description={action.description ?? ''}
                    descriptionTextStyle={styles.breakWord}
                    style={StyleUtils.getContextMenuItemStyles(windowWidth)}
                    isAnonymousAction={action.isAnonymousAction}
                    focused={focusedIndex === i}
                    interactive
                    onFocus={() => setFocusedIndex(i)}
                    onBlur={() => (i === visibleActions.length - 1 || i === 1) && setFocusedIndex(-1)}
                    disabled={action.disabled}
                    shouldShowLoadingSpinnerIcon={action.shouldShowLoadingSpinnerIcon}
                    sentryLabel={action.sentryLabel}
                />
            ))}
        </View>
    );
}

export default PopoverReportContent;
