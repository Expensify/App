import React, {useEffect, useMemo, useRef} from 'react';
import type {RefObject} from 'react';
import {createPortal} from 'react-dom';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Icon from '@components/Icon';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import getButtonState from '@libs/getButtonState';
import type {ActionID} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import type {ContextMenuAction} from '@pages/inbox/report/ContextMenu/actions/actionTypes';
import {CONTEXT_MENU_ICON_NAMES} from '@pages/inbox/report/ContextMenu/actions/actionTypes';
import {
    createCopyLinkAction,
    createCopyMessageAction,
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
    createReplyInThreadAction,
    createUnholdAction,
} from '@pages/inbox/report/ContextMenu/actions/ContextMenuAction';
import {useMiniContextMenuActions, useMiniContextMenuState} from '@pages/inbox/report/ContextMenu/MiniContextMenuProvider';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useReportActionContextMenuData from '@pages/inbox/report/ContextMenu/useReportActionContextMenuData';
import CONST from '@src/CONST';

const SLIDE_DURATION = 200;
const OVERSHOOT_EASING = Easing.bezier(0.34, 1.56, 0.64, 1);

function MiniReportActionContextMenu() {
    const state = useMiniContextMenuState();
    const miniActions = useMiniContextMenuActions();
    const {hideMiniContextMenu, cancelHide} = miniActions;
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);
    const threeDotRef = useRef<View>(null);

    const isVisible = state?.isVisible ?? false;
    const wasVisibleRef = useRef(false);

    const baseTop = useSharedValue(0);
    const baseRight = useSharedValue(0);

    useEffect(() => {
        if (!state) {
            return;
        }

        if (state.isVisible) {
            const targetY = state.rowMeasurements.top + (state.displayAsGroup ? -8 : -4);
            const targetRight = window.innerWidth - state.rowMeasurements.right + 4;

            if (wasVisibleRef.current) {
                baseTop.set(withTiming(targetY, {duration: SLIDE_DURATION, easing: OVERSHOOT_EASING}));
                baseRight.set(withTiming(targetRight, {duration: SLIDE_DURATION}));
            } else {
                baseTop.set(targetY);
                baseRight.set(targetRight);
            }
        }
        wasVisibleRef.current = state.isVisible;
    }, [state, baseTop, baseRight]);

    useEffect(() => {
        if (!isVisible) {
            return;
        }
        const handleScroll = () => {
            hideMiniContextMenu({immediate: true});
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isVisible, hideMiniContextMenu]);

    const positionStyle = useAnimatedStyle(() => ({
        top: baseTop.get(),
        right: baseRight.get(),
    }));

    const data = useReportActionContextMenuData({
        reportID: state?.reportID,
        reportActionID: state?.reportActionID,
        originalReportID: state?.originalReportID,
        draftMessage: state?.draftMessage ?? '',
        selection: '',
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
        anchor: state?.anchor,
    });

    const visibleActionIDs = useMemo(() => new Set(data.getVisibleActionIDs()), [data]);

    const hideAndRun = (callback?: () => void) => {
        miniActions.release();
        callback?.();
    };

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<ContextMenuAnchor | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: '',
            contextMenuAnchor: anchorRef?.current ?? null,
            report: {
                reportID: state?.reportID,
                originalReportID: state?.originalReportID,
            },
            reportAction: {
                reportActionID: data.reportAction?.reportActionID,
                draftMessage: state?.draftMessage,
            },
            callbacks: {
                onShow: state?.checkIfContextMenuActive,
                onHide: () => {
                    state?.checkIfContextMenuActive?.();
                    miniActions.release();
                },
            },
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
    const reportAction = (data.reportAction ?? null) as NonNullable<typeof data.reportAction>;
    const currentUserAccountID = data.currentUserPersonalDetails?.accountID ?? 0;
    const {interceptAnonymousUser, translate} = data;

    /* eslint-disable react-hooks/refs -- factory functions store refs for later use, they don't read .current during render */
    const allActions: ContextMenuAction[] = [
        createReplyInThreadAction({
            childReport: data.childReport,
            reportAction,
            originalReport: data.originalReport,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            chatBubbleReplyIcon: icons.ChatBubbleReply,
        }),
        createMarkAsUnreadAction({
            reportID: data.reportID,
            reportActions: data.reportActions,
            reportAction,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            chatBubbleUnreadIcon: icons.ChatBubbleUnread,
            checkmarkIcon: icons.Checkmark,
        }),
        createExplainAction({
            childReport: data.childReport,
            originalReport: data.originalReport,
            reportAction,
            currentUserPersonalDetails: data.currentUserPersonalDetails,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            conciergeIcon: icons.Concierge,
        }),
        createMarkAsReadAction({
            reportID: data.reportID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            mailIcon: icons.Mail,
            checkmarkIcon: icons.Checkmark,
        }),
        createEditAction({
            reportID: data.reportID,
            reportAction,
            moneyRequestAction: data.moneyRequestAction,
            draftMessage: data.draftMessage,
            introSelected: data.introSelected,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            pencilIcon: icons.Pencil,
        }),
        createUnholdAction({
            moneyRequestAction: data.moneyRequestAction,
            isDelegateAccessRestricted: data.isDelegateAccessRestricted,
            showDelegateNoAccessModal: data.showDelegateNoAccessModal,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            stopwatchIcon: icons.Stopwatch,
        }),
        createHoldAction({
            moneyRequestAction: data.moneyRequestAction,
            isDelegateAccessRestricted: data.isDelegateAccessRestricted,
            showDelegateNoAccessModal: data.showDelegateNoAccessModal,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            stopwatchIcon: icons.Stopwatch,
        }),
        createJoinThreadAction({
            reportAction,
            originalReport: data.originalReport,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            bellIcon: icons.Bell,
        }),
        createLeaveThreadAction({
            reportAction,
            originalReport: data.originalReport,
            currentUserAccountID,
            interceptAnonymousUser,
            hideAndRun,
            translate,
            exitIcon: icons.Exit,
        }),
        createCopyMessageAction({
            reportAction,
            transaction: data.transaction,
            selection: data.selection,
            report: data.report,
            card: data.card,
            originalReport: data.originalReport,
            isHarvestReport: data.isHarvestReport,
            isTryNewDotNVPDismissed: data.isTryNewDotNVPDismissed,
            movedFromReport: data.movedFromReport,
            movedToReport: data.movedToReport,
            childReport: data.childReport,
            policy: data.policy,
            getLocalDateFromDatetime: data.getLocalDateFromDatetime,
            policyTags: data.policyTags,
            translate,
            harvestReport: data.harvestReport,
            currentUserPersonalDetails: data.currentUserPersonalDetails,
            interceptAnonymousUser,
            copyIcon: icons.Copy,
            checkmarkIcon: icons.Checkmark,
        }),
        createCopyLinkAction({
            reportAction,
            originalReportID: data.originalReportID,
            interceptAnonymousUser,
            translate,
            linkCopyIcon: icons.LinkCopy,
            checkmarkIcon: icons.Checkmark,
        }),
        createFlagAsOffensiveAction({
            reportID: data.reportID,
            reportAction,
            hideAndRun,
            translate,
            flagIcon: icons.Flag,
        }),
        createDownloadAction({
            reportAction,
            encryptedAuthToken: data.encryptedAuthToken,
            interceptAnonymousUser,
            download: data.download,
            translate,
            downloadIcon: icons.Download,
        }),
        createDeleteAction({
            reportID: data.reportID,
            reportAction,
            moneyRequestAction: data.moneyRequestAction,
            hideAndRun,
            translate,
            trashcanIcon: icons.Trashcan,
        }),
    ];

    const actions = allActions.filter((action) => visibleActionIDs.has(action.id as ActionID));
    const emojiData = createEmojiReactionData({
        reportID: data.reportID,
        reportAction: data.reportAction,
        currentUserAccountID,
        openContextMenu: () => miniActions.keepOpen(),
        setIsEmojiPickerActive: state?.setIsEmojiPickerActive,
        hideAndRun,
        interceptAnonymousUser,
    });
    const overflowMenu = createOverflowMenuAction(
        {
            openOverflowMenu,
            openContextMenu: () => miniActions.keepOpen(),
            interceptAnonymousUser,
            translate,
            threeDotsIcon: icons.ThreeDots,
        },
        threeDotRef,
    );
    /* eslint-enable react-hooks/refs */

    const hasEmoji = visibleActionIDs.has('emojiReaction') && !!emojiData.reportAction && !!emojiData.reportActionID;
    const needsOverflow = actions.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS;
    const visibleActions = needsOverflow ? actions.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1) : actions;

    if (!state) {
        return null;
    }

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(true, shouldUseNarrowLayout);

    return createPortal(
        // eslint-disable-next-line jsx-a11y/mouse-events-have-key-events
        <div
            onMouseEnter={cancelHide}
            onMouseLeave={() => hideMiniContextMenu()}
            data-selection-scraper-hidden-element={isVisible}
            style={{
                position: 'fixed',
                zIndex: 8,
                opacity: isVisible ? 1 : 0,
                pointerEvents: isVisible ? 'auto' : 'none',
                cursor: 'default',
                userSelect: 'none',
                transitionProperty: 'opacity',
                transitionDuration: '150ms',
                transitionTimingFunction: 'ease-in-out',
            }}
        >
            <Animated.View style={[{position: 'absolute'}, positionStyle]}>
                <View style={wrapperStyle}>
                    {hasEmoji && !!emojiData.reportAction && !!emojiData.reportActionID && (
                        <MiniQuickEmojiReactions
                            onEmojiSelected={(emoji, existingReactions, preferredSkinTone) =>
                                emojiData.interceptAnonymousUser(() => emojiData.toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))
                            }
                            onPressOpenPicker={emojiData.onPressOpenPicker}
                            onEmojiPickerClosed={emojiData.onEmojiPickerClosed}
                            reportActionID={emojiData.reportActionID}
                            reportAction={emojiData.reportAction}
                        />
                    )}
                    {visibleActions.map((action: ContextMenuAction) => (
                        <MiniContextMenuItem
                            key={action.id}
                            isDelayButtonStateComplete
                            tooltipText={action.text}
                            onPress={action.onPress}
                            sentryLabel={action.sentryLabel ?? ''}
                        >
                            {({hovered, pressed}) => (
                                <Icon
                                    small
                                    src={action.icon}
                                    fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                />
                            )}
                        </MiniContextMenuItem>
                    ))}
                    {!!(needsOverflow && overflowMenu) &&
                        (() => {
                            const {buttonRef, text, onPress, sentryLabel, icon} = overflowMenu;
                            return (
                                <MiniContextMenuItem
                                    ref={buttonRef}
                                    isDelayButtonStateComplete
                                    tooltipText={text}
                                    onPress={onPress}
                                    shouldPreventDefaultFocusOnPress={false}
                                    sentryLabel={sentryLabel ?? ''}
                                >
                                    {({hovered, pressed}) => (
                                        <Icon
                                            small
                                            src={icon}
                                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                        />
                                    )}
                                </MiniContextMenuItem>
                            );
                        })()}
                </View>
            </Animated.View>
        </div>,
        document.body,
    );
}

export default MiniReportActionContextMenu;
