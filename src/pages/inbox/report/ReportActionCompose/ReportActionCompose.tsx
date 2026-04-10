import {useRoute} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useContext, useEffect, useRef, useState} from 'react';
import type {MeasureInWindowOnSuccessCallback} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {scheduleOnUI} from 'react-native-worklets';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import EmojiPickerButton from '@components/EmojiPicker/EmojiPickerButton';
import ImportedStateIndicator from '@components/ImportedStateIndicator';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useIsScrollLikelyLayoutTriggered from '@hooks/useIsScrollLikelyLayoutTriggered';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useTheme from '@hooks/useTheme';
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
    getParentReport,
    isChatRoom,
    isGroupChat,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportApproved,
    isReportTransactionThread,
    isSettled,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getTransactionID, hasReceipt as hasReceiptTransactionUtils} from '@libs/TransactionUtils';
import {generateAccountID} from '@libs/UserUtils';
import {useAgentZeroStatusActions} from '@pages/inbox/AgentZeroStatusContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {hideEmojiPicker, isActive as isActiveEmojiPickerAction, isEmojiPickerVisible} from '@userActions/EmojiPickerAction';
import {addAttachmentWithComment} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import AttachmentPickerWithMenuItems from './AttachmentPickerWithMenuItems';
import ComposerBox from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import {useComposerActions, useComposerMeta, useComposerSendActions, useComposerSendState, useComposerState} from './ComposerContext';
import ComposerFooter from './ComposerFooter';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import ComposerWithSuggestions from './ComposerWithSuggestions';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';

type ReportActionComposeProps = {
    reportID: string;
};

/**
 * List of AI-aware placeholder translation keys for expense threads
 */
const AI_PLACEHOLDER_KEYS = ['reportActionCompose.askConciergeToUpdate', 'reportActionCompose.askConciergeToCorrect', 'reportActionCompose.askConciergeForHelp'] as const;

function getRandomPlaceholder(translate: LocalizedTranslate): string {
    const randomIndex = Math.floor(Math.random() * AI_PLACEHOLDER_KEYS.length);
    return translate(AI_PLACEHOLDER_KEYS[randomIndex]);
}

