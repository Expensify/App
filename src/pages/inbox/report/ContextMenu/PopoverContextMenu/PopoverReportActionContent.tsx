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

    const data = useReportActionContextMenuData({
        reportID,
        reportActionID,
        originalReportID,
        draftMessage: draftMessage ?? '',
        selection: selection ?? '',
        type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
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
                reportActionID: data.reportAction?.reportActionID,
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

    const currentUserAccountID = data.currentUserPersonalDetails?.accountID ?? 0;
    const {translate, disabledActionIDs} = data;

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
    if (!data.reportAction) {
        visibleActions.push(overflowAction);
    } else {
        const reportAction = data.reportAction;
        if (showReplyInThread) {
            visibleActions.push(
                createReplyInThreadAction({
                    childReport: data.childReport,
                    reportAction,
                    originalReport: data.originalReport,
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
                    reportID: data.reportID,
                    reportActions: data.reportActions,
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
                    childReport: data.childReport,
                    originalReport: data.originalReport,
                    reportAction,
                    currentUserPersonalDetails: data.currentUserPersonalDetails,
                    hideAndRun,
                    translate,
                    conciergeIcon: icons.Concierge,
                }),
            );
        }
        if (showEdit) {
            visibleActions.push(
                createEditAction({
                    reportID: data.reportID,
                    reportAction,
                    moneyRequestAction: data.moneyRequestAction,
                    draftMessage: data.draftMessage,
                    introSelected: data.introSelected,
                    hideAndRun,
                    translate,
                    pencilIcon: icons.Pencil,
                }),
            );
        }
        if (showUnhold) {
            visibleActions.push(
                createUnholdAction({
                    moneyRequestAction: data.moneyRequestAction,
                    isDelegateAccessRestricted: data.isDelegateAccessRestricted,
                    showDelegateNoAccessModal: data.showDelegateNoAccessModal,
                    hideAndRun,
                    translate,
                    stopwatchIcon: icons.Stopwatch,
                }),
            );
        }
        if (showHold) {
            visibleActions.push(
                createHoldAction({
                    moneyRequestAction: data.moneyRequestAction,
                    isDelegateAccessRestricted: data.isDelegateAccessRestricted,
                    showDelegateNoAccessModal: data.showDelegateNoAccessModal,
                    hideAndRun,
                    translate,
                    stopwatchIcon: icons.Stopwatch,
                }),
            );
        }
        if (showJoinThread) {
            visibleActions.push(createJoinThreadAction({reportAction, originalReport: data.originalReport, currentUserAccountID, hideAndRun, translate, bellIcon: icons.Bell}));
        }
        if (showLeaveThread) {
            visibleActions.push(createLeaveThreadAction({reportAction, originalReport: data.originalReport, currentUserAccountID, hideAndRun, translate, exitIcon: icons.Exit}));
        }
        if (showCopyMessage) {
            visibleActions.push(
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
                    copyIcon: icons.Copy,
                    checkmarkIcon: icons.Checkmark,
                }),
            );
        }
        if (showCopyLink) {
            visibleActions.push(createCopyLinkAction({reportAction, originalReportID: data.originalReportID, translate, linkCopyIcon: icons.LinkCopy, checkmarkIcon: icons.Checkmark}));
        }
        if (showFlagAsOffensive) {
            visibleActions.push(createFlagAsOffensiveAction({reportID: data.reportID, reportAction, hideAndRun, translate, flagIcon: icons.Flag}));
        }
        if (showDownload) {
            visibleActions.push(createDownloadAction({reportAction, encryptedAuthToken: data.encryptedAuthToken, download: data.download, translate, downloadIcon: icons.Download}));
        }
        if (showDebug) {
            visibleActions.push(createDebugAction({reportID: data.reportID, reportAction, translate, bugIcon: icons.Bug}));
        }
        if (showDelete) {
            visibleActions.push(
                createDeleteAction({reportID: data.reportID, reportAction, moneyRequestAction: data.moneyRequestAction, hideAndRun, translate, trashcanIcon: icons.Trashcan}),
            );
        }
        visibleActions.push(overflowAction);
    }

    const emojiData = createEmojiReactionData({
        reportID: data.reportID,
        reportAction: data.reportAction,
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
