import {Str} from 'expensify-common';
import React, {useContext, useState} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {scheduleOnUI} from 'react-native-worklets';
import DragAndDropConsumer from '@components/DragAndDrop/Consumer';
import DropZoneUI from '@components/DropZone/DropZoneUI';
import DualDropZone from '@components/DropZone/DualDropZone';
import OfflineIndicator from '@components/OfflineIndicator';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import usePreferredPolicy from '@hooks/usePreferredPolicy';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useShortMentionsList from '@hooks/useShortMentionsList';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {addComment} from '@libs/actions/Report';
import {createTaskAndNavigate, setNewOptimisticAssignee} from '@libs/actions/Task';
import ComposerFocusManager from '@libs/ComposerFocusManager';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {rand64} from '@libs/NumberUtils';
import {addDomainToShortMention} from '@libs/ParsingUtils';
import {
    getFilteredReportActionsForReportView,
    getLinkedTransactionID,
    getOneTransactionThreadReportID,
    getReportAction,
    isMoneyRequestAction,
    isSentMoneyReportAction,
} from '@libs/ReportActionsUtils';
import {
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    getParentReport,
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
import {generateAccountID} from '@libs/UserUtils';
import {useAgentZeroStatusActions} from '@pages/inbox/AgentZeroStatusContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {addAttachmentWithComment} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';
import AgentZeroAwareTypingIndicator from './AgentZeroAwareTypingIndicator';
import ComposerActionMenu from './ComposerActionMenu';
import ComposerBox from './ComposerBox';
import type {SuggestionsRef} from './ComposerContext';
import {useComposerMeta, useComposerSendState} from './ComposerContext';
import ComposerEmojiPicker from './ComposerEmojiPicker';
import ComposerExceededLength from './ComposerExceededLength';
import ComposerFooter from './ComposerFooter';
import ComposerImportedState from './ComposerImportedState';
import ComposerInput from './ComposerInput';
import ComposerLocalTime from './ComposerLocalTime';
import ComposerProvider from './ComposerProvider';
import ComposerSendButton from './ComposerSendButton';
import type {ComposerRef} from './ComposerWithSuggestions/ComposerWithSuggestions';
import useAttachmentUploadValidation from './useAttachmentUploadValidation';

type ReportActionComposeProps = {
    reportID: string;
};

function ReportActionComposeInner({reportID}: ReportActionComposeProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isOffline} = useNetwork();
    const isInSidePanel = useIsInSidePanel();
    const {kickoffWaitingIndicator} = useAgentZeroStatusActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const [currentDate] = useOnyx(ONYXKEYS.CURRENT_DATE);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const {availableLoginsList} = useShortMentionsList();
    const currentUserEmail = currentUserPersonalDetails.email ?? '';
    const {isRestrictedToPreferredPolicy} = usePreferredPolicy();

    // Context: only 2 subscriptions needed for attachment/DropZone logic
    const {exceededMaxLength} = useComposerSendState();
    const {composerRef, suggestionsRef, attachmentFileRef} = useComposerMeta();

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;

    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${report?.policyID}`);
    const [newParentReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.parentReportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);

    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportID}`);
    const reportAncestors = useAncestors(report);
    const targetReportAncestors = useAncestors(targetReport);
    const {scrollOffsetRef} = useContext(ActionListContext);

    const [isAttachmentPreviewActive, setIsAttachmentPreviewActive] = useState(false);

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

    const parentReport = getParentReport(report);
    const isSettledOrApproved = isSettled(report) || isSettled(parentReport) || isReportApproved({report}) || isReportApproved({report: parentReport});
    const hasMoneyRequestOptions = !!temporary_getMoneyRequestOptions(report, policy, reportParticipantIDs, betas, isReportArchived, isRestrictedToPreferredPolicy).length;
    const canModifyReceipt = shouldAddOrReplaceReceipt && !isSettledOrApproved;
    const isRoomOrGroupChat = isChatRoom(report) || isGroupChat(report);
    const shouldDisplayDualDropZone = !isRoomOrGroupChat && (canModifyReceipt || hasMoneyRequestOptions) && !isInvoiceReport(report);

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

    if (!report) {
        return null;
    }

    return (
        <View style={[isComposerFullSize && styles.chatItemFullComposeRow]}>
            <ComposerLocalTime reportID={reportID} />
            <View style={isComposerFullSize ? styles.flex1 : {}}>
                <ComposerBox reportID={reportID}>
                    {PDFValidationComponent}
                    <ComposerActionMenu
                        reportID={reportID}
                        onAttachmentPicked={(files) => validateAttachments({files})}
                    />
                    <ComposerInput
                        reportID={reportID}
                        submitForm={submitForm}
                        onPasteFile={(files) => validateAttachments({files})}
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
                    <ComposerEmojiPicker reportID={reportID} />
                    <ComposerSendButton />
                </ComposerBox>
                {ErrorModal}
                <ComposerFooter>
                    {!shouldUseNarrowLayout && <OfflineIndicator containerStyles={[styles.chatItemComposeSecondaryRow]} />}
                    <AgentZeroAwareTypingIndicator reportID={reportID} />
                    <ComposerExceededLength />
                </ComposerFooter>
                <ComposerImportedState />
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