function ReportActionComposeInner({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, preferredLocale} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isMediumScreenWidth} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isInSidePanel = useIsInSidePanel();
    const {kickoffWaitingIndicator} = useAgentZeroStatusActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [shouldShowComposeInput = true] = useOnyx(ONYXKEYS.SHOULD_SHOW_COMPOSE_INPUT);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const {availableLoginsList} = useShortMentionsList();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    // --- Context hooks (state owned by ComposerProvider) ---
    const {isMenuVisible, isFullComposerAvailable} = useComposerState();
    const {exceededMaxLength, isBlockedFromConcierge} = useComposerSendState();
    const {setMenuVisibility, setIsFullComposerAvailable, setComposerRef, focus, onBlur, onFocus, onAddActionPressed, onItemSelected, onTriggerAttachmentPicker} = useComposerActions();
    const {handleSendMessage, onValueChange} = useComposerSendActions();
    const {composerRef, suggestionsRef, actionButtonRef, isNextModalWillOpenRef, attachmentFileRef} = useComposerMeta();

    // --- Report data (stays local — consumed by inline AttachmentPicker/DropZone/ComposerWithSuggestions) ---
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((transaction) => transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
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
    const actionsForLastEditable = isOnSearchMoneyRequestReport ? filteredReportActions : combinedReportActions;
    const lastReportAction = [...actionsForLastEditable, parentReportAction].find((action) => !isMoneyRequestAction(action) && canEditReportAction(action, undefined));

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [draftComment] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const shouldFocusComposerOnScreenFocus = canFocusInputOnScreenFocus() || !!draftComment;

    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportID}`);
    const reportAncestors = useAncestors(report);
    const targetReportAncestors = useAncestors(targetReport);
    const {scrollOffsetRef} = useContext(ActionListContext);

    const {isScrollLayoutTriggered, raiseIsScrollLayoutTriggered} = useIsScrollLikelyLayoutTriggered();

    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);
    const [didHideComposerInput, setDidHideComposerInput] = useState(!shouldShowComposeInput);

    const icons = useMemoizedLazyExpensifyIcons(['MessageInABottle']);

    const reportParticipantIDs = Object.keys(report?.participants ?? {})
        .map(Number)
        .filter((accountID) => accountID !== currentUserPersonalDetails.accountID);

    const isReportArchived = useReportIsArchived(report?.reportID);
    const isTransactionThreadView = isReportTransactionThread(report);
    const isExpensesReport = reportTransactions && reportTransactions.length > 1;

    const [rawReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report?.reportID}`, {canEvict: false});
    const iouAction = rawReportActions ? (Object.values(rawReportActions).find((action) => isMoneyRequestAction(action)) as OnyxTypes.ReportAction | undefined) : undefined;
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
    const hasReceipt = hasReceiptTransactionUtils(transaction);

    const shouldDisplayDualDropZone = (() => {
        const parentReport = getParentReport(report);
        const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
        const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
        const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
        const isRoomOrGroupChat = isChatRoom(report) || isGroupChat(report);
        return !isRoomOrGroupChat && (canModifyReceipt || hasMoneyRequestOptions) && !isInvoiceReport(report);
    })();

    const isExpenseRelatedReport = isTransactionThreadView || isMoneyRequestReport(report);
    const isEnglishLocale = (preferredLocale ?? CONST.LOCALES.DEFAULT) === CONST.LOCALES.EN;
    const isGroupPolicyReport = !!report?.policyID && report.policyID !== CONST.POLICY.ID_FAKE;

    const inputPlaceholder = (() => {
        if (isBlockedFromConcierge) {
            return translate('reportActionCompose.blockedFromConcierge');
        }
        if (isExpenseRelatedReport && canUserPerformWriteAction && isEnglishLocale) {
            return getRandomPlaceholder(translate);
        }
        return translate('reportActionCompose.writeSomething');
    })();

    const containerRef = useRef<View>(null);
    const measureContainer = (callback: MeasureInWindowOnSuccessCallback) => {
        containerRef.current?.measureInWindow(callback);
    };

    const updateShouldShowSuggestionMenuToFalse = () => {
        if (!suggestionsRef.current) {
            return;
        }
        suggestionsRef.current.updateShouldShowSuggestionMenuToFalse(false);
    };

    const addAttachment = (file: FileObject | FileObject[]) => {
        attachmentFileRef.current = file;
        const clearWorklet = composerRef.current?.clearWorklet;
        if (!clearWorklet) {
            throw new Error('The composerRef.clearWorklet function is not set yet. This should never happen, and indicates a developer error.');
        }
        scheduleOnUI(clearWorklet);
    };

    const onAttachmentPreviewClose = () => {
        updateShouldShowSuggestionMenuToFalse();
        setIsAttachmentPreviewActive(false);
        ComposerFocusManager.setReadyToFocus();
    };

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
            return;
        }

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

        const optimisticReportActionID = rand64();
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
    };

    const chatItemComposeSecondaryRowHeight = styles.chatItemComposeSecondaryRow.height + styles.chatItemComposeSecondaryRow.marginTop + styles.chatItemComposeSecondaryRow.marginBottom;
    const reportActionComposeHeight = styles.chatItemComposeBox.minHeight + chatItemComposeSecondaryRowHeight;
    const emojiOffsetWithComposeBox = (styles.chatItemComposeBox.minHeight - styles.chatItemEmojiButton.height) / 2;
    const emojiShiftVertical = reportActionComposeHeight - emojiOffsetWithComposeBox - CONST.MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM;

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

    useEffect(() => {
        if (didHideComposerInput || shouldShowComposeInput) {
            return;
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDidHideComposerInput(true);
    }, [shouldShowComposeInput, didHideComposerInput]);

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

    if (!report) {
        return null;
    }

    const fsClass = FS.getChatFSClass(report);

    return (
        <View style={[isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerLocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ComposerBox reportID={reportID}>
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
                        ref={setComposerRef}
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
                        setIsCommentEmpty={() => {}}
                        onEnterKeyPress={handleSendMessage}
                        shouldShowComposeInput={shouldShowComposeInput}
                        onFocus={onFocus}
                        onBlur={onBlur}
                        measureParentContainer={measureContainer}
                        onValueChange={onValueChange}
                        didHideComposerInput={didHideComposerInput}
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
                    <ComposerSendButton />
                </ComposerBox>
                {ErrorModal}
                <ComposerFooter reportID={reportID} />
                {!isSmallScreenWidth && (
                    <View style={[styles.mln5, styles.mrn5]}>
                        <ImportedStateIndicator />
                    </View>
                )}
            </View>
        </View>
    );
}

function ReportActionCompose({reportID}: ReportActionComposeProps) {
    return (
        <ComposerProvider reportID={reportID}>
            <ReportActionComposeInner reportID={reportID} />
        </ComposerProvider>
    );
}

export default ReportActionCompose;
export type {SuggestionsRef, ComposerRef, ReportActionComposeProps};
