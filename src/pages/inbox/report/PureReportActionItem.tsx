/* eslint-disable rulesdir/no-deep-equal-in-memo */
import {useNavigation} from '@react-navigation/native';
import {personalDetailsDisplayNameSelector} from '@selectors/PersonalDetails';
import {deepEqual} from 'fast-equals';
import mapValues from 'lodash/mapValues';
import React, {memo, useContext, useEffect, useRef, useState} from 'react';
import type {GestureResponderEvent, TextInput} from 'react-native';
import {Keyboard, View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
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
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {cleanUpMoneyRequest} from '@libs/actions/IOU/DeleteMoneyRequest';
import {isSafari} from '@libs/Browser';
import {isChronosOOOListAction} from '@libs/ChronosUtils';
import ControlSelection from '@libs/ControlSelection';
import {canUseTouchScreen, hasHoverSupport} from '@libs/DeviceCapabilities';
import type {OnyxDataWithErrors} from '@libs/ErrorUtils';
import {getLatestErrorMessageField, isReceiptError} from '@libs/ErrorUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isReportMessageAttachment} from '@libs/isReportMessageAttachment';
import type {PlatformStackNavigationProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import Permissions from '@libs/Permissions';
import {
    extractLinksFromMessageHtml,
    getOriginalMessage,
    getReportActionMessage,
    getReportActionText,
    getWhisperedTo,
    isDeletedParentAction as isDeletedParentActionUtils,
    isMessageDeleted,
    isMoneyRequestAction,
    isPendingRemove,
    isTripPreview,
    isWhisperActionTargetedToOthers,
    useTableReportViewActionRenderConditionals,
} from '@libs/ReportActionsUtils';
import {canWriteInReport, getTransactionsWithReceipts, isCompletedTaskReport, isTaskReport, shouldDisplayThreadReplies as shouldDisplayThreadRepliesUtils} from '@libs/ReportUtils';
import SelectionScraper from '@libs/SelectionScraper';
import {ReactionListContext} from '@pages/inbox/ReportScreenContext';
import AttachmentModalContext from '@pages/media/AttachmentModalScreen/AttachmentModalContext';
import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {hideEmojiPicker, isActive} from '@userActions/EmojiPickerAction';
import {expandURLPreview} from '@userActions/Report';
import {clearError} from '@userActions/Transaction';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Errors} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject, isEmptyValueObject} from '@src/types/utils/EmptyObject';
import ActionContentRouter from './actionContents/ActionContentRouter';
import {RestrictedReadOnlyContextMenuActions} from './ContextMenu/ContextMenuActions';
import MiniReportActionContextMenu from './ContextMenu/MiniReportActionContextMenu';
import type {ContextMenuAnchor} from './ContextMenu/ReportActionContextMenu';
import {hideContextMenu, hideDeleteModal, isActiveReportAction, showContextMenu} from './ContextMenu/ReportActionContextMenu';
import LinkPreviewer from './LinkPreviewer';
import ReportActionItemContentCreated from './ReportActionItemContentCreated';
import ReportActionItemFrame from './ReportActionItemFrame';
import ReportActionItemThread from './ReportActionItemThread';
import SearchActionHeader from './SearchActionHeader';
import TripSummary from './TripSummary';
import WhisperBanner from './WhisperBanner';

type PureReportActionItemProps = {
    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The transaction thread report associated with the report for this action, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

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

    /** ReportAction draft message */
    draftMessage?: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxTypes.Report;

    /** Linked transaction route error */
    linkedTransactionRouteError?: Errors;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID?: string;

    /** Original report from which the given reportAction is first created */
    originalReport?: OnyxTypes.Report;

    /** Whether the provided report is a closed expense report with no expenses */
    isClosedExpenseReportWithNoExpenses?: boolean;

    /** Whether to show border for MoneyRequestReportPreviewContent */
    shouldShowBorder?: boolean;

    /** Whether to highlight the action for a few seconds */
    shouldHighlight?: boolean;

    /** Whether the action is the "Created" action of a harvest-created expense report */
    isHarvestCreatedExpenseReport?: boolean;
};

