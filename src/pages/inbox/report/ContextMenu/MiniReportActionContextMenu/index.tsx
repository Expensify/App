import {Portal} from '@gorhom/portal';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {StyleSheet, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent} from 'react-native';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Hoverable from '@components/Hoverable';
import Icon from '@components/Icon';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import getButtonState from '@libs/getButtonState';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {ACTION_IDS, CONTEXT_MENU_ICON_NAMES} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import type {ContextMenuAction} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
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
import createReplyInThreadAction, {shouldShowReplyInThreadAction} from '@pages/inbox/report/ContextMenu/actions/replyInThreadAction';
import createUnholdAction, {shouldShowUnholdAction} from '@pages/inbox/report/ContextMenu/actions/unholdAction';
import {useMiniContextMenuActions, useMiniContextMenuState} from '@pages/inbox/report/ContextMenu/MiniContextMenuProvider';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useReportActionContextMenuData from '@pages/inbox/report/ContextMenu/useReportActionContextMenuData';
import CONST from '@src/CONST';

function MiniReportActionContextMenu() {
    const {
        isVisible = false,
        rowMeasurements,
        displayAsGroup = false,
        reportID,
        reportActionID,
        originalReportID,
        draftMessage = '',
        anchor,
        checkIfContextMenuActive,
        setIsEmojiPickerActive,
    } = useMiniContextMenuState() ?? {};
    const {hideMiniContextMenu, keepOpen, release} = useMiniContextMenuActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const StyleUtils = useStyleUtils();
    ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();

    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);
    const threeDotRef = useRef<View>(null);
    const overlayRef = useRef<View>(null);
    const menuContainerRef = useRef<View>(null);
    const [containerRect, setContainerRect] = useState<DOMRect | null>(null);

    useLayoutEffect(() => {
        const el = overlayRef.current as unknown as HTMLElement | null;
        if (!el) {
            return;
        }
        setContainerRect(el.getBoundingClientRect());
    }, [isVisible, rowMeasurements]);

    const position =
        isVisible && rowMeasurements && containerRect
            ? {
                  top: rowMeasurements.top - containerRect.top + (displayAsGroup ? -32 : -16),
                  right: containerRect.right - rowMeasurements.right + 16,
              }
            : null;

    useEffect(() => {
        const el = menuContainerRef.current as unknown as HTMLElement | null;
        if (!el) {
            return;
        }

        const onBlurCapture = (e: FocusEvent) => {
            if (e.relatedTarget && el.contains(e.relatedTarget as Node)) {
                return;
            }
            hideMiniContextMenu();
        };

        el.addEventListener('blur', onBlurCapture, true);
        return () => {
            el.removeEventListener('blur', onBlurCapture, true);
        };
    }, [hideMiniContextMenu]);

    useEffect(() => {
        const el = menuContainerRef.current as unknown as HTMLElement | null;
        if (!el) {
            return;
        }
        el.dataset.selectionScraperHiddenElement = String(isVisible);
    }, [isVisible]);

    const {
        report,
        reportAction,
        reportActions: reportActionsMap,
        originalReport,
        childReport,
        childReportActions,
        policy,
        policyTags,
        moneyRequestAction,
        moneyRequestReport,
        moneyRequestPolicy,
        iouTransaction,
        transaction,
        card,
        currentUserPersonalDetails,
        encryptedAuthToken,
        isArchivedRoom,
        isChronosReport,
        isThreadReportParentAction,
        isOffline,
        isHarvestReport,
        isTryNewDotNVPDismissed,
        isDelegateAccessRestricted,
        areHoldRequirementsMet,
        transactions,
        introSelected,
        movedFromReport,
        movedToReport,
        harvestReport,
        download,
        disabledActionIDs,
        showDelegateNoAccessModal,
        translate,
        getLocalDateFromDatetime,
        reportID: resolvedReportID,
        originalReportID: resolvedOriginalReportID,
        draftMessage: resolvedDraftMessage,
        selection: resolvedSelection,
        anchor: resolvedAnchor,
    } = useReportActionContextMenuData({
        reportID,
        reportActionID,
        originalReportID,
        draftMessage,
        selection: '',
        anchor,
    });

    const hideAndRun = (callback?: () => void) => {
        release();
        callback?.();
    };

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent, anchorRef: RefObject<ContextMenuAnchor | null>) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: '',
            contextMenuAnchor: anchorRef?.current ?? null,
            report: {
                reportID,
                originalReportID,
            },
            reportAction: {
                reportActionID: reportAction?.reportActionID,
                draftMessage,
            },
            callbacks: {
                onShow: checkIfContextMenuActive,
                onHide: () => {
                    checkIfContextMenuActive?.();
                    release();
                },
            },
            shouldCloseOnTarget: true,
            isOverflowMenu: true,
        });
    };

    const currentUserAccountID = currentUserPersonalDetails?.accountID ?? CONST.DEFAULT_NUMBER_ID;

    const isDisabled = (id: string) => disabledActionIDs.has(id);

    const showReplyInThread =
        !isDisabled(ACTION_IDS.REPLY_IN_THREAD) &&
        shouldShowReplyInThreadAction({
            reportAction,
            reportID: resolvedReportID,
            isThreadReportParentAction,
            isArchivedRoom,
        });
    const showMarkAsUnread = !isDisabled(ACTION_IDS.MARK_AS_UNREAD) && shouldShowMarkAsUnreadForReportAction({reportAction});
    const showExplain = !isDisabled(ACTION_IDS.EXPLAIN) && shouldShowExplainAction({reportAction, isArchivedRoom});
    const showEdit = !isDisabled(ACTION_IDS.EDIT) && shouldShowEditAction({reportAction, isArchivedRoom, isChronosReport, moneyRequestAction});
    const showUnhold =
        !isDisabled(ACTION_IDS.UNHOLD) &&
        shouldShowUnholdAction({
            moneyRequestReport,
            moneyRequestAction,
            moneyRequestPolicy,
            areHoldRequirementsMet,
            iouTransaction,
        });
    const showHold =
        !isDisabled(ACTION_IDS.HOLD) &&
        shouldShowHoldAction({
            moneyRequestReport,
            moneyRequestAction,
            moneyRequestPolicy,
            areHoldRequirementsMet,
            iouTransaction,
        });
    const showJoinThread =
        !isDisabled(ACTION_IDS.JOIN_THREAD) &&
        shouldShowJoinThreadAction({
            reportAction,
            isArchivedRoom,
            isThreadReportParentAction,
            isHarvestReport,
        });
    const showLeaveThread =
        !isDisabled(ACTION_IDS.LEAVE_THREAD) &&
        shouldShowLeaveThreadAction({
            reportAction,
            isArchivedRoom,
            isThreadReportParentAction,
            isHarvestReport,
        });
    const showCopyMessage = !isDisabled(ACTION_IDS.COPY_MESSAGE) && shouldShowCopyMessageAction({reportAction});
    const showCopyLink = !isDisabled(ACTION_IDS.COPY_LINK) && shouldShowCopyLinkAction({reportAction, menuTarget: resolvedAnchor});
    const showFlagAsOffensive = !isDisabled(ACTION_IDS.FLAG_AS_OFFENSIVE) && shouldShowFlagAsOffensiveAction({reportAction, isArchivedRoom, isChronosReport, reportID: resolvedReportID});
    const showDownload = !isDisabled(ACTION_IDS.DOWNLOAD) && shouldShowDownloadAction({reportAction, isOffline});
    const showDelete =
        !isDisabled(ACTION_IDS.DELETE) &&
        shouldShowDeleteAction({
            reportAction,
            isArchivedRoom,
            isChronosReport,
            reportID: resolvedReportID,
            moneyRequestAction,
            iouTransaction,
            transactions,
            childReportActions,
        });

    const allVisibleActions: ContextMenuAction[] = [];
    if (reportAction) {
        if (showReplyInThread) {
            allVisibleActions.push(
                createReplyInThreadAction({
                    childReport,
                    reportAction,
                    originalReport,
                    currentUserAccountID,
                    hideAndRun,
                    translate,
                    chatBubbleReplyIcon: icons.ChatBubbleReply,
                }),
            );
        }
        if (showMarkAsUnread) {
            allVisibleActions.push(
                createMarkAsUnreadAction({
                    reportID: resolvedReportID,
                    reportActions: reportActionsMap,
                    reportAction,
                    currentUserAccountID,
                    hideAndRun,
                    translate,
                    chatBubbleUnreadIcon: icons.ChatBubbleUnread,
                    checkmarkIcon: icons.Checkmark,
                }),
            );
        }
        if (showExplain) {
            allVisibleActions.push(
                createExplainAction({
                    childReport,
                    originalReport,
                    reportAction,
                    currentUserPersonalDetails,
                    hideAndRun,
                    translate,
                    conciergeIcon: icons.Concierge,
                }),
            );
        }
        if (showEdit) {
            allVisibleActions.push(
                createEditAction({
                    reportID: resolvedReportID,
                    reportAction,
                    moneyRequestAction,
                    draftMessage: resolvedDraftMessage,
                    introSelected,
                    hideAndRun,
                    translate,
                    pencilIcon: icons.Pencil,
                }),
            );
        }
        if (showUnhold) {
            allVisibleActions.push(
                createUnholdAction({
                    moneyRequestAction,
                    isDelegateAccessRestricted,
                    showDelegateNoAccessModal,
                    hideAndRun,
                    translate,
                    stopwatchIcon: icons.Stopwatch,
                }),
            );
        }
        if (showHold) {
            allVisibleActions.push(
                createHoldAction({
                    moneyRequestAction,
                    isDelegateAccessRestricted,
                    showDelegateNoAccessModal,
                    hideAndRun,
                    translate,
                    stopwatchIcon: icons.Stopwatch,
                }),
            );
        }
        if (showJoinThread) {
            allVisibleActions.push(createJoinThreadAction({reportAction, originalReport, currentUserAccountID, hideAndRun, translate, bellIcon: icons.Bell}));
        }
        if (showLeaveThread) {
            allVisibleActions.push(createLeaveThreadAction({reportAction, originalReport, currentUserAccountID, hideAndRun, translate, exitIcon: icons.Exit}));
        }
        if (showCopyMessage) {
            allVisibleActions.push(
                createCopyMessageAction({
                    reportAction,
                    transaction,
                    selection: resolvedSelection,
                    report,
                    card,
                    originalReport,
                    isHarvestReport,
                    isTryNewDotNVPDismissed,
                    movedFromReport,
                    movedToReport,
                    childReport,
                    policy,
                    getLocalDateFromDatetime,
                    policyTags,
                    translate,
                    harvestReport,
                    currentUserPersonalDetails,
                    copyIcon: icons.Copy,
                    checkmarkIcon: icons.Checkmark,
                }),
            );
        }
        if (showCopyLink) {
            allVisibleActions.push(createCopyLinkAction({reportAction, originalReportID: resolvedOriginalReportID, translate, linkCopyIcon: icons.LinkCopy, checkmarkIcon: icons.Checkmark}));
        }
        if (showFlagAsOffensive) {
            allVisibleActions.push(createFlagAsOffensiveAction({reportID: resolvedReportID, reportAction, hideAndRun, translate, flagIcon: icons.Flag}));
        }
        if (showDownload) {
            allVisibleActions.push(createDownloadAction({reportAction, encryptedAuthToken, download, translate, downloadIcon: icons.Download}));
        }
        if (showDelete) {
            allVisibleActions.push(createDeleteAction({reportID: resolvedReportID, reportAction, moneyRequestAction, hideAndRun, translate, trashcanIcon: icons.Trashcan}));
        }
    }

    const needsOverflow = allVisibleActions.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS;
    const displayedActions = needsOverflow ? allVisibleActions.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1) : allVisibleActions;

    const emojiData = createEmojiReactionData({
        reportID: resolvedReportID,
        reportAction,
        currentUserAccountID,
        openContextMenu: () => keepOpen(),
        setIsEmojiPickerActive,
        hideAndRun,
    });

    const hasEmoji = shouldShowEmojiReaction({reportAction}) && !!emojiData.reportAction && !!emojiData.reportActionID;

    if (!rowMeasurements) {
        return null;
    }

    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(true, shouldUseNarrowLayout);

    return (
        <Portal hostName={CONST.PORTAL_HOST_NAMES.CONTEXT_MENU}>
            <View
                ref={overlayRef}
                style={StyleSheet.absoluteFill}
                pointerEvents="box-none"
            >
                <View
                    style={StyleUtils.getMiniReportActionContextMenuWrapperStyle(position, isVisible)}
                    pointerEvents={isVisible ? 'auto' : 'none'}
                >
                    <Hoverable
                        onHoverIn={() => keepOpen()}
                        onHoverOut={() => {
                            release();
                            hideMiniContextMenu();
                        }}
                    >
                        <View
                            ref={menuContainerRef}
                            style={wrapperStyle}
                        >
                            {hasEmoji && !!emojiData.reportAction && !!emojiData.reportActionID && (
                                <MiniQuickEmojiReactions
                                    onEmojiSelected={(emoji, existingReactions, preferredSkinTone) =>
                                        interceptAnonymousUser(() => emojiData.toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))
                                    }
                                    onPressOpenPicker={emojiData.onPressOpenPicker}
                                    onEmojiPickerClosed={emojiData.onEmojiPickerClosed}
                                    reportActionID={emojiData.reportActionID}
                                    reportAction={emojiData.reportAction}
                                />
                            )}
                            {displayedActions.map((action) => (
                                <MiniContextMenuItem
                                    key={action.id}
                                    tooltipText={action.text}
                                    onPress={action.onPress}
                                    isDelayButtonStateComplete={false}
                                    sentryLabel={action.sentryLabel}
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
                            {needsOverflow && (
                                <MiniContextMenuItem
                                    ref={threeDotRef}
                                    tooltipText={translate('reportActionContextMenu.menu')}
                                    onPress={() =>
                                        interceptAnonymousUser(() => {
                                            openOverflowMenu(new MouseEvent('click'), threeDotRef);
                                            keepOpen();
                                        }, true)
                                    }
                                    isDelayButtonStateComplete={false}
                                    shouldPreventDefaultFocusOnPress={false}
                                    sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MENU}
                                >
                                    {({hovered, pressed}) => (
                                        <Icon
                                            small
                                            src={icons.ThreeDots}
                                            fill={StyleUtils.getIconFillColor(getButtonState(hovered, pressed))}
                                        />
                                    )}
                                </MiniContextMenuItem>
                            )}
                        </View>
                    </Hoverable>
                </View>
            </View>
        </Portal>
    );
}

export default MiniReportActionContextMenu;
