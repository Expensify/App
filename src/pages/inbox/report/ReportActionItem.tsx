import * as ActionSheetAwareScrollView from '@components/ActionSheetAwareScrollView';
import Hoverable from '@components/Hoverable';
import InlineSystemMessage from '@components/InlineSystemMessage';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
import ChronosOOOListActions from '@components/ReportActionItem/ChronosOOOListActions';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import type {ShowContextMenuActionsContextType, ShowContextMenuStateContextType} from '@components/ShowContextMenuContext';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import UnreadActionIndicator from '@components/UnreadActionIndicator';

import useConfirmModal from '@hooks/useConfirmModal';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import useReportTransactions from '@hooks/useReportTransactions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import Accessibility from '@libs/Accessibility';
import {cleanUpMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import {isSafari} from '@libs/Browser';
import {isChronosOOOListAction} from '@libs/ChronosUtils';
import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen, hasHoverSupport} from '@libs/DeviceCapabilities';
import type {OnyxDataWithErrors} from '@libs/ErrorUtils';
import {getLatestErrorMessageField, isReceiptError} from '@libs/ErrorUtils';
import {isReportMessageAttachment} from '@libs/isReportMessageAttachment';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {
    extractLinksFromMessageHtml,
    getIOUReportIDFromReportActionPreview,
    getOriginalMessage,
    getReportActionMessage,
    getReportActionText,
    getWhisperedTo,
    isCreatedTaskReportAction,
    isDeletedParentAction as isDeletedParentActionUtils,
    isMessageDeleted,
    isMoneyRequestAction,
    isPendingRemove,
    isTripPreview,
    isWhisperActionTargetedToOthers,
    useTableReportViewActionRenderConditionals,
} from '@libs/ReportActionsUtils';
import {
    canWriteInReport,
    getTransactionsWithReceipts,
    isClosedExpenseReportWithNoExpenses as isClosedExpenseReportWithNoExpensesUtils,
    shouldDisplayThreadReplies as shouldDisplayThreadRepliesUtils,
} from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import shouldBreakAccessibilityGrouping from '@libs/shouldBreakAccessibilityGrouping';

import {ReactionListContext} from '@pages/inbox/ReportScreenContext';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';

import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {hideEmojiPicker, isActive} from '@userActions/EmojiPickerAction';
import {expandURLPreview} from '@userActions/Report';
import {clearError} from '@userActions/Transaction';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject, isEmptyValueObject} from '@src/types/utils/EmptyObject';

import type {GestureResponderEvent, TextInput} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useNavigation} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {personalDetailsDisplayNameSelector} from '@selectors/PersonalDetails';
import {deepEqual} from 'fast-equals';
import mapValues from 'lodash/mapValues';
import React, {useContext, useEffect, useRef, useState} from 'react';
import {Keyboard, View} from 'react-native';

import type {ContextMenuAnchor} from './ContextMenu/ReportActionContextMenu';

import ActionContentRouter from './actionContents/ActionContentRouter';
import {RestrictedReadOnlyContextMenuActions} from './ContextMenu/ContextMenuActions';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import {hideContextMenu, hideDeleteModal, isActiveReportAction, showContextMenu} from './ContextMenu/ReportActionContextMenu';
import LinkPreviewer from './LinkPreviewer';
import {useReportActionActiveEdit} from './ReportActionEditMessageContext';
import ReportActionItemContentCreated from './ReportActionItemContentCreated';
import ReportActionItemFrame from './ReportActionItemFrame';
import ReportActionItemThread from './ReportActionItemThread';
import SearchActionHeader from './SearchActionHeader';
import TripSummary from './TripSummary';
import WhisperBanner from './WhisperBanner';

