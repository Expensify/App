import noop from 'lodash/noop';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {BlurEvent, MeasureInWindowOnSuccessCallback, TextInputSelectionChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';
import type {Emoji} from '@assets/emojis/types';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ExceededCommentLength from '@components/ExceededCommentLength';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import type {Mention} from '@components/MentionSuggestions';
import OfflineIndicator from '@components/OfflineIndicator';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOriginalReportID from '@hooks/useOriginalReportID';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DomUtils from '@libs/DomUtils';
import FS from '@libs/Fullstory';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {rand64} from '@libs/NumberUtils';
import {getLinkedTransactionID, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canShowReportRecipientLocalTime,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    chatIncludesChronos,
    chatIncludesConcierge,
    getParentReport,
    getReportRecipientAccountIDs,
    isAdminRoom,
    isChatRoom,
    isConciergeChatReport,
    isGroupChat,
    isInvoiceReport,
    isReportApproved,
    isReportTransactionThread,
    isSettled,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getTransactionID, hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import ParticipantLocalTime from '@pages/inbox/report/ParticipantLocalTime';
import {useReportActionActiveEdit} from '@pages/inbox/report/ReportActionEditMessageContext';
import ReportTypingIndicator from '@pages/inbox/report/ReportTypingIndicator';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction, isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import {addAttachmentWithComment, setIsComposerFullSize} from '@userActions/Report';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerWithSuggestionsProps, ComposerWithSuggestionsRef} from './ComposerWithSuggestions';
import ExpandCollapseComposerButton from './ExpandCollapseComposerButton';
import MessageEditCancelButton from './MessageEditCancelButton';
import ReportActionComposeSendButton from './ReportActionComposeSendButton';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';
import useDebouncedCommentMaxLengthValidation from './useDebouncedCommentMaxLengthValidation';
import useEditMessage from './useEditMessage';

type SuggestionsRef = {
    resetSuggestions: () => void;
    onSelectionChange?: (event: TextInputSelectionChangeEvent) => void;
    triggerHotkeyActions: (event: KeyboardEvent) => boolean | undefined;
    updateShouldShowSuggestionMenuToFalse: (shouldShowSuggestionMenu?: boolean) => void;
    setShouldBlockSuggestionCalc: (shouldBlock: boolean) => void;
    getSuggestions: () => Mention[] | Emoji[];
    getIsSuggestionsMenuVisible: () => boolean;
};

type ReportActionComposeProps = Pick<ComposerWithSuggestionsProps, 'reportID' | 'isComposerFullSize' | 'lastReportAction'> & {
    /** A method to call when the form is submitted */
    onSubmit: (newComment: string, reportActionID?: string) => void;

    /** The report currently being looked at */
    report: OnyxEntry<OnyxTypes.Report>;

    /** The ID of the transaction thread report if there is a single transaction */
    transactionThreadReportID?: string;

    /** Report transactions */
    reportTransactions?: OnyxEntry<OnyxTypes.Transaction[]>;

    /** The type of action that's pending  */
    pendingAction?: OnyxCommon.PendingAction;

    /** A method to call when the input is focus */
    onComposerFocus?: () => void;

    /** A method to call when the input is blur */
    onComposerBlur?: () => void;

    /** Whether to hide concierge status indicators (agent zero / typing) in the side panel */
    shouldHideStatusIndicators?: boolean;
    /** Function to trigger optimistic waiting indicator for Concierge */
    kickoffWaitingIndicator?: () => void;
};

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

// eslint-disable-next-line import/no-mutable-exports
let onSubmitAction = noop;

function ReportActionCompose({
    isComposerFullSize = false,
    onSubmit,
    pendingAction,
    report,
    reportID,
    lastReportAction,
    onComposerFocus,
    onComposerBlur,
    reportTransactions,
    transactionThreadReportID,
    shouldHideStatusIndicators = false,
    kickoffWaitingIndicator,
}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isInSidePanel = useIsInSidePanel();
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [initialModalState] = useOnyx(ONYXKEYS.MODAL);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {
        canEvict: false,
    });

    const {editingReportID, editingReportActionID, editingReportAction, editingMessage} = useReportActionActiveEdit();

    const isEditingInComposer = shouldUseNarrowLayout && !!editingReportActionID;
    const effectiveDraft = shouldUseNarrowLayout ? editingMessage : draftComment;

    const reportActionEntries = useMemo(() => (reportActions ? Object.entries(reportActions) : []), [reportActions]);
    const isEditingLastReportAction = useMemo(() => editingReportActionID === reportActionEntries.at(-1)?.[0], [editingReportActionID, reportActionEntries]);

    const shouldFocusComposerOnScreenFocus = shouldFocusInputOnScreenFocus || !!draftComment;

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const ancestors = useAncestors(transactionThreadReport ?? report);
    const {scrollOffsetRef} = useContext(ActionListContext);

    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(() => {
        return shouldFocusComposerOnScreenFocus && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;
    });

    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [isCommentEmpty, setIsCommentEmpty] = useState(() => {
        return !effectiveDraft || !!effectiveDraft.match(CONST.REGEX.EMPTY_COMMENT);
    });

    /**
     * Updates the visibility state of the menu
     */
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle']);

    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerWithSuggestionsRef | null>(null);
    const reportParticipantIDs = useMemo(
        () =>
            Object.keys(report?.participants ?? {})
                .map(Number)
                .filter((accountID) => accountID !== currentUserPersonalDetails.accountID),
        [currentUserPersonalDetails.accountID, report?.participants],
    );

    const shouldShowReportRecipientLocalTime = useMemo(
        () => canShowReportRecipientLocalTime(personalDetails, report, currentUserPersonalDetails.accountID) && !isComposerFullSize,
        [personalDetails, report, currentUserPersonalDetails.accountID, isComposerFullSize],
    );

    const includesConcierge = useMemo(() => chatIncludesConcierge({participants: report?.participants}), [report?.participants]);
    const userBlockedFromConcierge = useMemo(() => isBlockedFromConciergeUserAction(blockedFromConcierge), [blockedFromConcierge]);
    const isBlockedFromConcierge = useMemo(() => includesConcierge && userBlockedFromConcierge, [includesConcierge, userBlockedFromConcierge]);
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isConciergeChat = useMemo(() => isConciergeChatReport(report), [report]);
    const shouldShowConciergeIndicator = isConciergeChat || isAdminRoom(report);

    const isTransactionThreadView = useMemo(() => isReportTransactionThread(report), [report]);
    const isExpensesReport = useMemo(() => reportTransactions && reportTransactions.length > 1, [reportTransactions]);

    const personalDetail = useCurrentUserPersonalDetails();

    const iouAction = reportActionEntries.find(([, action]) => isMoneyRequestAction(action))?.[1];
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;

    const transactionID = useMemo(() => getTransactionID(report) ?? linkedTransactionID, [report, linkedTransactionID]);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);

    const isSingleTransactionView = useMemo(() => !!transaction && !!reportTransactions && reportTransactions.length === 1, [transaction, reportTransactions]);
    const parentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT) && !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;

    const hasReceipt = useMemo(() => hasReceiptTransactionUtils(transaction), [transaction]);

    const shouldDisplayDualDropZone = useMemo(() => {
        const parentReport = getParentReport(report);
        const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
        const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
        const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
        const isRoomOrGroupChat = isChatRoom(report) || isGroupChat(report);
        return !isRoomOrGroupChat && (canModifyReceipt || hasMoneyRequestOptions) && !isInvoiceReport(report);
    }, [shouldAddOrReplaceReceipt, report, reportParticipantIDs, policy, isReportArchived, isRestrictedToPreferredPolicy, betas]);

    // Placeholder to display in the chat input.
    const inputPlaceholder = useMemo(() => {
        if (includesConcierge && userBlockedFromConcierge) {
            return translate('reportActionCompose.blockedFromConcierge');
        }
        return translate('reportActionCompose.writeSomething');
    }, [includesConcierge, translate, userBlockedFromConcierge]);

    const focus = () => {
        if (composerRef.current === null) {
            return;
        }
        composerRef.current?.focus(true);
    };

    const isKeyboardVisibleWhenShowingModalRef = useRef(false);
    const isNextModalWillOpenRef = useRef(false);

    const containerRef = useRef<View>(null);
    const measureContainer = useCallback(
        (callback: MeasureInWindowOnSuccessCallback) => {
            if (!containerRef.current) {
                return;
            }
            containerRef.current.measureInWindow(callback);
        },
        // We added isComposerFullSize in dependencies so that when this value changes, we recalculate the position of the popup
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [isComposerFullSize],
    );

    const onAddActionPressed = useCallback(() => {
        if (!willBlurTextInputOnTapOutside) {
            isKeyboardVisibleWhenShowingModalRef.current = !!composerRef.current?.isFocused();
        }
        composerRef.current?.blur();
    }, []);

    const onItemSelected = useCallback(() => {
        isKeyboardVisibleWhenShowingModalRef.current = false;
    }, []);

    const updateShouldShowSuggestionMenuToFalse = useCallback(() => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    }, []);

    const attachmentFileRef = useRef<FileObject | FileObject[] | null>(null);

    const addAttachment = useCallback((file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;

        const clearWorklet = composerRef.current?.clearWorklet;

        if (!clearWorklet) {
            throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
        }

        scheduleOnUI(clearWorklet);
    }, []);

    /**
     * Event handler to update the state after the attachment preview is closed.
     */
    const onAttachmentPreviewClose = useCallback(() => {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager.setReadyToFocus();
    }, [updateShouldShowSuggestionMenuToFalse]);

    const {debouncedCommentMaxLengthValidation, exceededMaxLength, isExceedingMaxLength, isTaskTitle} = useDebouncedCommentMaxLengthValidation({
        reportID,
        isEditing: !!editingReportAction,
    });

    const originalReportID = useOriginalReportID(editingReportID ?? undefined, editingReportAction);

    const {publishDraft, deleteDraft} = useEditMessage({
        reportID: editingReportID ?? undefined,
        originalReportID,
        reportAction: editingReportAction,
        shouldScrollToLastMessage: isEditingLastReportAction,
        isFocused,
        debouncedCommentMaxLengthValidation,
        composerRef,
    });

    /**
     * Add or edit a comment in the composer
     */
    const submitForm = useCallback(
        (draftMessage: string) => {
            const draftMessageTrimmed = draftMessage.trim();

            if (isEditingInComposer && !attachmentFileRef.current) {
                publishDraft(draftMessageTrimmed);
                return;
            }

            if (!draftMessageTrimmed && !attachmentFileRef.current) {
                return;
            }

            if (shouldShowConciergeIndicator && kickoffWaitingIndicator) {
                kickoffWaitingIndicator();
            }

            if (attachmentFileRef.current) {
                addAttachmentWithComment({
                    report: transactionThreadReport ?? report,
                    notifyReportID: reportID,
                    ancestors,
                    attachments: attachmentFileRef.current,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    text: draftMessageTrimmed,
                    timezone: personalDetail.timezone,
                    shouldPlaySound: true,
                    isInSidePanel,
                });
                attachmentFileRef.current = null;
            } else {
                // Pre-generate the reportActionID so we can correlate the Sentry send-message span with the exact message
                const optimisticReportActionID = rand64();

                // The list is inverted, so an offset near 0 means the user is at the bottom (newest messages visible).
                const isScrolledToBottom = scrollOffsetRef.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
                if (isScrolledToBottom) {
                    startSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE}_${optimisticReportActionID}`, {
                        name: 'send-message',
                        op: CONST.TELEMETRY.SPAN_SEND_MESSAGE,
                        attributes: {
                            [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
                            [CONST.TELEMETRY.ATTRIBUTE_MESSAGE_LENGTH]: draftMessageTrimmed.length,
                        },
                    });
                }
                onSubmit(draftMessageTrimmed, optimisticReportActionID);
            }
        },
        [
            isEditingInComposer,
            publishDraft,
            shouldShowConciergeIndicator,
            kickoffWaitingIndicator,
            transactionThreadReport,
            report,
            reportID,
            ancestors,
            currentUserPersonalDetails.accountID,
            personalDetail.timezone,
            isInSidePanel,
            onSubmit,
            scrollOffsetRef,
        ],
    );

    const onTriggerAttachmentPicker = useCallback(() => {
        isNextModalWillOpenRef.current = true;
        isKeyboardVisibleWhenShowingModalRef.current = true;
    }, []);

    const onBlur = useCallback(
        (event: BlurEvent) => {
            const webEvent = event as unknown as FocusEvent;
            setIsFocused(false);
            onComposerBlur?.();
            if (suggestionsRef.current) {
                suggestionsRef.current.resetSuggestions();
            }
            if (webEvent.relatedTarget && webEvent.relatedTarget === actionButtonRef.current) {
                isKeyboardVisibleWhenShowingModalRef.current = true;
            }
        },
        [onComposerBlur],
    );

    const onFocus = useCallback(() => {
        setIsFocused(true);
        onComposerFocus?.();
    }, [onComposerFocus]);

    // We are returning a callback here as we want to invoke the method on unmount only
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(report?.reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [],
    );

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to mention other reports they are members of, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = useMemo(() => !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE, [report?.policyID]);
    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails?.[reportRecipientAccountIDs[0]];
    const shouldUseFocusedColor = !isBlockedFromConcierge && isFocused;

    const hasReportRecipient = !isEmptyObject(reportRecipient);

    const isSendDisabled = !isEditingInComposer && (isBlockedFromConcierge || isExceedingMaxLength || isCommentEmpty);

    // Note: using JS refs is not well supported in reanimated, thus we need to store the function in a shared value
    // useSharedValue on web doesn't support functions, so we need to wrap it in an object.
    const composerRefShared = useSharedValue<Partial<ComposerWithSuggestionsRef>>({});

    const sendMessage = useCallback(() => {
        if (isSendDisabled || !debouncedCommentMaxLengthValidation.flush()) {
            return;
        }

        if (isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }

        if (isEditingInComposer && effectiveDraft && draftComment) {
            submitForm(effectiveDraft);
            return;
        }

        composerRef.current?.resetHeight();

        scheduleOnUI(() => {
            const {clearWorklet} = composerRefShared.get();

            if (!clearWorklet) {
                throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
            }

            clearWorklet?.();
        });
    }, [isSendDisabled, debouncedCommentMaxLengthValidation, isComposerFullSize, isEditingInComposer, effectiveDraft, draftComment, reportID, submitForm, composerRefShared]);
    onSubmitAction = sendMessage;

    const emojiPositionValues = useMemo(
        () => ({
            secondaryRowHeight: styles.chatItemComposeSecondaryRow.height,
            secondaryRowMarginTop: styles.chatItemComposeSecondaryRow.marginTop,
            secondaryRowMarginBottom: styles.chatItemComposeSecondaryRow.marginBottom,
            composeBoxMinHeight: styles.chatItemComposeBox.minHeight,
            emojiButtonHeight: styles.chatItemEmojiButton.height,
        }),
        [
            styles.chatItemComposeSecondaryRow.height,
            styles.chatItemComposeSecondaryRow.marginTop,
            styles.chatItemComposeSecondaryRow.marginBottom,
            styles.chatItemComposeBox.minHeight,
            styles.chatItemEmojiButton.height,
        ],
    );

    const emojiShiftVertical = useMemo(() => {
        const chatItemComposeSecondaryRowHeight = emojiPositionValues.secondaryRowHeight + emojiPositionValues.secondaryRowMarginTop + emojiPositionValues.secondaryRowMarginBottom;
        const reportActionComposeHeight = emojiPositionValues.composeBoxMinHeight + chatItemComposeSecondaryRowHeight;
        const emojiOffsetWithComposeBox = (emojiPositionValues.composeBoxMinHeight - emojiPositionValues.emojiButtonHeight) / 2;
        return reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;
    }, [
        emojiPositionValues.secondaryRowHeight,
        emojiPositionValues.secondaryRowMarginTop,
        emojiPositionValues.secondaryRowMarginBottom,
        emojiPositionValues.composeBoxMinHeight,
        emojiPositionValues.emojiButtonHeight,
    ]);

    const onValueChange = useCallback(
        (value: string) => {
            if (value.length === 0 && isComposerFullSize) {
                setIsComposerFullSize(reportID, false);
            }
            debouncedCommentMaxLengthValidation(value);
        },
        [isComposerFullSize, reportID, debouncedCommentMaxLengthValidation],
    );

    const {validateAttachments, onReceiptDropped, PDFValidationComponent, ErrorModal} = useAttachmentUploadValidation({
        policy,
        reportID,
        addAttachment,
        onAttachmentPreviewClose,
        exceededMaxLength,
        shouldAddOrReplaceReceipt,
        transactionID,
        report,
        newParentReport,
        currentDate,
        currentUserPersonalDetails,
        isAttachmentPreviewActive,
        setIsAttachmentPreviewActive,
    });

    const fsClass = FS.getChatFSClass(report);

    return (
        <View style={[shouldShowReportRecipientLocalTime && !isOffline && styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <OfflineWithFeedback pendingAction={pendingAction}>
                {shouldShowReportRecipientLocalTime && hasReportRecipient && <ParticipantLocalTime participant={reportRecipient} />}
            </OfflineWithFeedback>
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <OfflineWithFeedback
                    shouldDisableOpacity
                    pendingAction={pendingAction}
                    style={isComposerFullSize ? styles.chatItemFullComposeRow : {}}
                    contentContainerStyle={isComposerFullSize ? styles.flex1 : {}}
                >
                    <View
                        ref={containerRef}
                        style={[
                            shouldUseFocusedColor ? styles.chatItemComposeBoxFocusedColor : styles.chatItemComposeBoxColor,
                            styles.flexRow,
                            styles.chatItemComposeBox,
                            isComposerFullSize && styles.chatItemFullComposeBox,
                            isExceedingMaxLength && styles.borderColorDanger,
                        ]}
                    >
                        {PDFValidationComponent}
                        {isEditingInComposer ? (
                            <View
                                style={[styles.dFlex, styles.alignItemsCenter, styles.flexWrap, styles.justifyContentCenter, {paddingVertical: styles.composerSizeButton.marginHorizontal}]}
                            >
                                <ExpandCollapseComposerButton
                                    isFullComposerAvailable={isFullComposerAvailable}
                                    isComposerFullSize={isComposerFullSize}
                                    reportID={reportID}
                                    disabled={isBlockedFromConcierge}
                                    raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLayoutTriggered}
                                    setIsComposerFullSize={setIsComposerFullSize}
                                    style={[styles.flexGrow1, styles.flexShrink0]}
                                />
                                <MessageEditCancelButton onCancel={deleteDraft} />
                            </View>
                        ) : (
                            <AttachmentPickerWithMenuItems
                                onAttachmentPicked={(files) => validateAttachments({files})}
                                reportID={reportID}
                                report={report}
                                currentUserPersonalDetails={currentUserPersonalDetails}
                                reportParticipantIDs={reportParticipantIDs}
                                isFullComposerAvailable={isFullComposerAvailable}
                                isComposerFullSize={isComposerFullSize}
                                disabled={isBlockedFromConcierge}
                                setMenuVisibility={setMenuVisibility}
                                isMenuVisible={isMenuVisible}
                                onTriggerAttachmentPicker={onTriggerAttachmentPicker}
                                raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLayoutTriggered}
                                onAddActionPressed={onAddActionPressed}
                                onItemSelected={onItemSelected}
                                onCanceledAttachmentPicker={() => {
                                    if (!shouldFocusComposerOnScreenFocus) {
                                        return;
                                    }
                                    focus();
                                }}
                                actionButtonRef={actionButtonRef}
                                shouldDisableAttachmentItem={isExceedingMaxLength}
                            />
                        )}
                        <ComposerWithSuggestions
                            ref={(ref) => {
                                composerRef.current = ref;
                                composerRefShared.set({
                                    clearWorklet: ref?.clearWorklet,
                                });
                            }}
                            suggestionsRef={suggestionsRef}
                            isNextModalWillOpenRef={isNextModalWillOpenRef}
                            isScrollLikelyLayoutTriggered={isScrollLayoutTriggered}
                            raiseIsScrollLikelyLayoutTriggered={raiseIsScrollLayoutTriggered}
                            reportID={reportID}
                            policyID={report?.policyID}
                            includeChronos={chatIncludesChronos(report)}
                            isGroupPolicyReport={isGroupPolicyReport}
                            lastReportAction={lastReportAction}
                            isMenuVisible={isMenuVisible}
                            inputPlaceholder={inputPlaceholder}
                            isComposerFullSize={isComposerFullSize}
                            setIsFullComposerAvailable={setIsFullComposerAvailable}
                            onPasteFile={(files) => validateAttachments({files})}
                            onClear={submitForm}
                            disabled={isBlockedFromConcierge || isEmojiPickerVisible()}
                            setIsCommentEmpty={setIsCommentEmpty}
                            onEnterKeyPress={sendMessage}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            measureParentContainer={measureContainer}
                            onValueChange={onValueChange}
                            forwardedFSClass={fsClass}
                        />
                        {shouldDisplayDualDropZone && (
                            <DualDropZone
                                isEditing={shouldAddOrReplaceReceipt && hasReceipt}
                                onAttachmentDrop={(dragEvent) => validateAttachments({dragEvent})}
                                onReceiptDrop={onReceiptDropped}
                                shouldAcceptSingleReceipt={shouldAddOrReplaceReceipt}
                            />
                        )}
                        {!shouldDisplayDualDropZone && (
                            <DragAndDropConsumer onDrop={(dragEvent) => validateAttachments({dragEvent})}>
                                <DropZoneUI
                                    icon={icons.MessageInABottle}
                                    dropTitle={translate('dropzone.addAttachments')}
                                    dropStyles={styles.attachmentDropOverlay(true)}
                                    dropTextStyles={styles.attachmentDropText}
                                    dashedBorderStyles={[styles.dropzoneArea, styles.easeInOpacityTransition, styles.activeDropzoneDashedBorder(theme.attachmentDropBorderColorActive, true)]}
                                />
                            </DragAndDropConsumer>
                        )}
                        {canUseTouchScreen() && isMediumScreenWidth ? null : (
                            <EmojiPickerButton
                                isDisabled={isBlockedFromConcierge}
                                onModalHide={(isNavigating) => {
                                    if (isNavigating) {
                                        return;
                                    }
                                    const activeElementId = DomUtils.getActiveElement()?.id;
                                    if (activeElementId === CONST.COMPOSER.NATIVE_ID || activeElementId === CONST.EMOJI_PICKER_BUTTON_NATIVE_ID) {
                                        return;
                                    }
                                    focus();
                                }}
                                onEmojiSelected={(...args) => composerRef.current?.replaceSelectionWithText(...args)}
                                emojiPickerID={report?.reportID}
                                shiftVertical={emojiShiftVertical}
                            />
                        )}
                        <ReportActionComposeSendButton
                            isEditing={isEditingInComposer}
                            isDisabled={isSendDisabled}
                            onSend={sendMessage}
                        />
                    </View>
                    {ErrorModal}
                    <View
                        style={[
                            styles.flexRow,
                            styles.justifyContentBetween,
                            styles.alignItemsCenter,
                            (!isSmallScreenWidth || (isSmallScreenWidth && !isOffline)) && styles.chatItemComposeSecondaryRow,
                        ]}
                    >
                        {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                        {!shouldHideStatusIndicators && <ReportTypingIndicator reportID={reportID} />}
                        {!!exceededMaxLength && (
                            <ExceededCommentLength
                                maxCommentLength={exceededMaxLength}
                                isTaskTitle={isTaskTitle}
                            />
                        )}
                    </View>
                </OfflineWithFeedback>
                {!isSmallScreenWidth && (
                    <View style={[styles.mln5, styles.mrn5]}>
                        <ImportedStateIndicator />
                    </View>
                )}
            </View>
        </View>
    );
}

export default memo(ReportActionCompose);
export {onSubmitAction};
export type {SuggestionsRef, ReportActionComposeProps};
