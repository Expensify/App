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
import {ACTION_IDS} from './actions/actionConfig';
import {CONTEXT_MENU_ICON_NAMES} from './actions/actionTypes';
import type {ContextMenuAction} from './actions/actionTypes';
import createCopyLinkAction, {shouldShowCopyLinkAction} from './actions/copyLinkAction';
import createCopyMessageAction, {shouldShowCopyMessageAction} from './actions/copyMessageAction';
import createDebugAction, {shouldShowDebugAction} from './actions/debugAction';
import createDeleteAction, {shouldShowDeleteAction} from './actions/deleteAction';
import createDownloadAction, {shouldShowDownloadAction} from './actions/downloadAction';
import createEditAction, {shouldShowEditAction} from './actions/editAction';
import createEmojiReactionData, {shouldShowEmojiReaction} from './actions/emojiReactionAction';
import createExplainAction, {shouldShowExplainAction} from './actions/explainAction';
import createFlagAsOffensiveAction, {shouldShowFlagAsOffensiveAction} from './actions/flagAsOffensiveAction';
import createHoldAction, {shouldShowHoldAction} from './actions/holdAction';
import createJoinThreadAction, {shouldShowJoinThreadAction} from './actions/joinThreadAction';
import createLeaveThreadAction, {shouldShowLeaveThreadAction} from './actions/leaveThreadAction';
import createMarkAsUnreadAction, {shouldShowMarkAsUnreadForReportAction} from './actions/markAsUnreadAction';
import createOverflowMenuAction from './actions/overflowMenuAction';
import createReplyInThreadAction, {shouldShowReplyInThreadAction} from './actions/replyInThreadAction';
import createUnholdAction, {shouldShowUnholdAction} from './actions/unholdAction';
import type {PopoverContentProps} from './PopoverContextMenu';
import {showContextMenu} from './ReportActionContextMenu';
import useReportActionContextMenuData from './useReportActionContextMenuData';