function PureReportActionItem({
    action,
    report,
    transactionThreadReport,
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
    draftMessage,
    iouReport,
    linkedTransactionRouteError,
    originalReportID = '-1',
    originalReport,
    isClosedExpenseReportWithNoExpenses,
    shouldShowBorder,
    shouldHighlight = false,
    isHarvestCreatedExpenseReport = false,
}: PureReportActionItemProps) {
    const isConciergeGreeting = action.reportActionID === CONST.CONCIERGE_GREETING_ACTION_ID;
    const shouldDisplayContextMenuValue = shouldDisplayContextMenu && !isConciergeGreeting;
    const [actorDisplayName] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {selector: personalDetailsDisplayNameSelector(action.actorAccountID ?? CONST.DEFAULT_NUMBER_ID)});

    const {transitionActionSheetState} = ActionSheetAwareScrollView.useActionSheetAwareScrollViewActions();
    const {translate, datetimeToCalendarTime} = useLocalize();
    const {showConfirmModal} = useConfirmModal();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const reportID = report?.reportID ?? action?.reportID;
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

    const shouldRenderViewBasedOnAction = useTableReportViewActionRenderConditionals(action);

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(report?.chatReportID)}`);

    const highlightedBackgroundColorIfNeeded = isReportActionLinked || shouldHighlight ? StyleUtils.getBackgroundColorStyle(theme.messageHighlightBG) : {};

    const isDeletedParentAction = isDeletedParentActionUtils(action);
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
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        if (isSendingMoney && transactionID && reportID) {
            cleanUpMoneyRequest(transactionID, action, reportID, transactionThreadReport, report, chatReport, undefined, originalReportID, true);
            return;
        }
        if (action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && isReportActionLinked) {
            navigation.setParams({reportActionID: ''});
        }
        if (transactionID) {
            clearError(transactionID);
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

    const iouReportID = isMoneyRequestAction(action) && getOriginalMessage(action)?.IOUReportID ? getOriginalMessage(action)?.IOUReportID?.toString() : undefined;
    const isWhisper = whisperedTo.length > 0 && getTransactionsWithReceipts(iouReportID).length === 0;

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
                        onPress={() => {
                            if (!hasDraft) {
                                onPress?.();
                            }
                            if (!Keyboard.isVisible()) {
                                return;
                            }
                            Keyboard.dismiss();
                        }}
                        style={[
                            styles.textAlignLeft,
                            action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && !isDeletedParentAction ? styles.pointerEventsNone : styles.pointerEventsAuto,
                        ]}
                        onPressIn={() => shouldUseNarrowLayout && canUseTouchScreen() && ControlSelection.block()}
                        onPressOut={() => ControlSelection.unblock()}
                        onSecondaryInteraction={showPopover}
                        preventDefaultContextMenu={!isContextMenuDisabled}
                        withoutFocusOnSecondaryInteraction
                        accessibilityLabel={accessibilityLabel}
                        accessibilityHint={translate('accessibilityHints.chatMessage')}
                        accessibilityRole={isSafari() && hasHoverSupport() ? undefined : CONST.ROLE.BUTTON}
                        sentryLabel={CONST.SENTRY_LABEL.REPORT.PURE_REPORT_ACTION_ITEM}
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
                                            style={StyleUtils.getReportActionItemStyle(
                                                hovered || isWhisper || isContextMenuActive || !!isEmojiPickerActive || hasDraft || isPaymentMethodPopoverActive,
                                                !hasDraft && !!onPress,
                                            )}
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
                                                                reportID={reportID}
                                                                originalReport={originalReport}
                                                                originalReportID={originalReportID}
                                                                iouReport={iouReport}
                                                                displayAsGroup={displayAsGroup}
                                                                draftMessage={draftMessage}
                                                                isWhisper={isWhisper}
                                                                hovered={isHoveredOrActive}
                                                                isHidden={isHidden}
                                                                updateHiddenState={updateHiddenState}
                                                                isClosedExpenseReportWithNoExpenses={isClosedExpenseReportWithNoExpenses}
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

export type {PureReportActionItemProps};
export default memo(PureReportActionItem, (prevProps, nextProps) => {
    const prevParentReportAction = prevProps.parentReportAction;
    const nextParentReportAction = nextProps.parentReportAction;
    return (
        prevProps.displayAsGroup === nextProps.displayAsGroup &&
        prevProps.shouldDisplayNewMarker === nextProps.shouldDisplayNewMarker &&
        deepEqual(prevProps.action, nextProps.action) &&
        deepEqual(prevProps.report?.pendingFields, nextProps.report?.pendingFields) &&
        deepEqual(prevProps.report?.participants, nextProps.report?.participants) &&
        deepEqual(prevProps.report?.errorFields, nextProps.report?.errorFields) &&
        prevProps.report?.isDeletedParentAction === nextProps.report?.isDeletedParentAction &&
        prevProps.report?.statusNum === nextProps.report?.statusNum &&
        prevProps.report?.stateNum === nextProps.report?.stateNum &&
        prevProps.report?.parentReportID === nextProps.report?.parentReportID &&
        prevProps.report?.parentReportActionID === nextProps.report?.parentReportActionID &&
        // TaskReport's created actions render the TaskView, which updates depending on certain fields in the TaskReport
        isTaskReport(prevProps.report) === isTaskReport(nextProps.report) &&
        prevProps.action.actionName === nextProps.action.actionName &&
        prevProps.report?.reportName === nextProps.report?.reportName &&
        prevProps.report?.description === nextProps.report?.description &&
        isCompletedTaskReport(prevProps.report) === isCompletedTaskReport(nextProps.report) &&
        prevProps.report?.managerID === nextProps.report?.managerID &&
        prevProps.shouldHideThreadDividerLine === nextProps.shouldHideThreadDividerLine &&
        prevProps.report?.total === nextProps.report?.total &&
        prevProps.report?.nonReimbursableTotal === nextProps.report?.nonReimbursableTotal &&
        prevProps.report?.policyAvatar === nextProps.report?.policyAvatar &&
        prevProps.linkedReportActionID === nextProps.linkedReportActionID &&
        prevProps.shouldDisplayContextMenu === nextProps.shouldDisplayContextMenu &&
        deepEqual(prevProps.report?.fieldList, nextProps.report?.fieldList) &&
        deepEqual(prevProps.transactionThreadReport, nextProps.transactionThreadReport) &&
        deepEqual(prevParentReportAction, nextParentReportAction) &&
        prevProps.draftMessage === nextProps.draftMessage &&
        prevProps.iouReport?.reportID === nextProps.iouReport?.reportID &&
        deepEqual(prevProps.linkedTransactionRouteError, nextProps.linkedTransactionRouteError) &&
        prevProps.originalReportID === nextProps.originalReportID &&
        deepEqual(prevProps.originalReport?.participants, nextProps.originalReport?.participants) &&
        prevProps.isClosedExpenseReportWithNoExpenses === nextProps.isClosedExpenseReportWithNoExpenses &&
        prevProps.shouldHighlight === nextProps.shouldHighlight &&
        prevProps.isHarvestCreatedExpenseReport === nextProps.isHarvestCreatedExpenseReport
    );
});
