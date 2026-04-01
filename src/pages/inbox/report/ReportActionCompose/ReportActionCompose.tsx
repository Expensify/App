import {useRoute} from '@react-navigation/native';
import {Str} from 'expensify-common';
import lodashDebounce from 'lodash/debounce';
import React, {useContext, useEffect, useRef, useState} from 'react';
import type {BlurEvent, MeasureInWindowOnSuccessCallback, TextInputSelectionChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useSharedValue} from 'react-native-reanimated';
import {scheduleOnUI} from 'react-native-worklets';
import type {Emoji} from '@assets/emojis/types';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import type {Mention} from '@components/MentionSuggestions';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useHandleExceedMaxCommentLength from '@hooks/useHandleExceedMaxCommentLength';
import useHandleExceedMaxTaskTitleLength from '@hooks/useHandleExceedMaxTaskTitleLength';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useThemeStyles from '@hooks/useThemeStyles';
import {addComment} from '@libs/actions/Report';
import {createTaskAndNavigate, setNewOptimisticAssignee} from '@libs/actions/Task';
import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import {canUseTouchScreen} from '@libs/DeviceCapabilities';
import DomUtils from '@libs/DomUtils';
import FS from '@libs/Fullstory';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {rand64} from '@libs/NumberUtils';
import {addDomainToShortMention} from '@libs/ParsingUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getLinkedTransactionID,
    getOneTransactionThreadReportID,
    getReportAction,
    isMoneyRequestAction,
    isSentMoneyReportAction,
} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canEditReportAction,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    chatIncludesChronos,
    chatIncludesConcierge,
    getReportOfflinePendingActionAndErrors,
    isReportTransactionThread,
} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getTransactionID} from '@libs/TransactionUtils';
import {generateAccountID} from '@libs/UserUtils';
import willBlurTextInputOnTapOutsideFunc from '@libs/willBlurTextInputOnTapOutside';
import {useAgentZeroStatusActions} from '@pages/inbox/AgentZeroStatusContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction, isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import {addAttachmentWithComment, setIsComposerFullSize} from '@userActions/Report';
import {isBlockedFromConcierge as isBlockedFromConciergeUserAction} from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerDropZone from './ComposerDropZone';
import ComposerFooter from './ComposerFooter';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
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

type ReportActionComposeProps = {
    /** The ID of the report this composer is for */
    reportID: string;
};

// We want consistent auto focus behavior on input between native and mWeb so we have some auto focus management code that will
// prevent auto focus on existing chat for mobile device
const shouldFocusInputOnScreenFocus = canFocusInputOnScreenFocus();

