import type {RefObject} from 'react';
import React, {useMemo, useRef} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, Text as RNText, View as ViewType} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import type {ActionID} from './actions/actionConfig';
import {ORDERED_ACTION_SHOULD_SHOW} from './actions/actionConfig';
import type {ActionDescriptor} from './actions/ActionDescriptor';
import {CONTEXT_MENU_ICON_NAMES} from './actions/actionTypes';
import type {ContextMenuPayload} from './actions/actionTypes';
import {
    createCopyEmailAction,
    createCopyLinkAction,
    createCopyMessageAction,
    createCopyOnyxDataAction,
    createCopyToClipboardAction,
    createCopyURLAction,
    createDebugAction,
    createDeleteAction,
    createDownloadAction,
    createEditAction,
    createEmojiReactionData,
    createExplainAction,
    createFlagAsOffensiveAction,
    createHoldAction,
    createJoinThreadAction,
    createLeaveThreadAction,
    createMarkAsReadAction,
    createMarkAsUnreadAction,
    createOverflowMenuAction,
    createPinAction,
    createReplyInThreadAction,
    createUnholdAction,
    createUnpinAction,
} from './actions/ContextMenuAction';
import type {PopoverContentProps} from './PopoverContextMenu';
import {showContextMenu} from './ReportActionContextMenu';
import useReportActionContextMenuData from './useReportActionContextMenuData';

function PopoverReportActionContent({menuState, hideAndRun, setLocalShouldKeepOpen, transitionActionSheetState, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const overflowMenuRef = useRef<ViewType>(null);

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);

    const data = useReportActionContextMenuData({
        reportID: menuState.reportID,
        reportActionID: menuState.reportActionID,
        originalReportID: menuState.originalReportID,
        draftMessage: menuState.draftMessage ?? '',
        selection: menuState.selection ?? '',
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        anchor: {current: menuState.contextMenuTargetNode ?? null},
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRefParam: RefObject<ViewType | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: menuState.selection ?? '',
            contextMenuAnchor: anchorRefParam?.current as ViewType | RNText | null,
            report: {
                reportID: menuState.reportID,
                originalReportID: menuState.originalReportID,
            },
            reportAction: {
                reportActionID: data.reportAction?.reportActionID,
                draftMessage: menuState.draftMessage,
            },
            callbacks: {
                onShow: undefined,
                onHide: () => {
                    setLocalShouldKeepOpen(false);
                },
            },
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    const payload: ContextMenuPayload = {
        ...data,
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        reportAction: (data.reportAction ?? null) as NonNullable<typeof data.reportAction>,
        currentUserAccountID: data.currentUserPersonalDetails?.accountID ?? 0,
        close: () => setLocalShouldKeepOpen(false),
        hideAndRun,
        transitionActionSheetState,
        openContextMenu: () => setLocalShouldKeepOpen(true),
        openOverflowMenu,
        setIsEmojiPickerActive: menuState.onEmojiPickerToggle,
    };

    const params = {payload, icons};

    /* eslint-disable react-hooks/refs -- factory functions store refs for later use, they don't read .current during render */
    const allActions: ActionDescriptor[] = [
        createReplyInThreadAction(params),
        createMarkAsUnreadAction(params),
        createExplainAction(params),
        createMarkAsReadAction(params),
        createEditAction(params),
        createUnholdAction(params),
        createHoldAction(params),
        createJoinThreadAction(params),
        createLeaveThreadAction(params),
        createCopyURLAction(params),
        createCopyToClipboardAction(params),
        createCopyEmailAction(params),
        createCopyMessageAction(params),
        createCopyLinkAction(params),
        createPinAction(params),
        createUnpinAction(params),
        createFlagAsOffensiveAction(params),
        createDownloadAction(params),
        createCopyOnyxDataAction(params),
        createDebugAction(params),
        createDeleteAction(params),
    ];

    const overflowMenu = createOverflowMenuAction(params, overflowMenuRef);
    const actionsWithOverflow = [...allActions, overflowMenu];
    const actions = actionsWithOverflow.filter((action) => visibleActionIDs.has(action.id as ActionID));

    const emojiData = createEmojiReactionData(payload);
    /* eslint-enable react-hooks/refs */

    const contentActionIndexes = actions
        .map((action, index) => {
            const entry = ORDERED_ACTION_SHOULD_SHOW.find((e) => e.id === action.id);
            return entry?.isContentAction ? index : undefined;
        })
        .filter((index): index is number => index !== undefined);

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: contentActionIndexes,
        maxIndex: actions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const hasEmoji = visibleActionIDs.has('emojiReaction');
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            <FocusTrapForModal active={!shouldUseNarrowLayout && shouldEnableArrowNavigation}>
                <View>
                    {hasEmoji && emojiData.reportActionID != null && (
                        <QuickEmojiReactions
                            closeContextMenu={emojiData.closeContextMenu}
                            onEmojiSelected={(emoji, existingReactions, preferredSkinTone) =>
                                emojiData.interceptAnonymousUser(() => emojiData.toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))
                            }
                            reportActionID={emojiData.reportActionID}
                            reportAction={emojiData.reportAction}
                            setIsEmojiPickerActive={(active) => {
                                if (!active) {
                                    return;
                                }
                                setLocalShouldKeepOpen(true);
                            }}
                        />
                    )}
                    {actions.map((action: ActionDescriptor, i: number) => (
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
            </FocusTrapForModal>
        </View>
    );
}

export default PopoverReportActionContent;