type ReportActionItemProps = {
    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report associated with the report for this action, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The chat report associated with the report for this action (report.chatReportID) */
    chatReport: OnyxEntry<OnyxTypes.Report>;

    /** Report action belonging to the report's parent */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread?: OnyxEntry<OnyxTypes.ReportAction>;

    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** Should we display the new marker on top of the comment? */
    shouldDisplayNewMarker: boolean;

    /** Flag to show, hide the thread divider line */
    shouldHideThreadDividerLine?: boolean;

    /** Report action ID that was referenced in the deeplink to report  */
    linkedReportActionID?: string;

    /** Callback to be called on onPress */
    onPress?: () => void;

    /** If this is the first visible report action */
    isFirstVisibleReportAction: boolean;

    /**
     * Is the action a thread's parent reportAction viewed from within the thread report?
     * It will be false if we're viewing the same parent report action from the report it belongs to rather than the thread.
     */
    isThreadReportParentAction?: boolean;

    /** IF the thread divider line will be used */
    shouldUseThreadDividerLine?: boolean;

    /** Whether context menu should be displayed */
    shouldDisplayContextMenu?: boolean;

    /** Linked transaction route error */
    linkedTransactionRouteError?: Errors;

    /** Whether to show border for MoneyRequestReportPreviewContent */
    shouldShowBorder?: boolean;

    /** Whether to highlight the action for a few seconds */
    shouldHighlight?: boolean;

    /** Whether the action is the "Created" action of a harvest-created expense report */
    isHarvestCreatedExpenseReport?: boolean;
};

