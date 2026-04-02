import {Str} from 'expensify-common';
import {useContext} from 'react';
import type {RefObject} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useShortMentionsList from '@hooks/useShortMentionsList';
import {addComment} from '@libs/actions/Report';
import {isEmailPublicDomain} from '@libs/LoginUtils';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {rand64} from '@libs/NumberUtils';
import {addDomainToShortMention} from '@libs/ParsingUtils';
import {getFilteredReportActionsForReportView, getOneTransactionThreadReportID, isSentMoneyReportAction} from '@libs/ReportActionsUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {generateAccountID} from '@libs/UserUtils';
import {useAgentZeroStatusActions} from '@pages/inbox/AgentZeroStatusContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import {addAttachmentWithComment} from '@userActions/Report';
import {createTaskAndNavigate, setNewOptimisticAssignee} from '@userActions/Task';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {FileObject} from '@src/types/utils/Attachment';

type UseComposerSubmitParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    reportID: string;
    attachmentFileRef: RefObject<FileObject | FileObject[] | null>;
};

function useComposerSubmit({report, reportID, attachmentFileRef}: UseComposerSubmitParams) {
    const isInSidePanel = useIsInSidePanel();
    const {kickoffWaitingIndicator} = useAgentZeroStatusActions();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const personalDetails = usePersonalDetails();
    const {availableLoginsList} = useShortMentionsList();
    const {scrollOffsetRef} = useContext(ActionListContext);

    const {isOffline} = useNetwork();
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

    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportID}`);

    const reportAncestors = useAncestors(report);
    const targetReportAncestors = useAncestors(targetReport);

    const currentUserEmail = currentUserPersonalDetails.email ?? '';

    const handleCreateTask = (text: string): boolean => {
        const match = text.match(CONST.REGEX.TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION);
        if (!match) {
            return false;
        }
        let title = match[3] ? match[3].trim().replaceAll('\n', ' ') : undefined;
        if (!title) {
            return false;
        }

        const mention = match[1] ? match[1].trim() : '';
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
                title = `@${mentionWithDomain} ${title}`;
            }
        }
        createTaskAndNavigate({
            parentReport: report,
            title,
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
        return true;
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

        if (handleCreateTask(newCommentTrimmed)) {
            return;
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
    };

    return {submitForm};
}

export default useComposerSubmit;