const willBlurTextInputOnTapOutside = willBlurTextInputOnTapOutsideFunc();

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isInSidePanel = useIsInSidePanel();
    const {kickoffWaitingIndicator} = useAgentZeroStatusActions();
    const actionButtonRef = useRef<View | HTMLDivElement | null>(null);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [blockedFromConcierge] = useOnyx(ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE);
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const {availableLoginsList} = useShortMentionsList();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = reportTransactions?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    const parentReportAction = useParentReportAction(report);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${effectiveTransactionThreadReportID}`);
    const transactionThreadReportActionsArray = transactionThreadReportActions ? Object.values(transactionThreadReportActions) : [];
    const combinedReportActions = getCombinedReportActions(filteredReportActions, effectiveTransactionThreadReportID ?? null, transactionThreadReportActionsArray);

    const route = useRoute();
    const isOnSearchMoneyRequestReport = route.name === SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT || route.name === SCREENS.RIGHT_MODAL.EXPENSE_REPORT;

    // On the search money request report page (MoneyRequestReportView), lastReportAction uses only
    // the parent report's actions — not combined with transaction thread actions. The table view
    // doesn't display transaction thread comments inline, so the last editable action should only
    // come from what's visible in the parent report. ReportScreen (inbox) uses combinedReportActions
    // because ReportActionsView merges thread comments into the visible list, and up-arrow-to-edit
    // should be able to reach those comments.
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;
    const lastReportAction = [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));

    const {reportPendingAction: pendingAction} = getReportOfflinePendingActionAndErrors(report);

    const [initialModalState] = useOnyx(ONYXKEYS.MODAL);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);

    const shouldFocusComposerOnScreenFocus = shouldFocusInputOnScreenFocus || !!draftComment;

    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportID}`);
    const reportAncestors = useAncestors(report);
    const targetReportAncestors = useAncestors(targetReport);
    const {scrollOffsetRef} = useContext(ActionListContext);

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

    const exceededMaxLength = (() => {
        if (hasExceededMaxTaskTitleLength) {
            return CONST.TITLE_CHARACTER_LIMIT;
        }
        if (hasExceededMaxCommentLength) {
            return CONST.MAX_COMMENT_LENGTH;
        }
        return null;
    })();

    const suggestionsRef = useRef<SuggestionsRef>(null);
    const composerRef = useRef<ComposerRef | null>(null);
    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const includesConcierge = chatIncludesConcierge({participants: report?.participants});
    const userBlockedFromConcierge = isBlockedFromConciergeUserAction(blockedFromConcierge);
    const isBlockedFromConcierge = includesConcierge && userBlockedFromConcierge;
    const isReportArchived = useReportIsArchived(report?.reportID);
    const isTransactionThreadView = isReportTransactionThread(report);
    const isExpensesReport = reportTransactions && reportTransactions.length > 1;

    const [rawReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {
        canEvict: false,
    });

    const iouAction = rawReportActions ? Object.values(rawReportActions).find((action) => isMoneyRequestAction(action)) : null;
    const linkedTransactionID = iouAction && !isExpensesReport ? getLinkedTransactionID(iouAction) : undefined;

    const transactionID = getTransactionID(report) ?? linkedTransactionID;

    const [transaction] = useOnyx(`${ONYXKEYS.COLLECTION.TRANSACTION}${getNonEmptyStringOnyxID(transactionID)}`);

    const isSingleTransactionView = !!transaction && !!reportTransactions && reportTransactions.length === 1;
    const effectiveParentReportAction = isSingleTransactionView ? iouAction : getReportAction(report?.parentReportID, report?.parentReportActionID);
    const canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(report, isReportArchived);
    const canEditReceipt =
        canUserPerformWriteAction &&
        canEditFieldOfMoneyRequest({reportAction: effectiveParentReportAction, fieldToEdit: CONST.EDIT_REQUEST_FIELD.RECEIPT, transaction}) &&
        !transaction?.receipt?.isTestDriveReceipt;
    const shouldAddOrReplaceReceipt = (isTransactionThreadView || isSingleTransactionView) && canEditReceipt;

    // Placeholder to display in the chat input.
    const inputPlaceholder = includesConcierge && userBlockedFromConcierge ? translate('reportActionCompose.blockedFromConcierge') : translate('reportActionCompose.writeSomething');

    const focus = () => {
        if (composerRef.current === null) {
            return;
        }
        composerRef.current?.focus(true);
    };

    const isKeyboardVisibleWhenShowingModalRef = useRef(false);
    const isNextModalWillOpenRef = useRef(false);

    const containerRef = useRef<View>(null);
    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        if (!containerRef.current) {
            return;
        }
        containerRef.current.measureInWindow(callback);
    };

    const onAddActionPressed = () => {
        if (!willBlurTextInputOnTapOutside) {
            isKeyboardVisibleWhenShowingModalRef.current = !!composerRef.current?.isFocused();
        }
        composerRef.current?.blur();
    };

    const onItemSelected = () => {
        isKeyboardVisibleWhenShowingModalRef.current = false;
    };

    const updateShouldShowSuggestionMenuToFalse = () => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    };

    const attachmentFileRef = useRef<FileObject | FileObject[] | null>(null);

    const addAttachment = (file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;

        const clearWorklet = composerRef.current?.clearWorklet;

        if (!clearWorklet) {
            throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
        }

        scheduleOnUI(clearWorklet);
    };

    /**
     * Event handler to update the state after the attachment preview is closed.
     */
    const onAttachmentPreviewClose = () => {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
        // This enables Composer refocus when the attachments modal is closed by the browser navigation
        ComposerFocusManager.setReadyToFocus();
    };

    /**
     * Add a new comment to this chat
     */
    const submitForm = (newComment: string) => {
        const newCommentTrimmed = newComment.trim();

        kickoffWaitingIndicator();

        if (attachmentFileRef.current) {
            addAttachmentWithComment({
                report: targetReport,
                notifyReportID: reportID,
                ancestors: targetReportAncestors,
                attachments: attachmentFileRef.current,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                text: newCommentTrimmed,
                timezone: currentUserPersonalDetails.timezone,
                shouldPlaySound: true,
                isInSidePanel,
            });
            attachmentFileRef.current = null;
        } else {
            const taskMatch = newCommentTrimmed.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
            if (taskMatch) {
                let taskTitle = taskMatch[3] ? taskMatch[3].trim().replaceAll('\n', ' ') : undefined;
                if (taskTitle) {
                    const mention = taskMatch[1] ? taskMatch[1].trim() : '';
                    const currentUserPrivateDomain = isEmailPublicDomain(currentUserEmail) ? '' : Str.extractEmailDomain(currentUserEmail);
                    const mentionWithDomain = addDomainToShortMention(mention, availableLoginsList, currentUserPrivateDomain) ?? mention;
                    const isValidMention = Str.isValidEmail(mentionWithDomain);

                    let assignee: OnyxEntry<OnyxTypes.PersonalDetails>;
                    let assigneeChatReport;
                    if (mentionWithDomain) {
                        if (isValidMention) {
                            assignee = Object.values(personalDetails ?? {}).find((value) => value?.login === mentionWithDomain) ?? undefined;
                            if (!Object.keys(assignee ?? {}).length) {
                                const optimisticDataForNewAssignee = setNewOptimisticAssignee(currentUserPersonalDetails.accountID, {
                                    accountID: generateAccountID(mentionWithDomain),
                                    login: mentionWithDomain,
                                });
                                assignee = optimisticDataForNewAssignee.assignee;
                                assigneeChatReport = optimisticDataForNewAssignee.assigneeReport;
                            }
                        } else {
                            taskTitle = `@${mentionWithDomain} ${taskTitle}`;
                        }
                    }
                    createTaskAndNavigate({
                        parentReport: report,
                        title: taskTitle,
                        description: '',
                        assigneeEmail: assignee?.login ?? '',
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        currentUserEmail,
                        assigneeAccountID: assignee?.accountID,
                        assigneeChatReport,
                        policyID: report?.policyID,
                        isCreatedUsingMarkdown: true,
                        quickAction,
                        ancestors: reportAncestors,
                    });
                    return;
                }
            }

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
                        [CONST.TELEMETRY.ATTRIBUTE_MESSAGE_LENGTH]: newCommentTrimmed.length,
                    },
                });
            }
            addComment({
                report: targetReport,
                notifyReportID: reportID,
                ancestors: targetReportAncestors,
                text: newCommentTrimmed,
                timezoneParam: currentUserPersonalDetails.timezone ?? CONST.DEFAULT_TIME_ZONE,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                shouldPlaySound: true,
                isInSidePanel,
                reportActionID: optimisticReportActionID,
            });
        }
    };

    const onTriggerAttachmentPicker = () => {
        isNextModalWillOpenRef.current = true;
        isKeyboardVisibleWhenShowingModalRef.current = true;
    };

    const onBlur = (event: BlurEvent) => {
        const webEvent = event as unknown as FocusEvent;
        setIsFocused(false);
        if (suggestionsRef.current) {
            suggestionsRef.current.resetSuggestions();
        }
        if (webEvent.relatedTarget && webEvent.relatedTarget === actionButtonRef.current) {
            isKeyboardVisibleWhenShowingModalRef.current = true;
        }
    };

    const onFocus = () => {
        setIsFocused(true);
    };

    // Hide emoji picker on unmount or when switching reports
    useEffect(
        () => () => {
            if (!isActiveEmojiPickerAction(report?.reportID)) {
                return;
            }
            hideEmojiPicker();
        },
        [report?.reportID],
    );

    // When we invite someone to a room they don't have the policy object, but we still want them to be able to mention other reports they are members of, so we only check if the policyID in the report is from a workspace
    const isGroupPolicyReport = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;
    const shouldUseFocusedColor = !isBlockedFromConcierge && isFocused;

    const isSendDisabled = isCommentEmpty || isBlockedFromConcierge || !!exceededMaxLength;

    const validateMaxLength = (value: string) => {
        const taskCommentMatch = value?.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
        if (taskCommentMatch) {
            const title = taskCommentMatch?.[3] ? taskCommentMatch[3].trim().replaceAll('\n', ' ') : '';
            setHasExceededMaxCommentLength(false);
            return validateTaskTitleMaxLength(title);
        }
        setHasExceededMaxTitleLength(false);
        return validateCommentMaxLength(value, {reportID});
    };

    const debouncedValidate = lodashDebounce(validateMaxLength, CONST.TIMING.COMMENT_LENGTH_DEBOUNCE_TIME, {leading: true});

    // Note: using JS refs is not well supported in reanimated, thus we need to store the function in a shared value
    // useSharedValue on web doesn't support functions, so we need to wrap it in an object.
    const composerRefShared = useSharedValue<Partial<ComposerRef>>({});

    const handleSendMessage = () => {
        if (isSendDisabled || !debouncedValidate.flush()) {
            return;
        }

        composerRef.current?.resetHeight();
        if (isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }

        scheduleOnUI(() => {
            const {clearWorklet} = composerRefShared.get();

            if (!clearWorklet) {
                throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
            }

            clearWorklet?.();
        });
    };

    const emojiShiftVertical = (() => {
        const chatItemComposeSecondaryRowHeight = styles.chatItemComposeSecondaryRow.height + styles.chatItemComposeSecondaryRow.marginTop + styles.chatItemComposeSecondaryRow.marginBottom;
        const reportActionComposeHeight = styles.chatItemComposeBox.minHeight + chatItemComposeSecondaryRowHeight;
        const emojiOffsetWithComposeBox = (styles.chatItemComposeBox.minHeight - styles.chatItemEmojiButton.height) / 2;
        return reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;
    })();

    const onValueChange = (value: string) => {
        if (value.length === 0 && isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }
        debouncedValidate(value);
    };

    const {validateAttachments, onReceiptDropped, PDFValidationComponent, ErrorModal} = useAttachmentUploadValidation({
        reportID,
        report,
        addAttachment,
        onAttachmentPreviewClose,
        exceededMaxLength,
        shouldAddOrReplaceReceipt,
        transactionID,
        isAttachmentPreviewActive,
        setIsAttachmentPreviewActive,
    });

    if (!report) {
        return null;
    }

    const fsClass = FS.getChatFSClass(report);

    return (
        <View style={[styles.chatItemComposeWithFirstRow, isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerLocalTime
                reportID={reportID}
                pendingAction={pendingAction}
                isComposerFullSize={isComposerFullSize}
            />
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
                            onEnterKeyPress={handleSendMessage}
                            shouldShowComposeInput={shouldShowComposeInput}
                            onFocus={onFocus}
                            onBlur={onBlur}
                            measureParentContainer={measureContainer}
                            onValueChange={onValueChange}
                            forwardedFSClass={fsClass}
                        />
                        <ComposerDropZone
                            reportID={reportID}
                            shouldAddOrReplaceReceipt={shouldAddOrReplaceReceipt}
                            transactionID={transactionID}
                            onAttachmentDrop={(dragEvent) => validateAttachments({dragEvent})}
                            onReceiptDrop={onReceiptDropped}
                        />
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
                    <ComposerFooter
                        reportID={reportID}
                        exceededMaxLength={exceededMaxLength}
                        hasExceededMaxTaskTitleLength={hasExceededMaxTaskTitleLength}
                        isOffline={isOffline}
                    />
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

export default ReportActionCompose;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
