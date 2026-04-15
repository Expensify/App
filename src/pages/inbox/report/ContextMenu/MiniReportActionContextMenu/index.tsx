import {Portal} from '@gorhom/portal';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import {StyleSheet, View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {GestureResponderEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Hoverable from '@components/Hoverable';
import MiniContextMenuItem from '@components/MiniContextMenuItem';
import MiniQuickEmojiReactions from '@components/Reactions/MiniQuickEmojiReactions';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import interceptAnonymousUser from '@libs/interceptAnonymousUser';
import {ACTION_IDS} from '@pages/inbox/report/ContextMenu/actions/actionConfig';
import {shouldShowCopyLinkAction} from '@pages/inbox/report/ContextMenu/actions/CopyLinkAction/copyLinkAction';
import MiniCopyLinkItem from '@pages/inbox/report/ContextMenu/actions/CopyLinkAction/MiniCopyLinkItem';
import {shouldShowCopyMessageAction} from '@pages/inbox/report/ContextMenu/actions/CopyMessageAction/copyMessageAction';
import MiniCopyMessageItem from '@pages/inbox/report/ContextMenu/actions/CopyMessageAction/MiniCopyMessageItem';
import {shouldShowDeleteAction} from '@pages/inbox/report/ContextMenu/actions/DeleteAction/deleteAction';
import MiniDeleteItem from '@pages/inbox/report/ContextMenu/actions/DeleteAction/MiniDeleteItem';
import {shouldShowDownloadAction} from '@pages/inbox/report/ContextMenu/actions/DownloadAction/downloadAction';
import MiniDownloadItem from '@pages/inbox/report/ContextMenu/actions/DownloadAction/MiniDownloadItem';
import {shouldShowEditAction} from '@pages/inbox/report/ContextMenu/actions/EditAction/editAction';
import MiniEditItem from '@pages/inbox/report/ContextMenu/actions/EditAction/MiniEditItem';
import createEmojiReactionData, {shouldShowEmojiReaction} from '@pages/inbox/report/ContextMenu/actions/emojiReactionAction';
import {shouldShowExplainAction} from '@pages/inbox/report/ContextMenu/actions/ExplainAction/explainAction';
import MiniExplainItem from '@pages/inbox/report/ContextMenu/actions/ExplainAction/MiniExplainItem';
import {shouldShowFlagAsOffensiveAction} from '@pages/inbox/report/ContextMenu/actions/FlagAsOffensiveAction/flagAsOffensiveAction';
import MiniFlagAsOffensiveItem from '@pages/inbox/report/ContextMenu/actions/FlagAsOffensiveAction/MiniFlagAsOffensiveItem';
import {shouldShowHoldAction} from '@pages/inbox/report/ContextMenu/actions/HoldAction/holdAction';
import MiniHoldItem from '@pages/inbox/report/ContextMenu/actions/HoldAction/MiniHoldItem';
import {shouldShowJoinThreadAction} from '@pages/inbox/report/ContextMenu/actions/JoinThreadAction/joinThreadAction';
import MiniJoinThreadItem from '@pages/inbox/report/ContextMenu/actions/JoinThreadAction/MiniJoinThreadItem';
import {shouldShowLeaveThreadAction} from '@pages/inbox/report/ContextMenu/actions/LeaveThreadAction/leaveThreadAction';
import MiniLeaveThreadItem from '@pages/inbox/report/ContextMenu/actions/LeaveThreadAction/MiniLeaveThreadItem';
import {shouldShowMarkAsUnreadForReportAction} from '@pages/inbox/report/ContextMenu/actions/MarkAsUnreadAction/markAsUnreadAction';
import MiniMarkAsUnreadItem from '@pages/inbox/report/ContextMenu/actions/MarkAsUnreadAction/MiniMarkAsUnreadItem';
import MiniReplyInThreadItem from '@pages/inbox/report/ContextMenu/actions/ReplyInThreadAction/MiniReplyInThreadItem';
import {shouldShowReplyInThreadAction} from '@pages/inbox/report/ContextMenu/actions/ReplyInThreadAction/replyInThreadAction';
import MiniUnholdItem from '@pages/inbox/report/ContextMenu/actions/UnholdAction/MiniUnholdItem';
import {shouldShowUnholdAction} from '@pages/inbox/report/ContextMenu/actions/UnholdAction/unholdAction';
import {useMiniContextMenuActions, useMiniContextMenuState} from '@pages/inbox/report/ContextMenu/MiniContextMenuProvider';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import {showContextMenu} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import useReportActionContextMenuData from '@pages/inbox/report/ContextMenu/useReportActionContextMenuData';
import CONST from '@src/CONST';
import type {BankAccountList} from '@src/types/onyx';

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
    const {translate} = useLocalize();
    ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();

    const overflowIcons = useMemoizedLazyExpensifyIcons(['ThreeDots'] as const);
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
        if (!isVisible) {
            return;
        }
        const onScroll = () => {
            release();
            hideMiniContextMenu();
        };
        window.addEventListener('scroll', onScroll, true);
        return () => {
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [isVisible, release, hideMiniContextMenu]);

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
        bankAccountList,
        card,
        conciergeReportID,
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
        isSelfTourViewed,
        betas,
        movedFromReport,
        movedToReport,
        harvestReport,
        disabledActionIDs,
        showDelegateNoAccessModal,
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
        hideMiniContextMenu();
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

    const isDisabledAction = (id: string) => disabledActionIDs.has(id);

    const showReplyInThread =
        !isDisabledAction(ACTION_IDS.REPLY_IN_THREAD) &&
        shouldShowReplyInThreadAction({
            reportAction,
            reportID: resolvedReportID,
            isThreadReportParentAction,
            isArchivedRoom,
        });
    const showMarkAsUnread = !isDisabledAction(ACTION_IDS.MARK_AS_UNREAD) && shouldShowMarkAsUnreadForReportAction({reportAction});
    const showExplain = !isDisabledAction(ACTION_IDS.EXPLAIN) && shouldShowExplainAction({reportAction, isArchivedRoom});
    const showEdit = !isDisabledAction(ACTION_IDS.EDIT) && shouldShowEditAction({reportAction, isArchivedRoom, isChronosReport, moneyRequestAction, iouTransaction});
    const showUnhold =
        !isDisabledAction(ACTION_IDS.UNHOLD) &&
        shouldShowUnholdAction({
            moneyRequestReport,
            moneyRequestAction,
            moneyRequestPolicy,
            areHoldRequirementsMet,
            iouTransaction,
            currentUserAccountID,
        });
    const showHold =
        !isDisabledAction(ACTION_IDS.HOLD) &&
        shouldShowHoldAction({
            moneyRequestReport,
            moneyRequestAction,
            moneyRequestPolicy,
            areHoldRequirementsMet,
            iouTransaction,
            currentUserAccountID,
        });
    const showJoinThread =
        !isDisabledAction(ACTION_IDS.JOIN_THREAD) &&
        shouldShowJoinThreadAction({
            reportAction,
            isArchivedRoom,
            isThreadReportParentAction,
            isHarvestReport,
        });
    const showLeaveThread =
        !isDisabledAction(ACTION_IDS.LEAVE_THREAD) &&
        shouldShowLeaveThreadAction({
            reportAction,
            isArchivedRoom,
            isThreadReportParentAction,
            isHarvestReport,
        });
    const showCopyMessage = !isDisabledAction(ACTION_IDS.COPY_MESSAGE) && shouldShowCopyMessageAction({reportAction});
    const showCopyLink = !isDisabledAction(ACTION_IDS.COPY_LINK) && shouldShowCopyLinkAction({reportAction, menuTarget: resolvedAnchor});
    const showFlagAsOffensive =
        !isDisabledAction(ACTION_IDS.FLAG_AS_OFFENSIVE) && shouldShowFlagAsOffensiveAction({reportAction, isArchivedRoom, isChronosReport, reportID: resolvedReportID});
    const showDownload = !isDisabledAction(ACTION_IDS.DOWNLOAD) && shouldShowDownloadAction({reportAction, isOffline});
    const showDelete =
        !isDisabledAction(ACTION_IDS.DELETE) &&
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

    const allVisibleItems: React.ReactElement[] = [];
    if (reportAction) {
        if (showReplyInThread) {
            allVisibleItems.push(
                <MiniReplyInThreadItem
                    key="replyInThread"
                    childReport={childReport}
                    reportAction={reportAction}
                    originalReport={originalReport}
                    currentUserAccountID={currentUserAccountID}
                    introSelected={introSelected}
                    betas={betas}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showMarkAsUnread) {
            allVisibleItems.push(
                <MiniMarkAsUnreadItem
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
            allVisibleItems.push(
                <MiniExplainItem
                    key="explain"
                    childReport={childReport}
                    originalReport={originalReport}
                    reportAction={reportAction}
                    currentUserPersonalDetails={currentUserPersonalDetails}
                    introSelected={introSelected}
                    betas={betas}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showEdit) {
            allVisibleItems.push(
                <MiniEditItem
                    key="edit"
                    reportID={resolvedReportID}
                    reportAction={reportAction}
                    moneyRequestAction={moneyRequestAction}
                    draftMessage={resolvedDraftMessage}
                    introSelected={introSelected}
                    betas={betas}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showUnhold) {
            allVisibleItems.push(
                <MiniUnholdItem
                    key="unhold"
                    moneyRequestAction={moneyRequestAction}
                    iouTransaction={iouTransaction}
                    isOffline={isOffline}
                    isDelegateAccessRestricted={isDelegateAccessRestricted}
                    showDelegateNoAccessModal={showDelegateNoAccessModal}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showHold) {
            allVisibleItems.push(
                <MiniHoldItem
                    key="hold"
                    moneyRequestAction={moneyRequestAction}
                    iouTransaction={iouTransaction}
                    isOffline={isOffline}
                    isDelegateAccessRestricted={isDelegateAccessRestricted}
                    showDelegateNoAccessModal={showDelegateNoAccessModal}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showJoinThread) {
            allVisibleItems.push(
                <MiniJoinThreadItem
                    key="joinThread"
                    reportAction={reportAction}
                    originalReport={originalReport}
                    currentUserAccountID={currentUserAccountID}
                    introSelected={introSelected}
                    isSelfTourViewed={isSelfTourViewed}
                    betas={betas}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showLeaveThread) {
            allVisibleItems.push(
                <MiniLeaveThreadItem
                    key="leaveThread"
                    reportAction={reportAction}
                    originalReport={originalReport}
                    currentUserAccountID={currentUserAccountID}
                    introSelected={introSelected}
                    isSelfTourViewed={isSelfTourViewed}
                    betas={betas}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showCopyMessage) {
            allVisibleItems.push(
                <MiniCopyMessageItem
                    key="copyMessage"
                    reportAction={reportAction}
                    transaction={transaction}
                    selection={resolvedSelection}
                    report={report}
                    conciergeReportID={conciergeReportID}
                    bankAccountList={bankAccountList as OnyxEntry<BankAccountList>}
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
            allVisibleItems.push(
                <MiniCopyLinkItem
                    key="copyLink"
                    reportAction={reportAction}
                    originalReportID={resolvedOriginalReportID}
                />,
            );
        }
        if (showFlagAsOffensive) {
            allVisibleItems.push(
                <MiniFlagAsOffensiveItem
                    key="flagAsOffensive"
                    originalReportID={resolvedOriginalReportID}
                    reportAction={reportAction}
                    hideAndRun={hideAndRun}
                />,
            );
        }
        if (showDownload) {
            allVisibleItems.push(
                <MiniDownloadItem
                    key="download"
                    reportAction={reportAction}
                    encryptedAuthToken={encryptedAuthToken}
                />,
            );
        }
        if (showDelete) {
            allVisibleItems.push(
                <MiniDeleteItem
                    key="delete"
                    reportID={resolvedReportID}
                    reportAction={reportAction}
                    moneyRequestAction={moneyRequestAction}
                    hideAndRun={hideAndRun}
                />,
            );
        }
    }

    const needsOverflow = allVisibleItems.length > CONST.MINI_CONTEXT_MENU_MAX_ITEMS;
    const displayedItems = needsOverflow ? allVisibleItems.slice(0, CONST.MINI_CONTEXT_MENU_MAX_ITEMS - 1) : allVisibleItems;

    const emojiData = createEmojiReactionData({
        reportID: resolvedReportID,
        reportAction,
        currentUserAccountID,
        openContextMenu: () => keepOpen(),
        setIsEmojiPickerActive,
        hideAndRun,
    });

    const hasEmoji = shouldShowEmojiReaction({reportAction}) && !!emojiData.reportAction && !!emojiData.reportActionID;

    if (!isVisible || !rowMeasurements) {
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
                <Hoverable
                    onHoverIn={() => keepOpen()}
                    onHoverOut={() => {
                        release();
                        hideMiniContextMenu();
                    }}
                >
                    <View
                        style={StyleUtils.getMiniReportActionContextMenuWrapperStyle(position, isVisible)}
                        pointerEvents={isVisible ? 'auto' : 'none'}
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
                            {displayedItems}
                            {needsOverflow && (
                                <MiniContextMenuItem
                                    ref={threeDotRef}
                                    tooltipText={translate('reportActionContextMenu.menu')}
                                    icon={overflowIcons.ThreeDots}
                                    onPress={() =>
                                        interceptAnonymousUser(() => {
                                            openOverflowMenu(new MouseEvent('click'), threeDotRef);
                                            keepOpen();
                                        }, true)
                                    }
                                    isDelayButtonStateComplete={false}
                                    shouldPreventDefaultFocusOnPress={false}
                                    sentryLabel={CONST.SENTRY_LABEL.CONTEXT_MENU.MENU}
                                />
                            )}
                        </View>
                    </View>
                </Hoverable>
            </View>
        </Portal>
    );
}

export default MiniReportActionContextMenu;
