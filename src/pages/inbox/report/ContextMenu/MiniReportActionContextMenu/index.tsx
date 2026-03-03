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
import {ACTION_IDS} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {CONTEXT_MENU_ICON_NAMES} from '@pages/inbox/report/ContextMenu/actions/actionTypes';
import type {ContextMenuAction} from '@pages/inbox/report/ContextMenu/actions/actionTypes';
import createCopyLinkAction, {shouldShowCopyLinkAction} from '@pages/inbox/report/ContextMenu/actions/copyLinkAction';
import createCopyMessageAction, {shouldShowCopyMessageAction} from '@pages/inbox/report/ContextMenu/actions/copyMessageAction';
import createDeleteAction, {shouldShowDeleteAction} from '@pages/inbox/report/ContextMenu/actions/deleteAction';
import createDownloadAction, {shouldShowDownloadAction} from '@pages/inbox/report/ContextMenu/actions/downloadAction';
import createEditAction, {shouldShowEditAction} from '@pages/inbox/report/ContextMenu/actions/editAction';
import createEmojiReactionData, {shouldShowEmojiReaction} from '@pages/inbox/report/ContextMenu/actions/emojiReactionAction';
import createExplainAction, {shouldShowExplainAction} from '@pages/inbox/report/ContextMenu/actions/explainAction';
import createFlagAsOffensiveAction, {shouldShowFlagAsOffensiveAction} from '@pages/inbox/report/ContextMenu/actions/flagAsOffensiveAction';
import createHoldAction, {shouldShowHoldAction} from '@pages/inbox/report/ContextMenu/actions/holdAction';
import createJoinThreadAction, {shouldShowJoinThreadAction} from '@pages/inbox/report/ContextMenu/actions/joinThreadAction';
import createLeaveThreadAction, {shouldShowLeaveThreadAction} from '@pages/inbox/report/ContextMenu/actions/leaveThreadAction';
import createMarkAsUnreadAction, {shouldShowMarkAsUnreadForReportAction} from '@pages/inbox/report/ContextMenu/actions/markAsUnreadAction';
import createOverflowMenuAction from '@pages/inbox/report/ContextMenu/actions/overflowMenuAction';
import createReplyInThreadAction, {shouldShowReplyInThreadAction} from '@pages/inbox/report/ContextMenu/actions/replyInThreadAction';
import createUnholdAction, {shouldShowUnholdAction} from '@pages/inbox/report/ContextMenu/actions/unholdAction';
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
    const {interceptAnonymousUser, translate, disabledActionIDs} = data;

    const isDisabled = (id: string) => disabledActionIDs.has(id);

    const showReplyInThread =
        shouldShowReplyInThreadAction({
            reportAction: data.reportAction,
            reportID: data.reportID,
            isThreadReportParentAction: data.isThreadReportParentAction,
            isArchivedRoom: data.isArchivedRoom,
        }) && !isDisabled(ACTION_IDS.REPLY_IN_THREAD);
    const showMarkAsUnread = shouldShowMarkAsUnreadForReportAction({reportAction: data.reportAction}) && !isDisabled(ACTION_IDS.MARK_AS_UNREAD);
    const showExplain = shouldShowExplainAction({reportAction: data.reportAction, isArchivedRoom: data.isArchivedRoom}) && !isDisabled(ACTION_IDS.EXPLAIN);
    const showEdit =
        shouldShowEditAction({reportAction: data.reportAction, isArchivedRoom: data.isArchivedRoom, isChronosReport: data.isChronosReport, moneyRequestAction: data.moneyRequestAction}) &&
        !isDisabled(ACTION_IDS.EDIT);
    const showUnhold =
        shouldShowUnholdAction({
            moneyRequestReport: data.moneyRequestReport,
            moneyRequestAction: data.moneyRequestAction,
            moneyRequestPolicy: data.moneyRequestPolicy,
            areHoldRequirementsMet: data.areHoldRequirementsMet,
            iouTransaction: data.iouTransaction,
        }) && !isDisabled(ACTION_IDS.UNHOLD);
    const showHold =
        shouldShowHoldAction({
            moneyRequestReport: data.moneyRequestReport,
            moneyRequestAction: data.moneyRequestAction,
            moneyRequestPolicy: data.moneyRequestPolicy,
            areHoldRequirementsMet: data.areHoldRequirementsMet,
            iouTransaction: data.iouTransaction,
        }) && !isDisabled(ACTION_IDS.HOLD);
    const showJoinThread =
        shouldShowJoinThreadAction({
            reportAction: data.reportAction,
            isArchivedRoom: data.isArchivedRoom,
            isThreadReportParentAction: data.isThreadReportParentAction,
            isHarvestReport: data.isHarvestReport,
        }) && !isDisabled(ACTION_IDS.JOIN_THREAD);
    const showLeaveThread =
        shouldShowLeaveThreadAction({
            reportAction: data.reportAction,
            isArchivedRoom: data.isArchivedRoom,
            isThreadReportParentAction: data.isThreadReportParentAction,
            isHarvestReport: data.isHarvestReport,
        }) && !isDisabled(ACTION_IDS.LEAVE_THREAD);
    const showCopyMessage = shouldShowCopyMessageAction({reportAction: data.reportAction}) && !isDisabled(ACTION_IDS.COPY_MESSAGE);
    const showCopyLink = shouldShowCopyLinkAction({reportAction: data.reportAction, menuTarget: data.anchor}) && !isDisabled(ACTION_IDS.COPY_LINK);
    const showFlagAsOffensive =
        shouldShowFlagAsOffensiveAction({reportAction: data.reportAction, isArchivedRoom: data.isArchivedRoom, isChronosReport: data.isChronosReport, reportID: data.reportID}) &&
        !isDisabled(ACTION_IDS.FLAG_AS_OFFENSIVE);
    const showDownload = shouldShowDownloadAction({reportAction: data.reportAction, isOffline: data.isOffline}) && !isDisabled(ACTION_IDS.DOWNLOAD);
    const showDelete =
        shouldShowDeleteAction({
            reportAction: data.reportAction,
            isArchivedRoom: data.isArchivedRoom,
            isChronosReport: data.isChronosReport,
            reportID: data.reportID,
            moneyRequestAction: data.moneyRequestAction,
            iouTransaction: data.iouTransaction,
            transactions: data.transactions,
            childReportActions: data.childReportActions,
        }) && !isDisabled(ACTION_IDS.DELETE);

    /* eslint-disable react-hooks/refs -- factory functions store refs for later use, they don't read .current during render */
    const visibleActions = useMemo(() => {
        const items: ContextMenuAction[] = [];
        if (showReplyInThread) {
            items.push(
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
            );
        }
        if (showMarkAsUnread) {
            items.push(
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
            );
        }
        if (showExplain) {
            items.push(
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
            );
        }
        if (showEdit) {
            items.push(
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
            );
        }
        if (showUnhold) {
            items.push(
                createUnholdAction({
                    moneyRequestAction: data.moneyRequestAction,
                    isDelegateAccessRestricted: data.isDelegateAccessRestricted,
                    showDelegateNoAccessModal: data.showDelegateNoAccessModal,
                    interceptAnonymousUser,
                    hideAndRun,
                    translate,
                    stopwatchIcon: icons.Stopwatch,
                }),
            );
        }
        if (showHold) {
            items.push(
                createHoldAction({
                    moneyRequestAction: data.moneyRequestAction,
                    isDelegateAccessRestricted: data.isDelegateAccessRestricted,
                    showDelegateNoAccessModal: data.showDelegateNoAccessModal,
                    interceptAnonymousUser,
                    hideAndRun,
                    translate,
                    stopwatchIcon: icons.Stopwatch,
                }),
            );
        }
        if (showJoinThread) {
            items.push(
                createJoinThreadAction({reportAction, originalReport: data.originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate, bellIcon: icons.Bell}),
            );
        }
        if (showLeaveThread) {
            items.push(
                createLeaveThreadAction({reportAction, originalReport: data.originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate, exitIcon: icons.Exit}),
            );
        }
        if (showCopyMessage) {
            items.push(
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
            );
        }
        if (showCopyLink) {
            items.push(
                createCopyLinkAction({
                    reportAction,
                    originalReportID: data.originalReportID,
                    interceptAnonymousUser,
                    translate,
                    linkCopyIcon: icons.LinkCopy,
                    checkmarkIcon: icons.Checkmark,
                }),
            );
        }
        if (showFlagAsOffensive) {
            items.push(createFlagAsOffensiveAction({reportID: data.reportID, reportAction, hideAndRun, translate, flagIcon: icons.Flag}));
        }
        if (showDownload) {
            items.push(
                createDownloadAction({reportAction, encryptedAuthToken: data.encryptedAuthToken, interceptAnonymousUser, download: data.download, translate, downloadIcon: icons.Download}),
            );
        }
        if (showDelete) {
            items.push(createDeleteAction({reportID: data.reportID, reportAction, moneyRequestAction: data.moneyRequestAction, hideAndRun, translate, trashcanIcon: icons.Trashcan}));
        }
        return items;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        showReplyInThread,
        showMarkAsUnread,
        showExplain,
        showEdit,
        showUnhold,
        showHold,
        showJoinThread,
        showLeaveThread,
        showCopyMessage,
        showCopyLink,
        showFlagAsOffensive,
        showDownload,
        showDelete,
        data,
        reportAction,
        currentUserAccountID,
        interceptAnonymousUser,
        translate,
        icons,
    ]);

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

    const hasEmoji = shouldShowEmojiReaction({reportAction: data.reportAction}) && !!emojiData.reportAction && !!emojiData.reportActionID;
    const needsOverflow = visibleActions.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS;
    const displayedActions = needsOverflow ? visibleActions.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1) : visibleActions;

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
                    {displayedActions.map((action: ContextMenuAction) => (
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