function PopoverReportActionContent({menuState, hideAndRun, setLocalShouldKeepOpen, contentRef, shouldEnableArrowNavigation}: PopoverContentProps) {
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
    const showDebug = shouldShowDebugAction({isDebugModeEnabled: data.isDebugModeEnabled}) && !isDisabled(ACTION_IDS.DEBUG);
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
    const replyInThreadAction = showReplyInThread
        ? createReplyInThreadAction({
              childReport: data.childReport,
              reportAction,
              originalReport: data.originalReport,
              currentUserAccountID,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              chatBubbleReplyIcon: icons.ChatBubbleReply,
          })
        : undefined;
    const markAsUnreadAction = showMarkAsUnread
        ? createMarkAsUnreadAction({
              reportID: data.reportID,
              reportActions: data.reportActions,
              reportAction,
              currentUserAccountID,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              chatBubbleUnreadIcon: icons.ChatBubbleUnread,
              checkmarkIcon: icons.Checkmark,
          })
        : undefined;
    const explainActionItem = showExplain
        ? createExplainAction({
              childReport: data.childReport,
              originalReport: data.originalReport,
              reportAction,
              currentUserPersonalDetails: data.currentUserPersonalDetails,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              conciergeIcon: icons.Concierge,
          })
        : undefined;
    const editActionItem = showEdit
        ? createEditAction({
              reportID: data.reportID,
              reportAction,
              moneyRequestAction: data.moneyRequestAction,
              draftMessage: data.draftMessage,
              introSelected: data.introSelected,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              pencilIcon: icons.Pencil,
          })
        : undefined;
    const unholdActionItem = showUnhold
        ? createUnholdAction({
              moneyRequestAction: data.moneyRequestAction,
              isDelegateAccessRestricted: data.isDelegateAccessRestricted,
              showDelegateNoAccessModal: data.showDelegateNoAccessModal,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              stopwatchIcon: icons.Stopwatch,
          })
        : undefined;
    const holdActionItem = showHold
        ? createHoldAction({
              moneyRequestAction: data.moneyRequestAction,
              isDelegateAccessRestricted: data.isDelegateAccessRestricted,
              showDelegateNoAccessModal: data.showDelegateNoAccessModal,
              interceptAnonymousUser,
              hideAndRun,
              translate,
              stopwatchIcon: icons.Stopwatch,
          })
        : undefined;
    const joinThreadActionItem = showJoinThread
        ? createJoinThreadAction({reportAction, originalReport: data.originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate, bellIcon: icons.Bell})
        : undefined;
    const leaveThreadActionItem = showLeaveThread
        ? createLeaveThreadAction({reportAction, originalReport: data.originalReport, currentUserAccountID, interceptAnonymousUser, hideAndRun, translate, exitIcon: icons.Exit})
        : undefined;
    const copyMessageActionItem = showCopyMessage
        ? createCopyMessageAction({
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
          })
        : undefined;
    const copyLinkActionItem = showCopyLink
        ? createCopyLinkAction({reportAction, originalReportID: data.originalReportID, interceptAnonymousUser, translate, linkCopyIcon: icons.LinkCopy, checkmarkIcon: icons.Checkmark})
        : undefined;
    const flagAsOffensiveActionItem = showFlagAsOffensive ? createFlagAsOffensiveAction({reportID: data.reportID, reportAction, hideAndRun, translate, flagIcon: icons.Flag}) : undefined;
    const downloadActionItem = showDownload
        ? createDownloadAction({reportAction, encryptedAuthToken: data.encryptedAuthToken, interceptAnonymousUser, download: data.download, translate, downloadIcon: icons.Download})
        : undefined;
    const debugActionItem = showDebug ? createDebugAction({reportID: data.reportID, reportAction, interceptAnonymousUser, translate, bugIcon: icons.Bug}) : undefined;
    const deleteActionItem = showDelete
        ? createDeleteAction({reportID: data.reportID, reportAction, moneyRequestAction: data.moneyRequestAction, hideAndRun, translate, trashcanIcon: icons.Trashcan})
        : undefined;

    const overflowMenu = createOverflowMenuAction(
        {
            openOverflowMenu,
            openContextMenu: () => setLocalShouldKeepOpen(true),
            interceptAnonymousUser,
            translate,
            threeDotsIcon: icons.ThreeDots,
        },
        overflowMenuRef,
    );
    /* eslint-enable react-hooks/refs */

    const visibleActions = useMemo(() => {
        const items: ContextMenuAction[] = [];
        if (replyInThreadAction) {
            items.push(replyInThreadAction);
        }
        if (markAsUnreadAction) {
            items.push(markAsUnreadAction);
        }
        if (explainActionItem) {
            items.push(explainActionItem);
        }
        if (editActionItem) {
            items.push(editActionItem);
        }
        if (unholdActionItem) {
            items.push(unholdActionItem);
        }
        if (holdActionItem) {
            items.push(holdActionItem);
        }
        if (joinThreadActionItem) {
            items.push(joinThreadActionItem);
        }
        if (leaveThreadActionItem) {
            items.push(leaveThreadActionItem);
        }
        if (copyMessageActionItem) {
            items.push(copyMessageActionItem);
        }
        if (copyLinkActionItem) {
            items.push(copyLinkActionItem);
        }
        if (flagAsOffensiveActionItem) {
            items.push(flagAsOffensiveActionItem);
        }
        if (downloadActionItem) {
            items.push(downloadActionItem);
        }
        if (debugActionItem) {
            items.push(debugActionItem);
        }
        if (deleteActionItem) {
            items.push(deleteActionItem);
        }
        items.push(overflowMenu);
        return items;
    }, [
        replyInThreadAction,
        markAsUnreadAction,
        explainActionItem,
        editActionItem,
        unholdActionItem,
        holdActionItem,
        joinThreadActionItem,
        leaveThreadActionItem,
        copyMessageActionItem,
        copyLinkActionItem,
        flagAsOffensiveActionItem,
        downloadActionItem,
        debugActionItem,
        deleteActionItem,
        overflowMenu,
    ]);

    const emojiData = createEmojiReactionData({
        reportID: data.reportID,
        reportAction: data.reportAction,
        currentUserAccountID,
        openContextMenu: () => setLocalShouldKeepOpen(true),
        setIsEmojiPickerActive: menuState.onEmojiPickerToggle,
        hideAndRun,
        interceptAnonymousUser,
    });

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: [],
        maxIndex: visibleActions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const hasEmoji = shouldShowEmojiReaction({reportAction: data.reportAction});
    const wrapperStyle = StyleUtils.getReportActionContextMenuStyles(false, shouldUseNarrowLayout);

    return (
        <View
            ref={contentRef}
            style={wrapperStyle}
        >
            <FocusTrapForModal active={!shouldUseNarrowLayout && shouldEnableArrowNavigation}>
                <View>
                    {hasEmoji && emojiData.reportActionID != null && emojiData.reportAction != null && (
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
            </FocusTrapForModal>
        </View>
    );
}

export default PopoverReportActionContent;
