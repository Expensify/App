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
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {ACTION_IDS} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {PopoverCopyLinkItem, shouldShowCopyLinkAction} from '@pages/inbox/report/ContextMenu/actions/copyLinkAction';
import {PopoverCopyMessageItem, shouldShowCopyMessageAction} from '@pages/inbox/report/ContextMenu/actions/copyMessageAction';
import {PopoverDebugItem, shouldShowDebugAction} from '@pages/inbox/report/ContextMenu/actions/debugAction';
import {PopoverDeleteItem, shouldShowDeleteAction} from '@pages/inbox/report/ContextMenu/actions/deleteAction';
import {PopoverDownloadItem, shouldShowDownloadAction} from '@pages/inbox/report/ContextMenu/actions/downloadAction';
import {PopoverEditItem, shouldShowEditAction} from '@pages/inbox/report/ContextMenu/actions/editAction';
import createEmojiReactionData, {shouldShowEmojiReaction} from '@pages/inbox/report/ContextMenu/actions/emojiReactionAction';
import {PopoverExplainItem, shouldShowExplainAction} from '@pages/inbox/report/ContextMenu/actions/explainAction';
import {PopoverFlagAsOffensiveItem, shouldShowFlagAsOffensiveAction} from '@pages/inbox/report/ContextMenu/actions/flagAsOffensiveAction';
import {PopoverHoldItem, shouldShowHoldAction} from '@pages/inbox/report/ContextMenu/actions/holdAction';
import {PopoverJoinThreadItem, shouldShowJoinThreadAction} from '@pages/inbox/report/ContextMenu/actions/joinThreadAction';
import {PopoverLeaveThreadItem, shouldShowLeaveThreadAction} from '@pages/inbox/report/ContextMenu/actions/leaveThreadAction';
import {PopoverMarkAsUnreadItem, shouldShowMarkAsUnreadForReportAction} from '@pages/inbox/report/ContextMenu/actions/markAsUnreadAction';
import {PopoverReplyInThreadItem, shouldShowReplyInThreadAction} from '@pages/inbox/report/ContextMenu/actions/replyInThreadAction';
import {PopoverUnholdItem, shouldShowUnholdAction} from '@pages/inbox/report/ContextMenu/actions/unholdAction';
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
    const {translate} = useLocalize();
    const overflowIcons = useMemoizedLazyExpensifyIcons(['ThreeDots'] as const);

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

    const visibleItems: React.ReactElement[] = [];
    if (!reportAction) {
        visibleItems.push(
            <FocusableMenuItem
                key="overflow"
                title={translate('reportActionContextMenu.menu')}
                icon={overflowIcons.ThreeDots}
                onPress={(event) =>
                    interceptAnonymousUser(() => {
                        openOverflowMenu(event as GestureResponderEvent | MouseEvent);
                        setLocalShouldKeepOpen(true);
                    }, true)
                }
                isAnonymousAction
                wrapperStyle={[styles.pr8]}
                style={StyleUtils.getContextMenuItemStyles(windowWidth)}
                interactive
                sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MENU}
            />,
        );
    } else {
        if (showReplyInThread) {
            visibleItems.push(
                <PopoverReplyInThreadItem
                    key="replyInThread"
                    childReport={childReport}
                    reportAction={reportAction}
                    originalReport={originalReport}
                    currentUserAccountID={currentUserAccountID}
                    introSelected={introSelected}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showMarkAsUnread) {
            visibleItems.push(
                <PopoverMarkAsUnreadItem
                    key="markAsUnread"
                    reportID={resolvedReportID}
                    reportActions={reportActionsMap}
                    reportAction={reportAction}
                    currentUserAccountID={currentUserAccountID}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showExplain) {
            visibleItems.push(
                <PopoverExplainItem
                    key="explain"
                    childReport={childReport}
                    originalReport={originalReport}
                    reportAction={reportAction}
                    currentUserPersonalDetails={currentUserPersonalDetails}
                    introSelected={introSelected}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showEdit) {
            visibleItems.push(
                <PopoverEditItem
                    key="edit"
                    reportID={resolvedReportID}
                    reportAction={reportAction}
                    moneyRequestAction={moneyRequestAction}
                    draftMessage={resolvedDraftMessage}
                    introSelected={introSelected}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showUnhold) {
            visibleItems.push(
                <PopoverUnholdItem
                    key="unhold"
                    moneyRequestAction={moneyRequestAction}
                    isDelegateAccessRestricted={isDelegateAccessRestricted}
                    showDelegateNoAccessModal={showDelegateNoAccessModal}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showHold) {
            visibleItems.push(
                <PopoverHoldItem
                    key="hold"
                    moneyRequestAction={moneyRequestAction}
                    isDelegateAccessRestricted={isDelegateAccessRestricted}
                    showDelegateNoAccessModal={showDelegateNoAccessModal}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showJoinThread) {
            visibleItems.push(
                <PopoverJoinThreadItem
                    key="joinThread"
                    reportAction={reportAction}
                    originalReport={originalReport}
                    currentUserAccountID={currentUserAccountID}
                    introSelected={introSelected}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showLeaveThread) {
            visibleItems.push(
                <PopoverLeaveThreadItem
                    key="leaveThread"
                    reportAction={reportAction}
                    originalReport={originalReport}
                    currentUserAccountID={currentUserAccountID}
                    introSelected={introSelected}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showCopyMessage) {
            visibleItems.push(
                <PopoverCopyMessageItem
                    key="copyMessage"
                    reportAction={reportAction}
                    transaction={transaction}
                    selection={resolvedSelection}
                    report={report}
                    card={card}
                    originalReport={originalReport}
                    isHarvestReport={isHarvestReport}
                    isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                    movedFromReport={movedFromReport}
                    movedToReport={movedToReport}
                    childReport={childReport}
                    policy={policy}
                    getLocalDateFromDatetime={getLocalDateFromDatetime}
                    policyTags={policyTags}
                    harvestReport={harvestReport}
                    currentUserPersonalDetails={currentUserPersonalDetails}
                />,
            );
        }
        if (showCopyLink) {
            visibleItems.push(
                <PopoverCopyLinkItem
                    key="copyLink"
                    reportAction={reportAction}
                    originalReportID={resolvedOriginalReportID}
                />,
            );
        }
        if (showFlagAsOffensive) {
            visibleItems.push(
                <PopoverFlagAsOffensiveItem
                    key="flagAsOffensive"
                    reportID={resolvedReportID}
                    reportAction={reportAction}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showDownload) {
            visibleItems.push(
                <PopoverDownloadItem
                    key="download"
                    reportAction={reportAction}
                    encryptedAuthToken={encryptedAuthToken}
                    download={download}
                />,
            );
        }
        if (showDebug) {
            visibleItems.push(
                <PopoverDebugItem
                    key="debug"
                    reportID={resolvedReportID}
                    reportAction={reportAction}
                />,
            );
        }
        if (showDelete) {
            visibleItems.push(
                <PopoverDeleteItem
                    key="delete"
                    reportID={resolvedReportID}
                    reportAction={reportAction}
                    moneyRequestAction={moneyRequestAction}
                    hideAndRun={hideAndRun}
                />,
            );
        }
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
        maxIndex: visibleItems.length - 1,
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
                    {visibleItems.map((item, i) =>
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        React.cloneElement(item as React.ReactElement<any>, {
                            isFocused: focusedIndex === i,
                            onFocus: () => setFocusedIndex(i),
                            onBlur: () => (i === visibleItems.length - 1 || i === 1) && setFocusedIndex(-1),
                        }),
                    )}
                </View>
            </FocusTrapForModal>
        </View>
    );
}

export default PopoverReportActionContent;
