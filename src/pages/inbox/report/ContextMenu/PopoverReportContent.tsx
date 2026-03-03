import React, {useMemo} from 'react';
import {View} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {ActionID} from './actions/actionConfig';
import type {ContextMenuAction} from './actions/actionTypes';
import {CONTEXT_MENU_ICON_NAMES} from './actions/actionTypes';
import createCopyOnyxDataAction from './actions/copyOnyxDataAction';
import createDebugAction from './actions/debugAction';
import createMarkAsReadAction from './actions/markAsReadAction';
import createMarkAsUnreadAction from './actions/markAsUnreadAction';
import createPinAction from './actions/pinAction';
import createUnpinAction from './actions/unpinAction';
import type {PopoverContentProps} from './PopoverContextMenu';
import useReportContextMenuData from './useReportContextMenuData';

function PopoverReportContent({menuState, hideAndRun, setLocalShouldKeepOpen, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
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
        type: CONST.CONTEXT_MENU_TYPES.REPORT,
        anchor: {current: menuState.contextMenuTargetNode ?? null},
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const reportAction = (data.reportAction ?? null) as NonNullable<typeof data.reportAction>;
    const {interceptAnonymousUser, translate} = data;

    const allActions: ContextMenuAction[] = [
        createMarkAsReadAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            mailIcon: icons.Mail,
            checkmarkIcon: icons.Checkmark,
        }),
        createMarkAsUnreadAction({
            reportID: data.reportID,
            reportActions: data.reportActions,
            reportAction,
            currentUserAccountID: 0,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            chatBubbleUnreadIcon: icons.ChatBubbleUnread,
            checkmarkIcon: icons.Checkmark,
        }),
        createPinAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            pinIcon: icons.Pin,
        }),
        createUnpinAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            pinIcon: icons.Pin,
        }),
        createCopyOnyxDataAction({
            report: data.report,
            interceptAnonymousUser,
            translate,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createDebugAction({
            reportID: data.reportID,
            reportAction,
            interceptAnonymousUser,
            translate,
            bugIcon: icons.Bug,
        }),
    ];

    const actions = allActions.filter((action) => visibleActionIDs.has(action.id as ActionID));

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: [],
        maxIndex: actions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            {actions.map((action: ContextMenuAction, i: number) => (
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
                    onBlur={() => (i === actions.length - 1 || i === 1) && setFocusedIndex(-1)}
                    disabled={action.disabled}
                    shouldShowLoadingSpinnerIcon={action.shouldShowLoadingSpinnerIcon}
                    sentryLabel={action.sentryLabel}
                />
            ))}
        </View>
    );
}

export default PopoverReportContent;
