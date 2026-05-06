import React from 'react';
import type {GestureResponderEvent, TextInput} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ReportActionItemEmojiReactions from '@components/Reactions/ReportActionItemEmojiReactions';
import RenderHTML from '@components/RenderHTML';
import CreatedReportForUnapprovedTransactionsAction from '@components/ReportActionItem/CreatedReportForUnapprovedTransactionsAction';
import CreateHarvestReportAction from '@components/ReportActionItem/CreateHarvestReportAction';
import ExportIntegration from '@components/ReportActionItem/ExportIntegration';
import IssueCardMessage from '@components/ReportActionItem/IssueCardMessage';
import MoneyRequestAction from '@components/ReportActionItem/MoneyRequestAction';
import MoneyRequestReportPreview from '@components/ReportActionItem/MoneyRequestReportPreview';
import MovedTransactionAction from '@components/ReportActionItem/MovedTransactionAction';
import TaskAction from '@components/ReportActionItem/TaskAction';
import TaskPreview from '@components/ReportActionItem/TaskPreview';
import TripRoomPreview from '@components/ReportActionItem/TripRoomPreview';
import UnreportedTransactionAction from '@components/ReportActionItem/UnreportedTransactionAction';
import {ShowContextMenuActionsContext, ShowContextMenuStateContext} from '@components/ShowContextMenuContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Permissions from '@libs/Permissions';
import {
    getChangedApproverActionMessage,
    getCompanyCardConnectionBrokenMessage,
    getIOUReportIDFromReportActionPreview,
    getOriginalMessage,
    getPlaidBalanceFailureMessage,
    getRenamedAction,
    getReportActionHtml,
    getSettlementAccountLockedMessage,
    getTravelUpdateMessage,
    isActionableCardFraudAlert,
    isActionableJoinRequest,
    isActionableMentionInviteToSubmitExpenseConfirmWhisper,
    isActionableMentionWhisper,
    isActionableReportMentionWhisper,
    isActionOfType,
    isCardBrokenConnectionAction,
    isCardIssuedAction,
    isCreatedTaskReportAction,
    isIOURequestReportAction,
    isMessageDeleted,
    isMoneyRequestAction,
    isReimbursementDeQueuedOrCanceledAction,
    isReimbursementQueuedAction,
    isRenamedAction,
    isTaskAction,
    isTripPreview,
} from '@libs/ReportActionsUtils';
import {getMovedActionMessage, isExpenseReport, shouldDisplayThreadReplies as shouldDisplayThreadRepliesUtils} from '@libs/ReportUtils';
import type {ContextMenuAnchor} from '@pages/inbox/report/ContextMenu/ReportActionContextMenu';
import LinkPreviewer from '@pages/inbox/report/LinkPreviewer';
import ReportActionItemBasicMessage from '@pages/inbox/report/ReportActionItemBasicMessage';
import ReportActionItemThread from '@pages/inbox/report/ReportActionItemThread';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ApprovalFlowContent, {isApprovalFlowAction} from './ApprovalFlowContent';
import CardBrokenConnectionContent from './CardBrokenConnectionContent';
import ChatMessageContent from './ChatMessageContent';
import ChatTransactionPreview from './ChatTransactionPreview';
import ConfirmWhisperContent from './ConfirmWhisperContent';
import {emptyHTML, isEmptyHTML} from './emptyHTML';
import FraudAlertContent from './FraudAlertContent';
import IntegrationSyncFailedMessage from './IntegrationSyncFailedMessage';
import JoinRequestContent from './JoinRequestContent';
import MentionWhisperContent from './MentionWhisperContent';
import ModifiedExpenseContent from './ModifiedExpenseContent';
import PaymentContent from './PaymentContent';
import PolicyChangeLogContent, {isHandledPolicyChangeLogAction} from './PolicyChangeLogContent';
import ReimbursedContent from './ReimbursedContent';
import ReimbursementDeQueuedContent from './ReimbursementDeQueuedContent';
import ReimbursementQueuedContent from './ReimbursementQueuedContent';
import ReportMentionWhisperContent from './ReportMentionWhisperContent';
import SimpleMessageContent, {isSimpleMessageAction} from './SimpleMessageContent';

