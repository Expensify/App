import useAncestors from '@hooks/useAncestors';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useReportIsArchived from '@hooks/useReportIsArchived';

import {addAttachmentWithComment, addComment, clearAgentZeroProcessingIndicator} from '@libs/actions/Report';
import {createTaskFromMarkdown} from '@libs/actions/Task';
import {rand64} from '@libs/NumberUtils';
import {getAllReportActions} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, generateReportID, isConciergeChatReport} from '@libs/ReportUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import getSendMessageListWeight from '@libs/telemetry/getSendMessageListWeight';
import getSendMessageSource from '@libs/telemetry/getSendMessageSource';

import {useActionListContext} from '@pages/inbox/ActionListContext';

import {setIsComposerFullSize} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {useRoute} from '@react-navigation/native';

import {useComposerActions, useComposerEditActions, useComposerEditState, useComposerMeta, useComposerSendState} from './ComposerContext';
import useComposerReportData from './useComposerReportData';
import useSidePanelContext from './useSidePanelContext';

function useComposerSubmit(reportID: string) {
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const isInSidePanel = useIsInSidePanel();
    const sidePanelContext = useSidePanelContext(reportID);
    const route = useRoute();
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const {isBetaEnabled} = usePermissions();
    const [isComposerFullSize = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`);
    const delegateAccountID = useDelegateAccountID();

    const {composerRef, attachmentFileRef, textRef} = useComposerMeta();
    const {clearComposer} = useComposerActions();
    const {isSendDisabled, debouncedCommentMaxLengthValidation} = useComposerSendState();
    const {isEditingInComposer, effectiveDraft, didResetComposerHeightWhileEditing, editingState} = useComposerEditState();
    const {publishDraft, setDidResetComposerHeightWhileEditing} = useComposerEditActions();
    const {scrollOffsetRef} = useActionListContext();

    const {report, effectiveTransactionThreadReportID} = useComposerReportData(reportID);
    const [targetReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${effectiveTransactionThreadReportID ?? reportID}`);
    const isReportArchived = useReportIsArchived(reportID);

    const reportAncestors = useAncestors(report);
    const targetReportAncestors = useAncestors(targetReport);

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

        // A new user message supersedes any Concierge processing indicator from a prior turn (e.g. a persisted
        // "...is working on your chat" while a human is handling it). Clear it optimistically so it disappears
        // the instant the user sends, instead of lingering until the ProcessAgentZeroRequest job runs; the
        // backend re-establishes the correct status afterward.
        if (isConciergeChatReport(report, conciergeReportID)) {
            clearAgentZeroProcessingIndicator(reportID, CONST.ACCOUNT_ID.CONCIERGE);
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
                conciergeReportID,
            });
            attachmentFileRef.current = null;
            return;
        }

        if (createTaskFromMarkdown({text: draftMessageTrimmed, parentReport: report, currentUserPersonalDetails, quickAction, delegateAccountID, ancestors: reportAncestors})) {
            return;
        }

        const optimisticReportActionID = rand64();
        const isScrolledToBottom = scrollOffsetRef.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD;
        if (isScrolledToBottom) {
            const {reportActionCount, moneyRequestPreviewCount} = getSendMessageListWeight(getAllReportActions(reportID), reportID, canUserPerformWriteAction(report, isReportArchived));
            const attributes = {
                [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
                [CONST.TELEMETRY.ATTRIBUTE_MESSAGE_LENGTH]: draftMessageTrimmed.length,
                [CONST.TELEMETRY.ATTRIBUTE_SEND_MESSAGE_SOURCE]: getSendMessageSource({report, conciergeReportID, isInSidePanel, routeName: route.name}),
                [CONST.TELEMETRY.ATTRIBUTE_REPORT_ACTION_COUNT]: reportActionCount,
                [CONST.TELEMETRY.ATTRIBUTE_MONEY_REQUEST_PREVIEW_COUNT]: moneyRequestPreviewCount,
            };
            startSpan(`${CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE}_${optimisticReportActionID}`, {
                name: 'send-message-visible',
                op: CONST.TELEMETRY.SPAN_SEND_MESSAGE_VISIBLE,
                attributes,
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
            conciergeReportID,

            // Concierge answers each question in its own thread. The side panel renders its own pinned report,
            // so it stays in the DM rather than being sent to a thread it cannot show.
            conciergeThreadReportID: reportID === conciergeReportID && !isInSidePanel && isBetaEnabled(CONST.BETAS.CONCIERGE_RESPOND_IN_THREAD) ? generateReportID() : undefined,
        });
    };

    const submitDraftAndClearComposer = () => {
        if (isSendDisabled || debouncedCommentMaxLengthValidation?.flush() === false) {
            return;
        }

        if (isComposerFullSize) {
            setIsComposerFullSize(reportID, false);
        }

        const isFinishingComposerEdit =
            editingState === CONST.REPORT_ACTION_EDIT_MESSAGE_STATE.EDITING && (isEditingInComposer || didResetComposerHeightWhileEditing) && !attachmentFileRef.current;

        if (isFinishingComposerEdit) {
            // We need to schedule the submission on the next tick to wait for
            // potential autocorrection to update the text
            setTimeout(() => {
                validateAndSubmitDraft(textRef.current ?? '');
            }, 0);

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