function ReportActionItem({
    action,
    report,
    transactionThreadReport,
    chatReport,
    linkedReportActionID,
    displayAsGroup,
    parentReportAction,
    shouldDisplayNewMarker,
    shouldHideThreadDividerLine = false,
    onPress = undefined,
    isFirstVisibleReportAction = false,
    isThreadReportParentAction = false,
    shouldUseThreadDividerLine = false,
    shouldDisplayContextMenu = true,
    parentReportActionForTransactionThread,
    linkedTransactionRouteError: linkedTransactionRouteErrorProp,
    shouldShowBorder,
    shouldHighlight = false,
    isHarvestCreatedExpenseReport = false,
}: ReportActionItemProps) {
    const reportID = report?.reportID ?? action?.reportID;
    const originalReportID = useOriginalReportID(report?.reportID, action);
    const [iouReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getIOUReportIDFromReportActionPreview(action)}`, {selector: getStableReportSelector});

    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const transactionsOnIOUReport = useReportTransactions(iouReport?.reportID);
    const transactionID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUTransactionID;

    const getLinkedTransactionRouteError = (transaction: OnyxEntry<OnyxTypes.Transaction>) => {
        return linkedTransactionRouteErrorProp ?? transaction?.errorFields?.route;
    };

    const [linkedTransactionRouteError] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {selector: getLinkedTransactionRouteError});

    const {editingMessage, editingReportAction} = useReportActionActiveEdit();

    const isConciergeGreeting = action.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID;
    const shouldDisplayContextMenuValue = shouldDisplayContextMenu && !isConciergeGreeting;
    const [actorDisplayName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsDisplayNameSelector(action.actorAccountID ?? CONST.DEFAULT_NUMBER_ID)});

    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();
    const {translate, datetimeToCalendarTime} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const theme = useTheme();
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const [isContextMenuActive, setIsContextMenuActive] = useState(() => isActiveReportAction(action.reportActionID));
    const [isEmojiPickerActive, setIsEmojiPickerActive] = useState<boolean | undefined>();
    const [isPaymentMethodPopoverActive, setIsPaymentMethodPopoverActive] = useState<boolean | undefined>();
    const [isHidden, setIsHidden] = useState(false);
    const {isActiveReportAction: isActiveReactionListReportAction, hideReactionList} = useContext(ReactionListContext);
    const {updateHiddenAttachments} = useContext(AttachmentModalContext);
    const popoverAnchorRef = useRef<Exclude<ContextMenuAnchor, TextInput>>(null);
    const downloadedPreviews = useRef<string[]>([]);
    const isReportActionLinked = linkedReportActionID && action.reportActionID && linkedReportActionID === action.reportActionID;
    const [isReportActionActive, setIsReportActionActive] = useState(!!isReportActionLinked);

    const shouldBreakGrouping = shouldBreakAccessibilityGrouping();
    const isScreenReaderActive = Accessibility.useScreenReaderStatus();
    const shouldRenderViewBasedOnAction = useTableReportViewActionRenderConditionals(action);

    const highlightedBackgroundColorIfNeeded = isReportActionLinked || shouldHighlight ? StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG) : {};

    const isDeletedParentAction = isDeletedParentActionUtils(action);

    const draftMessage = editingReportAction && action && editingReportAction.reportActionID === action.reportActionID ? (editingMessage ?? undefined) : undefined;
    const hasDraft = draftMessage !== undefined;
    const isEditingInline = !shouldUseNarrowLayout && hasDraft;

    // IOUDetails only exists when we are sending money
    const isSendingMoney = isMoneyRequestAction(action) && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && getOriginalMessage(action)?.IOUDetails;

    const updateHiddenState = (isHiddenValue: boolean) => {
        setIsHidden(isHiddenValue);
        const message = Array.isArray(action.message) ? action.message?.at(-1) : action.message;
        const isAttachment = (message?.html ?? '').search(CONST.REGEX.ATTACHMENT.ATTACHMENT_REGEX) !== -1 || isReportMessageAttachment(message);
        if (!isAttachment) {
            return;
        }
        updateHiddenAttachments(action.reportActionID, isHiddenValue);
    };

    const isOnSearch = useIsOnSearch();

    const navigation = useNavigation<PlatformStackNavigationProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const dismissError = () => {
        const transactionIDToDismiss = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (isSendingMoney && transactionIDToDismiss && reportID) {
            cleanUpMoneyRequest(transactionIDToDismiss, action, reportID, transactionThreadReport, report, chatReport, undefined, originalReportID, true);
            return;
        }
        if (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && isReportActionLinked) {
            navigation.setParams({reportActionID: ''});
        }
        if (transactionIDToDismiss) {
            clearError(transactionIDToDismiss);
        }
        clearAllRelatedReportActionErrors(reportID, action, originalReportID);
    };

    const showDismissReceiptErrorModal = async () => {
        const result = await showConfirmModal({
            title: translate('iou.dismissReceiptError'),
            prompt: translate('iou.dismissReceiptErrorConfirmation'),
            confirmText: translate('common.dismiss'),
            cancelText: translate('common.cancel'),
            shouldShowCancelButton: true,
            danger: true,
        });
        if (result.action === ModalActions.CONFIRM) {
            dismissError();
        }
    };

    const onClose = () => {
        const errors = linkedTransactionRouteError ?? getLatestErrorMessageField(action as OnyxDataWithErrors);
        const errorEntries = Object.entries(errors ?? {});
        const errorMessages = mapValues(Object.fromEntries(errorEntries), (error) => error);
        const hasReceiptError = Object.values(errorMessages).some((error) => isReceiptError(error));

        if (hasReceiptError) {
            showDismissReceiptErrorModal();
        } else {
            dismissError();
        }
    };

    useEffect(
        () => () => {
            // ReportActionContextMenu, EmojiPicker and PopoverReactionList are global components,
            // we should also hide them when the current component is destroyed
            if (isActiveReportAction(action.reportActionID)) {
                hideContextMenu();
                hideDeleteModal();
            }
            if (isActive(action.reportActionID)) {
                hideEmojiPicker(true);
            }
            if (isActiveReactionListReportAction(action.reportActionID)) {
                hideReactionList();
            }
        },
        [action.reportActionID, isActiveReactionListReportAction, hideReactionList],
    );

    useEffect(() => {
        // We need to hide EmojiPicker when this is a deleted parent action
        if (!isDeletedParentAction || !isActive(action.reportActionID)) {
            return;
        }

        hideEmojiPicker(true);
    }, [isDeletedParentAction, action.reportActionID]);

    useEffect(() => {
        if (!Permissions.canUseLinkPreviews()) {
            return;
        }

        const urls = extractLinksFromMessageHtml(action);
        if (deepEqual(downloadedPreviews.current, urls) || action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return;
        }

        downloadedPreviews.current = urls;
        expandURLPreview(reportID, action.reportActionID);
    }, [action, reportID]);

    // Hide the message if it is being moderated for a higher offense, or is hidden by a moderator
    // Removed messages should not be shown anyway and should not need this flow
    const latestDecision = getReportActionMessage(action)?.moderationDecision?.decision ?? '';
    useEffect(() => {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
            return;
        }

        // Hide reveal message button and show the message if latestDecision is changed to empty
        if (!latestDecision) {
            setIsHidden(false);
            return;
        }

        if (![CONST.MODERATION.MODERATOR_DECISION_APPROVED, CONST.MODERATION.MODERATOR_DECISION_PENDING].some((item) => item === latestDecision) && !isPendingRemove(action)) {
            setIsHidden(true);
            return;
        }
        setIsHidden(false);
    }, [latestDecision, action]);

    const toggleContextMenuFromActiveReportAction = () => {
        setIsContextMenuActive(isActiveReportAction(action.reportActionID));
    };

    const handleShowContextMenu = (callback: () => void) => {
        if (!(popoverAnchorRef.current && 'measureInWindow' in popoverAnchorRef.current)) {
            return;
        }

        popoverAnchorRef.current?.measureInWindow((_fx, frameY, _width, height) => {
            transitionActionSheetState({
                type: ActionSheetAwareScrollView.Actions.OPEN_POPOVER,
                payload: {
                    popoverHeight: 0,
                    frameY,
                    height,
                },
            });

            callback();
        });
    };

    const disabledActions = !canWriteInReport(report) ? RestrictedReadOnlyContextMenuActions : [];

    const hasActionErrors = !isEmptyValueObject(action.errors);

    // Receipt upload errors should still allow the context menu so the user can access "Delete expense"
    const hasOnlyReceiptErrors = hasActionErrors && Object.values(action.errors ?? {}).every((error) => error === null || isReceiptError(error));

    const isContextMenuDisabled = hasDraft || (hasActionErrors && !hasOnlyReceiptErrors) || !shouldDisplayContextMenuValue;

    /**
     * Show the ReportActionContextMenu modal popover.
     *
     * @param [event] - A press event.
     */
    const showPopover = (event: GestureResponderEvent | MouseEvent) => {
        // Block menu on the message being Edited or if the report action item has errors
        if (isContextMenuDisabled) {
            return;
        }

        handleShowContextMenu(() => {
            setIsContextMenuActive(true);
            const selection = SelectionScraper.getCurrentSelection();
            showContextMenu({
                type: CONST.CONTEXT_MENU_TYPES.REPORT_ACTION,
                event,
                selection,
                contextMenuAnchor: popoverAnchorRef.current,
                report: {
                    reportID,
                    originalReportID,
                },
                reportAction: {
                    reportActionID: action.reportActionID,
                    isThreadReportParentAction,
                },
                callbacks: {
                    onShow: toggleContextMenuFromActiveReportAction,
                    onHide: toggleContextMenuFromActiveReportAction,
                    setIsEmojiPickerActive: setIsEmojiPickerActive as () => void,
                },
                disabledOptions: disabledActions,
            });
        });
    };

    const contextMenuStateValue: ShowContextMenuStateContextType = {
        anchor: popoverAnchorRef,
        report,
        action,
        transactionThreadReport,
        isDisabled: false,
        shouldDisplayContextMenu: shouldDisplayContextMenuValue,
        originalReportID,
    };

    const contextMenuActionsValue: ShowContextMenuActionsContextType = {
        checkIfContextMenuActive: toggleContextMenuFromActiveReportAction,
        onShowContextMenu: handleShowContextMenu,
    };

    const createdTransactionID = isMoneyRequestAction(parentReportActionForTransactionThread) ? getOriginalMessage(parentReportActionForTransactionThread)?.IOUTransactionID : undefined;

    if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && !isHarvestCreatedExpenseReport) {
        return (
            <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
                <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                    <ReportActionItemContentCreated
                        parentReportAction={parentReportAction}
                        transactionID={createdTransactionID}
                        draftMessage={draftMessage}
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    />
                </ShowContextMenuActionsContext.Provider>
            </ShowContextMenuStateContext.Provider>
        );
    }

    // Should show the created action content if:
    // - Harvest report is shown in ReportActionsList (one-transaction view)
    const shouldShowCreatedAction = action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED && !!isHarvestCreatedExpenseReport && !!parentReportActionForTransactionThread;

    if (isTripPreview(action) && isThreadReportParentAction) {
        return <TripSummary reportID={getOriginalMessage(action)?.linkedReportID} />;
    }

    if (isChronosOOOListAction(action)) {
        return (
            <ChronosOOOListActions
                action={action}
                reportID={reportID}
            />
        );
    }

    // For the `pay` IOU action on non-pay expense flow, we don't want to render anything if `isWaitingOnBankAccount` is true
    // Otherwise, we will see two system messages informing the payee needs to add a bank account or wallet
    if (isMoneyRequestAction(action) && !!report?.isWaitingOnBankAccount && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && !isSendingMoney) {
        return null;
    }

    // We currently send whispers to all report participants and hide them in the UI for users that shouldn't see them.
    // This is a temporary solution needed for comment-linking.
    // The long term solution will leverage end-to-end encryption and only targeted users will be able to decrypt.
    if (isWhisperActionTargetedToOthers(action)) {
        return null;
    }

    const whisperedTo = getWhisperedTo(action);

    const iouReportID = isMoneyRequestAction(action) ? action?.reportID : undefined;
    const isWhisper = whisperedTo.length > 0 && getTransactionsWithReceipts(iouReportID).length === 0;

    const isClosedExpenseReportWithNoExpenses = isClosedExpenseReportWithNoExpensesUtils(iouReport, transactionsOnIOUReport);
    const isEmpty = !shouldRenderViewBasedOnAction && !isClosedExpenseReportWithNoExpenses;
    const shouldDisplayThreadReplies = shouldDisplayThreadRepliesUtils(action, isThreadReportParentAction) && !isOnSearch;

    const formattedTimestamp = datetimeToCalendarTime(action.created, false);
    const plainMessage = getReportActionText(action);
    const accessibilityLabel = `${actorDisplayName ?? ''}, ${formattedTimestamp}, ${plainMessage}`;

    return (
        <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
            <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                <View>
                    {shouldShowCreatedAction && (
                        <ReportActionItemContentCreated
                            parentReportAction={parentReportAction}
                            transactionID={createdTransactionID}
                            draftMessage={draftMessage}
                            shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                        />
                    )}
                    <PressableWithSecondaryInteraction
                        ref={popoverAnchorRef}
                        accessible={shouldBreakGrouping && isScreenReaderActive && isCreatedTaskReportAction(action) ? false : undefined}
                        onPress={() => {
                            if (!hasDraft) {
                                onPress?.();
                            }
                            if (!Keyboard.isVisible()) {
                                return;
                            }
                            Keyboard.dismiss();
                        }}
                        style={[action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isDeletedParentAction ? styles.pointerEventsNone : styles.pointerEventsAuto]}
                        onPressIn={() => shouldUseNarrowLayout && canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={() => ControlSelection.unblock()}
                        onSecondaryInteraction={showPopover}
                        preventDefaultContextMenu={!isContextMenuDisabled}
                        withoutFocusOnSecondaryInteraction
                        accessibilityLabel={accessibilityLabel}
                        accessibilityHint={translate('accessibilityHints.chatMessage')}
                        accessibilityRole={isSafari() && hasHoverSupport() ? undefined : CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.REPORT_ACTION_ITEM}
                    >
                        <Hoverable
                            shouldHandleScroll
                            isDisabled={hasDraft}
                            shouldFreezeCapture={isPaymentMethodPopoverActive}
                            onHoverIn={() => {
                                setIsReportActionActive(false);
                            }}
                            onHoverOut={() => {
                                setIsReportActionActive(!!isReportActionLinked);
                            }}
                        >
                            {(hovered) => {
                                const isHoveredOrActive = !!hovered || !!isReportActionLinked || isContextMenuActive || !!isEmojiPickerActive;

                                return (
                                    <View style={highlightedBackgroundColorIfNeeded}>
                                        {shouldDisplayNewMarker && (!shouldUseThreadDividerLine || !isFirstVisibleReportAction) && (
                                            <UnreadActionIndicator reportActionID={action.reportActionID} />
                                        )}
                                        {shouldDisplayContextMenuValue && (hovered || !!isEmojiPickerActive || isContextMenuActive) && !hasDraft && !hasActionErrors && (
                                            <MiniReportActionContextMenu
                                                reportID={reportID}
                                                reportActionID={action.reportActionID}
                                                anchor={popoverAnchorRef}
                                                originalReportID={originalReportID}
                                                displayAsGroup={displayAsGroup}
                                                disabledActions={disabledActions}
                                                isVisible={hovered}
                                                isThreadReportParentAction={isThreadReportParentAction}
                                                checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                                                setIsEmojiPickerActive={setIsEmojiPickerActive}
                                            />
                                        )}
                                        <View
                                            style={[
                                                StyleUtils.getReportActionItemStyle(
                                                    hovered || isWhisper || isContextMenuActive || !!isEmojiPickerActive || hasDraft || isPaymentMethodPopoverActive,
                                                    !hasDraft && !!onPress,
                                                ),
                                                // The Pressable above renders as a role=button, whose UA text-align:center is inherited by
                                                // bare inline content (e.g. an auto-linked URL with no wrapping Text). Reset it to left here.
                                                styles.textAlignLeft,
                                            ]}
                                        >
                                            <OfflineWithFeedback
                                                onClose={onClose}
                                                dismissError={dismissError}
                                                pendingAction={
                                                    hasDraft ? undefined : (action.pendingAction ?? (action.isOptimisticAction ? CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD : undefined))
                                                }
                                                shouldHideOnDelete={!isDeletedParentAction}
                                                errors={(linkedTransactionRouteError ?? !isOnSearch) ? getLatestErrorMessageField(action as OnyxDataWithErrors) : {}}
                                                errorRowStyles={[styles.ml10, styles.mr2]}
                                                needsOffscreenAlphaCompositing={isMoneyRequestAction(action)}
                                                shouldDisableStrikeThrough
                                            >
                                                <SearchActionHeader
                                                    action={action}
                                                    report={report}
                                                    isWhisper={isWhisper}
                                                    onPress={onPress}
                                                >
                                                    {isWhisper && <WhisperBanner whisperedTo={whisperedTo} />}
                                                    {isEmpty ? (
                                                        <RenderHTML html="" />
                                                    ) : (
                                                        <ReportActionItemFrame
                                                            action={action}
                                                            report={report}
                                                            iouReport={iouReport}
                                                            displayAsGroup={displayAsGroup}
                                                            isEditingInline={isEditingInline}
                                                            isWhisper={isWhisper}
                                                            isOnSearch={isOnSearch}
                                                            hovered={isHoveredOrActive}
                                                            isActive={isReportActionActive && !isContextMenuActive}
                                                        >
                                                            <ActionContentRouter
                                                                action={action}
                                                                report={report}
                                                                chatReport={chatReport}
                                                                reportID={reportID}
                                                                originalReportID={originalReportID}
                                                                iouReport={iouReport}
                                                                displayAsGroup={displayAsGroup}
                                                                draftMessage={draftMessage}
                                                                isWhisper={isWhisper}
                                                                hovered={isHoveredOrActive}
                                                                isHidden={isHidden}
                                                                updateHiddenState={updateHiddenState}
                                                                isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses}
                                                                isTrackIntentUser={isTrackIntentUser}
                                                                isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReport}
                                                                shouldShowBorder={shouldShowBorder}
                                                                isOnSearch={isOnSearch}
                                                                setIsPaymentMethodPopoverActive={setIsPaymentMethodPopoverActive}
                                                            />
                                                            {Permissions.canUseLinkPreviews() && !isHidden && (action.linkMetadata?.length ?? 0) > 0 && (
                                                                <View style={hasDraft ? styles.chatItemReactionsDraftRight : {}}>
                                                                    <LinkPreviewer linkMetadata={action.linkMetadata?.filter((item) => !isEmptyObject(item))} />
                                                                </View>
                                                            )}
                                                            {!isOnSearch && !isMessageDeleted(action) && (
                                                                <ReportActionItemEmojiReactions
                                                                    reportAction={action}
                                                                    reportID={reportID}
                                                                    shouldBlockReactions={hasActionErrors}
                                                                    setIsEmojiPickerActive={setIsEmojiPickerActive}
                                                                    isEditingInline={isEditingInline}
                                                                />
                                                            )}
                                                            {shouldDisplayThreadReplies && (
                                                                <ReportActionItemThread
                                                                    reportAction={action}
                                                                    report={report}
                                                                    isHovered={isHoveredOrActive}
                                                                    onSecondaryInteraction={showPopover}
                                                                    isActive={isReportActionActive && !isContextMenuActive}
                                                                    isEditingInline={isEditingInline}
                                                                />
                                                            )}
                                                        </ReportActionItemFrame>
                                                    )}
                                                </SearchActionHeader>
                                            </OfflineWithFeedback>
                                        </View>
                                    </View>
                                );
                            }}
                        </Hoverable>
                        {!!action.error && (
                            <View style={styles.reportActionSystemMessageContainer}>
                                <InlineSystemMessage message={action.error} />
                            </View>
                        )}
                    </PressableWithSecondaryInteraction>
                </View>
            </ShowContextMenuActionsContext.Provider>
        </ShowContextMenuStateContext.Provider>
    );
}

export default ReportActionItem;