type ActionContentRouterProps = {
    /** All the data of the action item */
    action: OnyxTypes.ReportAction;

    /** Report for this action */
    report: OnyxEntry<OnyxTypes.Report>;

    /** Original report from which the given reportAction is first created */
    originalReport: OnyxEntry<OnyxTypes.Report>;

    /** ID of the original report from which the given reportAction is first created */
    originalReportID: string;

    /** The IOU/Expense report we are paying */
    iouReport?: OnyxTypes.Report;

    /** Report ID for the current report */
    reportID: string | undefined;

    /** Should the comment have the appearance of being grouped with the previous comment? */
    displayAsGroup: boolean;

    /** ReportAction draft message */
    draftMessage: string | undefined;

    /** Whether the report action is a whisper */
    isWhisper: boolean;

    /** Whether the report action is hovered (or context menu / emoji picker active) */
    hovered: boolean;

    /** Whether the report action has any errors */
    hasErrors: boolean;

    /** Whether the report action context menu is active */
    isContextMenuActive: boolean;

    /** Whether the report action is currently active (linked) */
    isReportActionActive: boolean;

    /** Whether the message is moderation-hidden */
    isHidden: boolean;

    /** The latest moderation decision for the action */
    moderationDecision: OnyxTypes.DecisionName;

    /** Toggle the hidden state of the message */
    updateHiddenState: (isHiddenValue: boolean) => void;

    /** Whether the room is archived */
    isArchivedRoom?: boolean;

    /** Whether the original report is archived */
    isReportArchived: boolean;

    /** Whether the provided report is a closed expense report with no expenses */
    isClosedExpenseReportWithNoExpenses?: boolean;

    /** Whether the report action is the "Created" action of a harvest-created expense report */
    isHarvestCreatedExpenseReport: boolean;

    /** The originalID component of report name value pairs (used by the Created action of harvest reports) */
    reportNameValuePairsOriginalID?: string;

    /** Whether to show border for MoneyRequestReportPreviewContent */
    shouldShowBorder?: boolean;

    /** Is the action a thread's parent reportAction viewed from within the thread report? */
    isThreadReportParentAction: boolean;

    /** Whether the search-page UI is active */
    isOnSearch: boolean;

    /** Whether the context menu should be displayed for this action */
    shouldDisplayContextMenuValue: boolean;

    /** Position index of the report action in the overall report FlatList view */
    index: number;

    /** Popover context menu anchor ref, read by switch-arm consumers inside their event handlers */
    contextMenuAnchorRef: React.RefObject<Exclude<ContextMenuAnchor, TextInput>>;

    /** Composer text input ref forwarded to ReportActionItemMessageEdit */
    composerTextInputRef: React.RefObject<TextInput | HTMLTextAreaElement | null>;

    /** Memoized state value for ShowContextMenuStateContext */
    contextMenuStateValue: {
        anchor: ContextMenuAnchor | null;
        report: OnyxEntry<OnyxTypes.Report>;
        isReportArchived: boolean;
        action: OnyxTypes.ReportAction;
        transactionThreadReport?: OnyxEntry<OnyxTypes.Report>;
        isDisabled: boolean;
        shouldDisplayContextMenu: boolean;
        originalReportID: string | undefined;
    };

    /** Memoized actions value for ShowContextMenuActionsContext */
    contextMenuActionsValue: {
        checkIfContextMenuActive: () => void;
        onShowContextMenu: (callback: () => void) => void;
    };

    /** Toggle whether the payment method popover is active */
    setIsPaymentMethodPopoverActive: (value: boolean) => void;

    /** Toggle whether the emoji picker is active for this row */
    setIsEmojiPickerActive: (value: boolean | undefined) => void;

    /** Re-evaluate whether this row is the active context menu target */
    toggleContextMenuFromActiveReportAction: () => void;

    /** Open the context menu, transitioning the action sheet first */
    handleShowContextMenu: (callback: () => void) => void;

    /** Show the popover context menu in response to a press */
    showPopover: (event: GestureResponderEvent | MouseEvent) => void;

    /** Function to resolve actionable mention whisper */
    resolveActionableMentionWhisper: (
        report: OnyxEntry<OnyxTypes.Report>,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION>,
        isReportArchived: boolean,
        parentReport?: OnyxEntry<OnyxTypes.Report>,
    ) => void;

    /** Function to resolve actionable report mention whisper */
    resolveActionableReportMentionWhisper: (
        report: OnyxEntry<OnyxTypes.Report>,
        reportAction: OnyxEntry<OnyxTypes.ReportAction>,
        resolution: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION>,
        isReportArchived?: boolean,
    ) => void;

    /** Whether the search context provides a hash for attachment context (search-page only) */
    currentSearchHash: number | undefined;
};

