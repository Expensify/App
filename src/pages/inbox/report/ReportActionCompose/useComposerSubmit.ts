import {Str} from 'expensify-common';
import {useContext} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useShortMentionsList from '@hooks/useShortMentionsList';
import {addAttachmentWithComment, addComment} from '@libs/actions/Report';
import {createTaskAndNavigate, setNewOptimisticAssignee} from '@libs/actions/Task';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {rand64} from '@libs/NumberUtils';
import {addDomainToShortMention} from '@libs/ParsingUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {generateAccountID} from '@libs/UserUtils';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {setIsComposerFullSize} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {useComposerActions, useComposerEditActions, useComposerEditState, useComposerMeta, useComposerSendState, useComposerText} from './ComposerContext';
import useSidePanelContext from './useSidePanelContext';

function useComposerSubmit(reportID: string) {
    const {isOffline} = useNetwork();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const {availableLoginsList} = useShortMentionsList();
    const isInSidePanel = useIsInSidePanel();
    const sidePanelContext = useSidePanelContext(reportID);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const delegateAccountID = useDelegateAccountID();

    const {composerRef, attachmentFileRef} = useComposerMeta();
    const composerText = useComposerText();
    const {clearComposer} = useComposerActions();
    const {isSendDisabled, debouncedCommentMaxLengthValidation} = useComposerSendState();
    const {isEditingInComposer, editingMessage, effectiveDraft, didResetComposerHeightWhileEditing, editingState} = useComposerEditState();
    const {publishDraft, setDidResetComposerHeightWhileEditing} = useComposerEditActions();
    const {scrollOffsetRef} = useContext(ActionListContext);

    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);

    const {reportActions: unfilteredReportActions} = usePaginatedReportActions(report?.reportID);
    const filteredReportActions = getFilteredReportActionsForReportView(unfilteredReportActions);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactions = getAllNonDeletedTransactions(allReportTransactions, filteredReportActions, isOffline, true);
    const visibleTransactions = isOffline ? reportTransactions : reportTransactions?.filter((t) => t.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const reportTransactionIDs = visibleTransactions?.map((t) => t.transactionID);
    const isSentMoneyReport = filteredReportActions.some((action) => isSentMoneyReportAction(action));
    const transactionThreadReportID = getOneTransactionThreadReportID(report, chatReport, filteredReportActions, isOffline, reportTransactionIDs);
    const effectiveTransactionThreadReportID = isSentMoneyReport ? undefined : transactionThreadReportID;
    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportID}`);

    const reportAncestors = useAncestors(report);
    const targetReportAncestors = useAncestors(targetReport);

    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    /**
     * Add or edit a comment in the composer
     */
    const validateAndSubmitDraft = (draftMessage: string) => {
        const draftMessageTrimmed = draftMessage.trim();

        const isSubmittingEdit = isEditingInComposer || didResetComposerHeightWhileEditing;
        if (isSubmittingEdit && !attachmentFileRef.current) {
            publishDraft(draftMessageTrimmed);
            return;
        }

        if (!draftMessageTrimmed && !attachmentFileRef.current) {
            return;
        }

        if (attachmentFileRef.current) {
            addAttachmentWithComment({
                report: targetReport,
                notifyReportID: reportID,
                ancestors: targetReportAncestors,
                attachments: attachmentFileRef.current,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                text: draftMessageTrimmed,
                timezone: currentUserPersonalDetails.timezone,
                shouldPlaySound: true,
                isInSidePanel,
                delegateAccountID,
                sidePanelContext,
            });
            attachmentFileRef.current = null;
            return;
        }

        const taskMatch = draftMessageTrimmed.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
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
                    currentUserDisplayName: currentUserPersonalDetails.displayName,
                    currentUserAvatar: currentUserPersonalDetails.avatar,
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
                    [CONST.TELEMETRY.ATTRIBUTE_MESSAGE_LENGTH]: draftMessageTrimmed.length,
                },
            });
        }
        addComment({
            report: targetReport,
            notifyReportID: reportID,
            ancestors: targetReportAncestors,
            text: draftMessageTrimmed,
            timezoneParam: currentUserPersonalDetails.timezone ?? CONST.DEFAULT_TIME_ZONE,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            shouldPlaySound: true,
            isInSidePanel,
            sidePanelContext,
            reportActionID: optimisticReportActionID,
            delegateAccountID,
        });
    };

    const submitDraftAndClearComposer = () => {
        if (isSendDisabled || !debouncedCommentMaxLengthValidation?.flush()) {
            return;
        }

        if (isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }

        const isFinishingComposerEdit =
            editingState === CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING && (isEditingInComposer || didResetComposerHeightWhileEditing) && !attachmentFileRef.current;

        if (isFinishingComposerEdit) {
            const hasNonEmptyEditingMessage = editingMessage !== null && editingMessage !== '';
            const draftMessageForEdit = hasNonEmptyEditingMessage ? editingMessage : composerText;
            validateAndSubmitDraft(draftMessageForEdit);
            return;
        }

        if (effectiveDraft !== null && effectiveDraft !== '') {
            composerRef.current?.resetHeight();
            if (isEditingInComposer) {
                setDidResetComposerHeightWhileEditing(true);
            }
        }

        clearComposer();
    };

    return {
        validateAndSubmitDraft,
        submitDraftAndClearComposer,
    };
}

export default useComposerSubmit;
