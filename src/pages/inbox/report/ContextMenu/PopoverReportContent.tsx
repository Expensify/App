import React, {useMemo} from 'react';
import {View} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {ACTION_IDS} from './actions/actionConfig';
import {CONTEXT_MENU_ICON_NAMES} from './actions/actionTypes';
import type {ContextMenuAction} from './actions/actionTypes';
import createCopyOnyxDataAction, {shouldShowCopyOnyxDataAction} from './actions/copyOnyxDataAction';
import createDebugAction, {shouldShowDebugAction} from './actions/debugAction';
import createMarkAsReadAction, {shouldShowMarkAsReadAction} from './actions/markAsReadAction';
import createMarkAsUnreadAction, {shouldShowMarkAsUnreadForReport} from './actions/markAsUnreadAction';
import createPinAction, {shouldShowPinAction} from './actions/pinAction';
import createUnpinAction, {shouldShowUnpinAction} from './actions/unpinAction';
import type {PopoverContentProps} from './PopoverContextMenu';
import useReportContextMenuData from './useReportContextMenuData';

function PopoverReportContent({menuState, hideAndRun, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);

    const data = useReportContextMenuData({
        reportID: menuState.reportID,
        reportActionID: menuState.reportActionID,
        originalReportID: menuState.originalReportID,
        draftMessage: menuState.draftMessage ?? '',
        selection: menuState.selection ?? '',
        type: 'REPORT',
        anchor: {current: menuState.contextMenuTargetNode ?? null},
    });

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const reportAction = (data.reportAction ?? null) as NonNullable<typeof data.reportAction>;
    const {interceptAnonymousUser, translate, disabledActionIDs} = data;

    const isDisabled = (id: string) => disabledActionIDs.has(id);

    const showMarkAsRead = shouldShowMarkAsReadAction({isUnreadChat: data.isUnreadChat}) && !isDisabled(ACTION_IDS.MARK_AS_READ);
    const showMarkAsUnread = shouldShowMarkAsUnreadForReport({isUnreadChat: data.isUnreadChat}) && !isDisabled(ACTION_IDS.MARK_AS_UNREAD);
    const showPin = shouldShowPinAction({isPinnedChat: data.isPinnedChat}) && !isDisabled(ACTION_IDS.PIN);
    const showUnpin = shouldShowUnpinAction({isPinnedChat: data.isPinnedChat}) && !isDisabled(ACTION_IDS.UNPIN);
    const showCopyOnyxData = shouldShowCopyOnyxDataAction({isProduction: data.isProduction}) && !isDisabled(ACTION_IDS.COPY_ONYX_DATA);
    const showDebug = shouldShowDebugAction({isDebugModeEnabled: data.isDebugModeEnabled}) && !isDisabled(ACTION_IDS.DEBUG);

    const markAsReadActionItem = showMarkAsRead
        ? createMarkAsReadAction({reportID: data.reportID, interceptAnonymousUser, hideAndRun, translate, mailIcon: icons.Mail, checkmarkIcon: icons.Checkmark})
        : undefined;
    const markAsUnreadActionItem = showMarkAsUnread
        ? createMarkAsUnreadAction({
              reportID: data.reportID,
              reportActions: data.reportActions,
              reportAction,
              currentUserAccountID: 0,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              chatBubbleUnreadIcon: icons.ChatBubbleUnread,
              checkmarkIcon: icons.Checkmark,
          })
        : undefined;
    const pinActionItem = showPin ? createPinAction({reportID: data.reportID, interceptAnonymousUser, hideAndRun, translate, pinIcon: icons.Pin}) : undefined;
    const unpinActionItem = showUnpin ? createUnpinAction({reportID: data.reportID, interceptAnonymousUser, hideAndRun, translate, pinIcon: icons.Pin}) : undefined;
    const copyOnyxDataActionItem = showCopyOnyxData
        ? createCopyOnyxDataAction({report: data.report, interceptAnonymousUser, translate, copyIcon: icons.Copy, checkmarkIcon: icons.Checkmark})
        : undefined;
    const debugActionItem = showDebug ? createDebugAction({reportID: data.reportID, reportAction, interceptAnonymousUser, translate, bugIcon: icons.Bug}) : undefined;

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
