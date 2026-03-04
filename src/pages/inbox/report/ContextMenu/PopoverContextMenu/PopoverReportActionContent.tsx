import type {RefObject} from 'react';
import React from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent, View as ViewType} from 'react-native';
import FocusableMenuItem from '@components/FocusableMenuItem';
import FocusTrapForModal from '@components/FocusTrap/FocusTrapForModal';
import QuickEmojiReactions from '@components/Reactions/QuickEmojiReactions';
import useArrowKeyFocusManager from '@hooks/useArrowKeyFocusManager';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {ACTION_IDS, CONTEXT_MENU_ICON_NAMES} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import type {ContextMenuAction} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import createCopyLinkAction, {shouldShowCopyLinkAction} from '@pages/inbox/report/ContextMenu/actions/copyLinkAction';
import createCopyMessageAction, {shouldShowCopyMessageAction} from '@pages/inbox/report/ContextMenu/actions/copyMessageAction';
import createDebugAction, {shouldShowDebugAction} from '@pages/inbox/report/ContextMenu/actions/debugAction';
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
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useReportActionContextMenuData from '@pages/inbox/report/ContextMenu/useReportActionContextMenuData';
import CONST from '@src/CONST';

type PopoverReportActionContentProps = {
    reportID: string | undefined;
    reportActionID: string | undefined;
    originalReportID: string | undefined;
    draftMessage: string | undefined;
    selection: string;
    contextMenuTargetNode: HTMLDivElement | null;
    onEmojiPickerToggle: ((state: boolean) => void) | undefined;
    hideAndRun: (callback?: () => void) => void;
    setLocalShouldKeepOpen: (value: boolean) => void;
    contentRef: RefObject<ViewType | null>;
    shouldEnableArrowNavigation: boolean;
};

function PopoverReportActionContent({
    reportID,
    reportActionID,
    originalReportID,
    draftMessage,
    selection,
    contextMenuTargetNode,
    onEmojiPickerToggle,
    hideAndRun,
    setLocalShouldKeepOpen,
    contentRef,
    shouldEnableArrowNavigation,
}: PopoverReportActionContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {windowWidth} = useWindowDimensions();
    const icons = useMemoizedLazyExpensifyIcons(CONTEXT_MENU_ICON_NAMES);

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
        isDebugModeEnabled,
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
        anchor,
    } = useReportActionContextMenuData({
        reportID,
        reportActionID,
        originalReportID,
        draftMessage: draftMessage ?? '',
        selection: selection ?? '',
        anchor: {current: contextMenuTargetNode ?? null},
    });

    const openOverflowMenu = (event: GestureResponderEvent | MouseEvent) => {
        showContextMenu({
            type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
            event,
            selection: selection ?? '',
            contextMenuAnchor: null,
            report: {
                reportID,
                originalReportID,
            },
            reportAction: {
                reportActionID: reportAction?.reportActionID,
                draftMessage,
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
    const showCopyLink = !isDisabled(ACTION_IDS.COPY_LINK) && shouldShowCopyLinkAction({reportAction, menuTarget: anchor});
    const showFlagAsOffensive = !isDisabled(ACTION_IDS.FLAG_AS_OFFENSIVE) && shouldShowFlagAsOffensiveAction({reportAction, isArchivedRoom, isChronosReport, reportID: resolvedReportID});
    const showDownload = !isDisabled(ACTION_IDS.DOWNLOAD) && shouldShowDownloadAction({reportAction, isOffline});
    const showDebug = !isDisabled(ACTION_IDS.DEBUG) && shouldShowDebugAction({isDebugModeEnabled});
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

    const overflowAction: ContextMenuAction = {
        id: 'overflowMenu',
        icon: icons.ThreeDots,
        text: translate('reportActionContextMenu.menu'),
        isAnonymousAction: true,
        shouldPreventDefaultFocusOnPress: false,
        onPress: (event) =>
            interceptAnonymousUser(() => {
                openOverflowMenu(event as GestureResponderEvent | MouseEvent);
                setLocalShouldKeepOpen(true);
            }, true),
        sentryLabel: CONST.SENTRY_LABEL.CONTEXT_MENU.MENU,
    };

    const visibleActions: ContextMenuAction[] = [];
    if (!reportAction) {
        visibleActions.push(overflowAction);
    } else {
        if (showReplyInThread) {
            visibleActions.push(
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
            visibleActions.push(
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
            visibleActions.push(
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
            visibleActions.push(
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
            visibleActions.push(
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
            visibleActions.push(
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
            visibleActions.push(createJoinThreadAction({reportAction, originalReport, currentUserAccountID, hideAndRun, translate, bellIcon: icons.Bell}));
        }
        if (showLeaveThread) {
            visibleActions.push(createLeaveThreadAction({reportAction, originalReport, currentUserAccountID, hideAndRun, translate, exitIcon: icons.Exit}));
        }
        if (showCopyMessage) {
            visibleActions.push(
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
            visibleActions.push(createCopyLinkAction({reportAction, originalReportID: resolvedOriginalReportID, translate, linkCopyIcon: icons.LinkCopy, checkmarkIcon: icons.Checkmark}));
        }
        if (showFlagAsOffensive) {
            visibleActions.push(createFlagAsOffensiveAction({reportID: resolvedReportID, reportAction, hideAndRun, translate, flagIcon: icons.Flag}));
        }
        if (showDownload) {
            visibleActions.push(createDownloadAction({reportAction, encryptedAuthToken, download, translate, downloadIcon: icons.Download}));
        }
        if (showDebug) {
            visibleActions.push(createDebugAction({reportID: resolvedReportID, reportAction, translate, bugIcon: icons.Bug}));
        }
        if (showDelete) {
            visibleActions.push(createDeleteAction({reportID: resolvedReportID, reportAction, moneyRequestAction, hideAndRun, translate, trashcanIcon: icons.Trashcan}));
        }
        visibleActions.push(overflowAction);
    }

    const emojiData = createEmojiReactionData({
        reportID: resolvedReportID,
        reportAction,
        currentUserAccountID,
        openContextMenu: () => setLocalShouldKeepOpen(true),
        setIsEmojiPickerActive: onEmojiPickerToggle,
        hideAndRun,
    });

    const [focusedIndex, setFocusedIndex] = useArrowKeyFocusManager({
        initialFocusedIndex: -1,
        disabledIndexes: [],
        maxIndex: visibleActions.length - 1,
        isActive: shouldEnableArrowNavigation,
    });

    const hasEmoji = shouldShowEmojiReaction({reportAction});
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
                                interceptAnonymousUser(() => emojiData.toggleEmojiAndCloseMenu(emoji, existingReactions, preferredSkinTone))
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