function ActionContentRouter({
    action,
    report,
    originalReport,
    originalReportID,
    iouReport,
    reportID,
    displayAsGroup,
    draftMessage,
    isWhisper,
    hovered,
    hasErrors,
    isContextMenuActive,
    isReportActionActive,
    isHidden,
    moderationDecision,
    updateHiddenState,
    isArchivedRoom,
    isReportArchived,
    isClosedExpenseReportWithNoExpenses,
    isHarvestCreatedExpenseReport,
    reportNameValuePairsOriginalID,
    shouldShowBorder,
    isThreadReportParentAction,
    isOnSearch,
    shouldDisplayContextMenuValue,
    index,
    contextMenuAnchorRef,
    composerTextInputRef,
    contextMenuStateValue,
    contextMenuActionsValue,
    setIsPaymentMethodPopoverActive,
    setIsEmojiPickerActive,
    toggleContextMenuFromActiveReportAction,
    handleShowContextMenu,
    showPopover,
    resolveActionableMentionWhisper,
    resolveActionableReportMentionWhisper,
    currentSearchHash,
}: ActionContentRouterProps): React.JSX.Element {
    const {translate, formatTravelDate} = useLocalize();
    const styles = useThemeStyles();

    let children: React.JSX.Element;
    const moneyRequestOriginalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
    const moneyRequestActionType = moneyRequestOriginalMessage?.type;

    // Show the preview for when expense is present
    if (isIOURequestReportAction(action)) {
        const isSplitScanWithNoAmount = moneyRequestActionType === CONST.IOU.REPORT_ACTION_TYPE.SPLIT && moneyRequestOriginalMessage?.amount === 0;
        const chatReportID = moneyRequestOriginalMessage?.IOUReportID ? report?.chatReportID : reportID;
        // There is no single iouReport for bill splits, so only 1:1 requests require an iouReportID
        const iouReportID = moneyRequestOriginalMessage?.IOUReportID?.toString();
        children = (
            <MoneyRequestAction
                // If originalMessage.iouReportID is set, this is a 1:1 IOU expense in a DM chat whose reportID is report.chatReportID
                chatReportID={chatReportID}
                requestReportID={iouReportID}
                reportID={reportID}
                action={action}
                isHovered={hovered}
                contextMenuAnchorRef={contextMenuAnchorRef}
                checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                style={displayAsGroup ? [] : [styles.mt2]}
                isWhisper={isWhisper}
                shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                originalReportID={originalReportID}
            />
        );

        if (report?.type === CONST.REPORT.TYPE.CHAT) {
            const isSplitBill = moneyRequestActionType === CONST.IOU.REPORT_ACTION_TYPE.SPLIT;
            const shouldShowSplitPreview = isSplitBill || isSplitScanWithNoAmount;
            if (report.chatType === CONST.REPORT.CHAT_TYPE.SELF_DM || shouldShowSplitPreview) {
                children = (
                    <ChatTransactionPreview
                        action={action}
                        reportID={reportID}
                        originalReportID={originalReportID}
                        chatReportID={chatReportID}
                        iouReport={iouReport}
                        shouldShowSplitPreview={shouldShowSplitPreview}
                        shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                        transactionID={shouldShowSplitPreview ? moneyRequestOriginalMessage?.IOUTransactionID : undefined}
                    />
                );
            } else {
                children = emptyHTML;
            }
        }
    } else if (isTripPreview(action)) {
        children = (
            <TripRoomPreview
                action={action}
                isHovered={hovered}
                contextMenuAnchorRef={contextMenuAnchorRef}
                containerStyles={displayAsGroup ? [] : [styles.mt2]}
                checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                originalReportID={originalReportID}
            />
        );
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && isClosedExpenseReportWithNoExpenses) {
        children = <RenderHTML html={`<deleted-action>${translate('parentReportAction.deletedReport')}</deleted-action>`} />;
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW) {
        children = (
            <MoneyRequestReportPreview
                iouReportID={getIOUReportIDFromReportActionPreview(action)}
                policyID={report?.policyID}
                chatReportID={reportID}
                action={action}
                contextMenuAnchorRef={contextMenuAnchorRef}
                isHovered={hovered}
                isWhisper={isWhisper}
                checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                onPaymentOptionsShow={() => setIsPaymentMethodPopoverActive(true)}
                onPaymentOptionsHide={() => setIsPaymentMethodPopoverActive(false)}
                shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                shouldShowBorder={shouldShowBorder}
                originalReportID={originalReportID}
            />
        );
    } else if (isTaskAction(action)) {
        children = <TaskAction action={action} />;
    } else if (isCreatedTaskReportAction(action)) {
        children = (
            <ShowContextMenuStateContext.Provider value={contextMenuStateValue}>
                <ShowContextMenuActionsContext.Provider value={contextMenuActionsValue}>
                    <TaskPreview
                        style={displayAsGroup ? [] : [styles.mt1]}
                        chatReportID={reportID}
                        action={action}
                        isHovered={hovered}
                        onShowContextMenu={handleShowContextMenu}
                        contextMenuAnchorRef={contextMenuAnchorRef}
                        checkIfContextMenuActive={toggleContextMenuFromActiveReportAction}
                        policyID={report?.policyID}
                        shouldDisplayContextMenu={shouldDisplayContextMenuValue}
                    />
                </ShowContextMenuActionsContext.Provider>
            </ShowContextMenuStateContext.Provider>
        );
    } else if (isReimbursementQueuedAction(action)) {
        children = (
            <ReimbursementQueuedContent
                action={action}
                report={report}
                iouReport={iouReport}
            />
        );
    } else if (isReimbursementDeQueuedOrCanceledAction(action)) {
        children = (
            <ReimbursementDeQueuedContent
                action={action}
                report={report}
            />
        );
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE) {
        children = (
            <ModifiedExpenseContent
                action={action}
                report={report}
                originalReport={originalReport}
            />
        );
    } else if (isApprovalFlowAction(action)) {
        children = (
            <ApprovalFlowContent
                action={action}
                policyID={report?.policyID}
                reportID={reportID}
                originalReport={originalReport}
            />
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.IOU) && getOriginalMessage(action)?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        children = (
            <PaymentContent
                action={action}
                policyID={report?.policyID}
            />
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REIMBURSED)) {
        children = (
            <ReimbursedContent
                action={action}
                report={report}
            />
        );
    } else if (isSimpleMessageAction(action)) {
        children = (
            <SimpleMessageContent
                action={action}
                report={report}
            />
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.FORWARDED)) {
        const wasAutoForwarded = getOriginalMessage(action)?.automaticAction ?? false;
        if (wasAutoForwarded) {
            children = (
                <ReportActionItemBasicMessage>
                    <RenderHTML html={`<comment><muted-text>${translate('iou.automaticallyForwarded')}</muted-text></comment>`} />
                </ReportActionItemBasicMessage>
            );
        } else {
            children = <ReportActionItemBasicMessage message={translate('iou.forwarded')} />;
        }
    } else if (isHandledPolicyChangeLogAction(action)) {
        children = (
            <PolicyChangeLogContent
                action={action}
                policyID={report?.policyID}
            />
        );
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION) {
        children = (
            <MovedTransactionAction
                action={action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION>}
                emptyHTML={emptyHTML}
                originalReport={originalReport}
            />
        );
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.MOVED) {
        children = (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getMovedActionMessage(translate, action, report)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        children = (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getTravelUpdateMessage(translate, action, formatTravelDate)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION) {
        children = (
            <UnreportedTransactionAction
                action={action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION>}
                originalReport={originalReport}
            />
        );
    } else if (action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN || action.actionName === CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN) {
        children = (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getReportActionHtml(action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else if (isActionableCardFraudAlert(action)) {
        children = (
            <FraudAlertContent
                action={action}
                reportID={reportID}
            />
        );
    } else if (isActionableJoinRequest(action)) {
        children = (
            <JoinRequestContent
                action={action}
                reportID={reportID}
                originalReportID={originalReportID}
                policyID={report?.policyID}
            />
        );
    } else if (isActionableMentionWhisper(action)) {
        children = (
            <MentionWhisperContent
                action={action}
                report={report}
                originalReport={originalReport}
                originalReportID={originalReportID}
                resolveActionableMentionWhisper={resolveActionableMentionWhisper}
            />
        );
    } else if (isActionableReportMentionWhisper(action)) {
        children = (
            <ReportMentionWhisperContent
                action={action}
                reportID={reportID}
                report={report}
                originalReport={originalReport}
                isReportArchived={isReportArchived}
                resolveActionableReportMentionWhisper={resolveActionableReportMentionWhisper}
            />
        );
    } else if (isActionableMentionInviteToSubmitExpenseConfirmWhisper(action)) {
        children = (
            <ConfirmWhisperContent
                action={action}
                reportID={reportID}
                report={report}
                originalReport={originalReport}
                originalReportID={originalReportID}
            />
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM)) {
        children = <ReportActionItemBasicMessage message={translate('report.actions.type.leftTheChat')} />;
    } else if (isCardIssuedAction(action)) {
        children = (
            <IssueCardMessage
                action={action}
                policyID={report?.policyID}
            />
        );
    } else if (isCardBrokenConnectionAction(action)) {
        children = <CardBrokenConnectionContent action={action} />;
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION)) {
        children = <ExportIntegration action={action} />;
    } else if (isRenamedAction(action)) {
        const message = getRenamedAction(translate, action, isExpenseReport(report));
        children = <ReportActionItemBasicMessage message={message} />;
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED)) {
        children = (
            <IntegrationSyncFailedMessage
                action={action}
                policyID={report?.policyID}
            />
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN)) {
        children = (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getCompanyCardConnectionBrokenMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE)) {
        children = (
            <ReportActionItemBasicMessage message="">
                <RenderHTML html={`<comment><muted-text>${getPlaidBalanceFailureMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CREATED) && isHarvestCreatedExpenseReport) {
        children = <CreateHarvestReportAction reportNameValuePairsOriginalID={reportNameValuePairsOriginalID} />;
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS)) {
        children = <CreatedReportForUnapprovedTransactionsAction action={action} />;
    } else if (
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REROUTE) ||
        isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER)
    ) {
        children = (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<comment><muted-text>${getChangedApproverActionMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else if (isActionOfType(action, CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED)) {
        children = (
            <ReportActionItemBasicMessage>
                <RenderHTML html={`<comment><muted-text>${getSettlementAccountLockedMessage(translate, action)}</muted-text></comment>`} />
            </ReportActionItemBasicMessage>
        );
    } else {
        children = (
            <ChatMessageContent
                action={action}
                report={report}
                originalReport={originalReport}
                reportID={reportID}
                originalReportID={originalReportID}
                displayAsGroup={displayAsGroup}
                draftMessage={draftMessage}
                index={index}
                isHidden={isHidden}
                moderationDecision={moderationDecision}
                updateHiddenState={updateHiddenState}
                isArchivedRoom={isArchivedRoom}
                composerTextInputRef={composerTextInputRef}
                isOnSearch={isOnSearch}
                currentSearchHash={currentSearchHash}
                contextMenuStateValue={contextMenuStateValue}
                contextMenuActionsValue={contextMenuActionsValue}
            />
        );
    }

    if (isEmptyHTML(children)) {
        return emptyHTML;
    }

    const numberOfThreadReplies = action.childVisibleActionCount ?? 0;
    const shouldDisplayThreadReplies = shouldDisplayThreadRepliesUtils(action, isThreadReportParentAction) && !isOnSearch;
    const oldestFourAccountIDs =
        action.childOldestFourAccountIDs
            ?.split(',')
            .map((accountID) => Number(accountID))
            .filter((accountID): accountID is number => typeof accountID === 'number') ?? [];
    const draftMessageRightAlign = draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {};

    return (
        <>
            {children}
            {Permissions.canUseLinkPreviews() && !isHidden && (action.linkMetadata?.length ?? 0) > 0 && (
                <View style={draftMessage !== undefined ? styles.chatItemReactionsDraftRight : {}}>
                    <LinkPreviewer linkMetadata={action.linkMetadata?.filter((item) => !isEmptyObject(item))} />
                </View>
            )}
            {!isOnSearch && !isMessageDeleted(action) && (
                <View style={draftMessageRightAlign}>
                    <ReportActionItemEmojiReactions
                        reportAction={action}
                        reportID={reportID}
                        shouldBlockReactions={hasErrors}
                        setIsEmojiPickerActive={setIsEmojiPickerActive}
                    />
                </View>
            )}

            {shouldDisplayThreadReplies && (
                <View style={draftMessageRightAlign}>
                    <ReportActionItemThread
                        reportAction={action}
                        report={report}
                        numberOfReplies={numberOfThreadReplies}
                        mostRecentReply={`${action.childLastVisibleActionCreated}`}
                        isHovered={hovered || isContextMenuActive}
                        accountIDs={oldestFourAccountIDs}
                        onSecondaryInteraction={showPopover}
                        isActive={isReportActionActive && !isContextMenuActive}
                    />
                </View>
            )}
        </>
    );
}

export default ActionContentRouter;
