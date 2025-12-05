import lodashDebounce from 'lodash/debounce';
import noop from 'lodash/noop';
import React, {memo, useCallback, useEffect, useMemo, useRef, useState} from 'react';
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
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useHandleExceedMaxTaskTitleLength from '@hooks/useHandleExceedMaxTaskTitleLength';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DomUtils from '@libs/DomUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Performance from '@libs/Performance';
import {getLinkedTransactionID, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canShowReportRecipientLocalTime,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    chatIncludesChronos,
    chatIncludesConcierge,
    getParentReport,
    getReportRecipientAccountIDs,
    isChatRoom,
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
import AgentZeroProcessingRequestIndicator from '@pages/home/report/AgentZeroProcessingRequestIndicator';
import ParticipantLocalTime from '@pages/home/report/ParticipantLocalTime';
import ReportTypingIndicator from '@pages/home/report/ReportTypingIndicator';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction} from '@userActions/EmojiPickerAction';
import {addAttachmentWithComment, setIsComposerFullSize} from '@userActions/Report';
import Timing from '@userActions/Timing';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerRef, ComposerWithSuggestionsProps} from './ComposerWithSuggestions/ComposerWithSuggestions';
import SendButton from './SendButton';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';

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
    onSubmit: (newComment: string) => void;

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

    /** Whether the main composer was hidden */
    didHideComposerInput?: boolean;
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
    didHideComposerInput,
    reportTransactions,
    transactionThreadReportID,
}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE, {canBeMissing: true});
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE, {canBeMissing: true});
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT, {canBeMissing: true});
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`, {canBeMissing: true});
    const [initialModalState] = useOnyx(ONYXKEYS.MODAL, {canBeMissing: true});
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`, {canBeMissing: true});
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, {canBeMissing: true});

    const shouldFocusComposerOnScreenFocus = shouldFocusInputOnScreenFocus || !!draftComment;

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {
        canBeMissing: true,
    });
    const ancestors = useAncestors(transactionThreadReport ?? report);
    /**
     * Updates the Highlight state of the composer
     */
    const [isFocused, setIsFocused] = useState(() => {
        return shouldFocusComposerOnScreenFocus && shouldShowComposeInput && !initialModalState?.isVisible && !initialModalState?.willAlertModalBecomeVisible;
    });

    const [isFullComposerAvailable, setIsFullComposerAvailable] = useState(isComposerFullSize);

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [isCommentEmpty, setIsCommentEmpty] = useState(() => {
        return !draftComment || !!draftComment.match(CONST.REGEX.EMPTY_COMMENT);
    });

    /**
     * Updates the visibility state of the menu
     */
    const [isMenuVisible, setMenuVisibility] = useState(false);
    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

    /**
     * Updates the composer when the comment length is exceeded
     * Shows red borders and prevents the comment from being sent
     */
    const {hasExceededMaxCommentLength, validateCommentMaxLength, setHasExceededMaxCommentLength} = useHandleExceedMaxCommentLength();
    const {hasExceededMaxTaskTitleLength, validateTaskTitleMaxLength, setHasExceededMaxTitleLength} = useHandleExceedMaxTaskTitleLength();
    const [exceededMaxLength, setExceededMaxLength] = useState<number | null>(null);

    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle'] as const);

    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerRef | undefined>(undefined);
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

    const isTransactionThreadView = useMemo(() => isReportTransactionThread(report), [report]);
    const isExpensesReport = useMemo(() => reportTransactions && reportTransactions.length > 1, [reportTransactions]);

    const [reportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {
        canEvict: false,
        canBeMissing: true,
    });

    const personalDetail = useCurrentUserPersonalDetails();

    const iouAction = reportActions ? Object.values(reportActions).find((action) => isMoneyRequestAction(action)) : null;
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;

    const transactionID = useMemo(() => getTransactionID(reportID) ?? linkedTransactionID, [reportID, linkedTransactionID]);

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`, {canBeMissing: true});

    const isSingleTransactionView = useMemo(() => !!transaction && !!reportTransactions && reportTransactions.length === 1, [transaction, reportTransactions]);
    const parentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt = canUserPerformWriteAction && canEditFieldOfMoneyRequest(parentReportAction, CONST.EDIT_REQUEST_FIELD.RECEIPT) && !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;

    const hasReceipt = useMemo(() => hasReceiptTransactionUtils(transaction), [transaction]);

    const shouldDisplayDualDropZone = useMemo(() => {
        const parentReport = getParentReport(report);
        const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
        const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, isReportArchived, isRestrictedToPreferredPolicy).length;
        const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
        const isRoomOrGroupChat = isChatRoom(report) || isGroupChat(report);
        return !isRoomOrGroupChat && (canModifyReceipt || hasMoneyRequestOptions) && !isInvoiceReport(report);
    }, [shouldAddOrReplaceReceipt, report, reportParticipantIDs, policy, isReportArchived, isRestrictedToPreferredPolicy]);

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
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
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
        const clear = composerRef.current?.clear;
        if (!clear) {
            throw new Error('The composerRef.clear function is not set yet. This should never happen, and indicates a developer error.');
        }

        scheduleOnUI(clear);
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

    /**
     * Add a new comment to this chat
     */
    const submitForm = useCallback(
        (newComment: string) => {
            const newCommentTrimmed = newComment.trim();

            if (attachmentFileRef.current) {
                addAttachmentWithComment(transactionThreadReportID ?? reportID, reportID, ancestors, attachmentFileRef.current, newCommentTrimmed, personalDetail.timezone, true);
                attachmentFileRef.current = null;
            } else {
                Performance.markStart(CONST.TIMING.SEND_MESSAGE, {message: newCommentTrimmed});
                Timing.start(CONST.TIMING.SEND_MESSAGE);
                startSpan(CONST.TELEMETRY.SPAN_SEND_MESSAGE, {
                    name: 'send-message',
                    op: CONST.TELEMETRY.SPAN_SEND_MESSAGE,
                    attributes: {
                        [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
                        [CONST.TELEMETRY.ATTRIBUTE_MESSAGE_LENGTH]: newCommentTrimmed.length,
                    },
                });
                onSubmit(newCommentTrimmed);
            }
        },
        [onSubmit, ancestors, reportID, personalDetail.timezone, transactionThreadReportID],
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

    useEffect(() => {
        if (hasExceededMaxTaskTitleLength) {
            setExceededMaxLength(CONST.TITLE_CHARACTER_LIMIT);
        } else if (hasExceededMaxCommentLength) {
            setExceededMaxLength(CONST.MAX_COMMENT_LENGTH);
        } else {
            setExceededMaxLength(null);
        }
    }, [hasExceededMaxTaskTitleLength, hasExceededMaxCommentLength]);

    // We are returning a callback here as we want to invoke the method on unmount only
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(report?.reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [],
    );

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to mention other reports they are members of, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = useMemo(() => !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE, [report?.policyID]);
    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, currentUserPersonalDetails.accountID);
    const reportRecipient = personalDetails?.[reportRecipientAccountIDs[0]];
    const shouldUseFocusedColor = !isBlockedFromConcierge && isFocused;

    const hasReportRecipient = !isEmptyObject(reportRecipient);

    const isSendDisabled = isCommentEmpty || isBlockedFromConcierge || !!exceededMaxLength;

    const validateMaxLength = useCallback(
        (value: string) => {
            const taskCommentMatch = value?.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
            if (taskCommentMatch) {
                const title = taskCommentMatch?.[3] ? taskCommentMatch[3].trim().replaceAll('\n', ' ') : '';
                setHasExceededMaxCommentLength(false);
                return validateTaskTitleMaxLength(title);
            }
            setHasExceededMaxTitleLength(false);
            return validateCommentMaxLength(value, {reportID});
        },
        [setHasExceededMaxCommentLength, setHasExceededMaxTitleLength, validateTaskTitleMaxLength, validateCommentMaxLength, reportID],
    );

    const debouncedValidate = useMemo(() => lodashDebounce(validateMaxLength, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME, {leading: true}), [validateMaxLength]);

    // Note: using JS refs is not well supported in reanimated, thus we need to store the function in a shared value
    // useSharedValue on web doesn't support functions, so we need to wrap it in an object.
    const composerRefShared = useSharedValue<{
        clear: (() => void) | undefined;
    }>({clear: undefined});

    const handleSendMessage = useCallback(() => {
        if (isSendDisabled || !debouncedValidate.flush()) {
            return;
        }

        scheduleOnUI(() => {
            'worklet';

            const {clear: clearComposer} = composerRefShared.get();

            if (!clearComposer) {
                throw new Error('The composerRefShared.clear function is not set yet. This should never happen, and indicates a developer error.');
            }

            // This will cause onCleared to be triggered where we actually send the message
            clearComposer?.();
        });
    }, [isSendDisabled, debouncedValidate, composerRefShared]);

    // eslint-disable-next-line react-compiler/react-compiler
    onSubmitAction = handleSendMessage;

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
            debouncedValidate(value);
        },
        [isComposerFullSize, reportID, debouncedValidate],
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
                            !!exceededMaxLength && styles.borderColorDanger,
                        ]}
                    >
                        {PDFValidationComponent}
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
                            shouldDisableAttachmentItem={!!exceededMaxLength}
                        />
                        <ComposerWithSuggestions
                            ref={(ref) => {
                                composerRef.current = ref ?? undefined;
                                composerRefShared.set({
                                    clear: ref?.clear,
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
                            onCleared={submitForm}
                            disabled={isBlockedFromConcierge}
                            setIsCommentEmpty={setIsCommentEmpty}
                            handleSendMessage={handleSendMessage}
                            shouldShowComposeInput={shouldShowComposeInput}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            measureParentContainer={measureContainer}
                            onValueChange={onValueChange}
                            didHideComposerInput={didHideComposerInput}
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
                        <SendButton
                            isDisabled={isSendDisabled}
                            handleSendMessage={handleSendMessage}
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
                        <AgentZeroProcessingRequestIndicator reportID={reportID} />
                        <ReportTypingIndicator reportID={reportID} />
                        {!!exceededMaxLength && (
                            <ExceededCommentLength
                                maxCommentLength={exceededMaxLength}
                                isTaskTitle={hasExceededMaxTaskTitleLength}
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

ReportActionCompose.displayName = 'ReportActionCompose';

export default memo(ReportActionCompose);
export {onSubmitAction};
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
