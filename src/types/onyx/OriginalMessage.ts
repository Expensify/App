import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {TaxRate} from './ExpenseRule';
import type {Attendee} from './IOU';
import type {OldDotOriginalMessageMap} from './OldDotAction';
import type {AllConnectionName} from './Policy';
import type ReportActionName from './ReportActionName';
import type {Reservation} from './Transaction';

/** Types of join workspace resolutions */
type JoinWorkspaceResolution = ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION>;

/** Types of payments methods */
type PaymentMethodType = DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE | typeof CONST.IOU.REPORT_ACTION_TYPE | typeof CONST.WALLET.TRANSFER_METHOD_TYPE>;

/** Types of sources of original message */
type OriginalMessageSource = 'Chronos' | 'email' | 'ios' | 'android' | 'web' | '';

/** Details provided when sending money */
type IOUDetails = {
    /** How much was sent */
    amount: number;

    /** Optional comment */
    comment: string;

    /** Currency of the money sent */
    currency: string;
};

/** Model of `IOU` report action */
type OriginalMessageIOU = {
    /** The ID of the `IOU` transaction */
    IOUTransactionID?: string;

    /** ID of the `IOU` report */
    IOUReportID?: string;

    /** ID of the expense report */
    expenseReportID?: string;

    /** Was the action created automatically, not by a human */
    automaticAction?: boolean;

    /** Optional comment */
    comment?: string;

    /** When was the `IOU` last modified */
    lastModified?: string;

    /** Who participated in the transaction, by accountID */
    participantAccountIDs?: number[];

    /** Type of `IOU` report action */
    type: ValueOf<typeof CONST.IOU.REPORT_ACTION_TYPE>;

    /** If the action was cancelled, this is the reason for the cancellation */
    cancellationReason?: string;

    /** Type of payment method used in transaction */
    paymentType?: PaymentMethodType;

    /** Timestamp of when the `IOU` report action was deleted */
    deleted?: string;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];

    /** Where the invoice is paid with business account or not */
    payAsBusiness?: boolean;

    /** The bank account id */
    bankAccountID?: number;
} & (
    | {
          /** How much was transaction */
          amount: number;

          /** Currency of the transaction money */
          currency: string;

          /** Only exists when we are sending money */
          IOUDetails?: IOUDetails;
      }
    | {
          /** How much was transaction */
          amount?: number;

          /** Currency of the transaction money */
          currency?: string;

          /** Only exists when we are sending money */
          IOUDetails: IOUDetails;
      }
);

/** Names of moderation decisions */
type DecisionName = ValueOf<
    Pick<
        typeof CONST.MODERATION,
        'MODERATOR_DECISION_PENDING' | 'MODERATOR_DECISION_PENDING_HIDE' | 'MODERATOR_DECISION_PENDING_REMOVE' | 'MODERATOR_DECISION_APPROVED' | 'MODERATOR_DECISION_HIDDEN'
    >
>;

/** Model of moderator decision */
type Decision = {
    /** Name of the decision */
    decision: DecisionName;

    /** When was the decision made */
    timestamp?: string;
};

/** Model of `add comment` report action */
type OriginalMessageAddComment = {
    /** HTML content of the comment */
    html: string;

    /** Origin of the comment */
    source?: OriginalMessageSource;

    /** When was the comment last modified */
    lastModified?: string;

    /** ID of the task report */
    taskReportID?: string;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo: number[];

    /** List accountIDs are mentioned in message */
    mentionedAccountIDs?: number[];
};

/** Model of `actionable mention whisper` report action */
type OriginalMessageActionableMentionWhisper = {
    /** Emails of users that aren't members of the room  */
    inviteeEmails: string[];

    /** Account IDs of users that aren't members of the room  */
    inviteeAccountIDs: number[];

    /** Decision on whether to invite users that were mentioned but aren't members or do nothing */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];
};

/** Model of `actionable card fraud alert` report action */
type OriginalMessageCardFraudAlert = {
    /** Card ID */
    cardID: number;

    /** Masked card number */
    maskedCardNumber: string;

    /** Transaction amount in cents */
    triggerAmount: number;

    /** Merchant name */
    triggerMerchant: string;

    /** Currency of the transaction */
    currency?: string;

    /** Resolution: 'recognized' or 'fraud' */
    resolution?: ValueOf<typeof CONST.CARD_FRAUD_ALERT_RESOLUTION>;
};

/** Model of `actionable mention whisper` report action */
type OriginalMessageActionableMentionInviteToSubmitExpenseConfirmWhisper = {
    /** Account IDs of users that aren't members of the room  */
    inviteeAccountIDs: number[];

    /** Decision on whether to invite users that were mentioned but aren't members or do nothing */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER> | null;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];
};

/** Model of `actionable report mention whisper` report action */
type OriginalMessageActionableReportMentionWhisper = {
    /** Decision on whether to create a report that were mentioned but doesn't exist or do nothing */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION> | null;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];
};

/** Model of `welcome whisper` report action */
type OriginalMessagePolicyExpenseChatWelcomeWhisper = {
    /** HTML content of the welcome message */
    html: string;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];

    /** When was the welcome whisper last modified */
    lastModified?: string;

    /** Type of whisper (automated) */
    type?: string;
};

/** Model of `submitted` report action */
type OriginalMessageSubmitted = {
    /** The login of the admin (used in admin-submit) */
    admin?: string;

    /** The account id of the admin (used in admin-submit) */
    adminAccountID?: number;

    /** Approved expense amount */
    amount: number;

    /** Currency of the approved expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID?: string;

    /** Was the report submitted via harvesting (delayed submit) */
    harvesting?: boolean;

    /** The memo of the submitted report */
    message?: string;

    /** The login the approver who is acting on behalf of the vacationer */
    to?: string;

    /** The login of the approver who is on a vacation */
    vacationer?: string;

    /** Carbon copy list */
    cc?: string;

    /** The workflow the report is submitted on */
    workflow?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;
};

/** Model of `created` report action */
type OriginalMessageCreated = {
    /** The account id of the user the report is submitted to */
    submittedTo?: number;
};

/** Model of `created report for unapproved transactions` report action */
type OriginalMessageCreatedReportForUnapprovedTransactions = {
    /** The original report ID that the held expenses were moved from */
    originalID?: string;
};

/** Model of `closed` report action */
type OriginalMessageClosed = {
    /** Name of the policy */
    policyName: string;

    /** What was the reason to close the report */
    reason: ValueOf<typeof CONST.REPORT.ARCHIVE_REASON>;

    /** When was the message last modified */
    lastModified?: string;

    /** If the report was closed because accounts got merged, then this is the new account ID */
    newAccountID?: number;

    /** If the report was closed because accounts got merged, then this is the old account ID */
    oldAccountID?: number;

    /** Name of the invoice receiver's policy */
    receiverPolicyName?: string;

    /** If the expense report was mark as closed, then this is the report amount */
    amount?: number;

    /** If the expense report was mark as closed, then this is the report currency */
    currency?: string;

    /** The memo of the closed report */
    message?: string;
};

/** Model of `renamed` report action, created when chat rooms get renamed */
type OriginalMessageRenamed = {
    /** Renamed room comment */
    html: string;

    /** When was report action last modified */
    lastModified: string;

    /** Old room name */
    oldName: string;

    /** New room name */
    newName: string;
};

/** Model of Chronos OOO Timestamp */
type ChronosOOOTimestamp = {
    /** Date timestamp */
    date: string;
};

/** Model of Chronos OOO Event */
type ChronosOOOEvent = {
    /** ID of the OOO event */
    id: string;

    /** How many days will the user be OOO */
    lengthInDays: number;

    /** Description of the OOO state */
    summary: string;

    /** When will the OOO state start */
    start: ChronosOOOTimestamp;

    /** When will the OOO state end */
    end: ChronosOOOTimestamp;
};

/** Model of `Chronos OOO List` report action */
type OriginalMessageChronosOOOList = {
    /** Collection of OOO events to show in report action */
    events: ChronosOOOEvent[];
};

/** Model of `report preview` report action */
type OriginalMessageReportPreview = {
    /** ID of the report to be previewed */
    linkedReportID: string;

    /** Collection of accountIDs of users mentioned in report */
    whisperedTo?: number[];
};

/** Model of change log */
type OriginalMessageChangeLog = {
    /** Account IDs of users that either got invited or removed from the room */
    targetAccountIDs?: number[];

    /** Name of the chat room */
    roomName?: string;

    /** Description of the chat room */
    description?: string;

    /** ID of the report */
    reportID?: number;

    /** Old name of the workspace */
    oldName?: string;

    /** New name of the workspace */
    newName?: string;

    /** Email of user */
    email?: string;

    /** Role of user */
    role?: string;

    /** When was it last modified */
    lastModified?: string;

    /** New role of user or new value of the category/tag field
     * The user role will be of type string and category/tag value (enabled/disable)
     * will be of type boolean.
     */
    newValue?: boolean | string;

    /** Old role of user or old value (enabled/disable) of the category/tag field.
     * The user role will be of type string and category/tag value (enabled/disable)
     * will be of type boolean.
     */
    oldValue?: boolean | string;

    /** Name of connection */
    connectionName?: AllConnectionName;

    /** Name of the added category */
    categoryName?: string;

    /** Avatar URL of workspace room */
    avatarURL?: string;
};

/** Model of change log */
type OriginalMessagePolicyChangeLog = {
    /** Account IDs of users that either got invited or removed from the room */
    targetAccountIDs?: number[];

    /** Name of the chat room */
    roomName?: string;

    /** Description of the chat room */
    description?: string;

    /** ID of the report */
    reportID?: number;

    /** Old name of the workspace/tag */
    oldName?: string;

    /** New name of the workspace/tag */
    newName?: string;

    /** Email of user */
    email?: string;

    /** Role of user */
    role?: string;

    /** When was it last modified */
    lastModified?: string;

    /** Old currency of the workspace */
    oldCurrency?: string;

    /** New currency of the workspace */
    newCurrency?: string;

    /** Old frequency of the workspace */
    oldFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** New frequency of the workspace */
    newFrequency?: ValueOf<typeof CONST.POLICY.AUTO_REPORTING_FREQUENCIES>;

    /** Name of connection */
    connectionName?: AllConnectionName;

    /** Name of the added category */
    categoryName?: string;

    /** Name of the added tax */
    taxName?: string;

    /** Name of the updated field */
    updatedField?: string;

    /** Old value for max expense amount with no receipt */
    oldMaxExpenseAmountNoReceipt?: number;

    /** New value for max expense amount with no receipt */
    newMaxExpenseAmountNoReceipt?: number;

    /** Currency of the policy */
    currency?: string;

    /** Old value for max expense amount for violations */
    oldMaxExpenseAmount?: number;

    /** New value for max expense amount for violations */
    newMaxExpenseAmount?: number;

    /** Old value for max expense age (days) */
    oldMaxExpenseAge?: number;

    /** New value for max expense age (days) */
    newMaxExpenseAge?: number;

    /** Old default billable value */
    oldDefaultBillable?: string;

    /** New default billable value */
    newDefaultBillable?: string;

    /** Old default reimbursable value */
    oldDefaultReimbursable?: string;

    /** New default reimbursable value */
    newDefaultReimbursable?: string;

    /** Old default report title formula */
    oldDefaultTitle?: string;

    /** New default report title formula */
    newDefaultTitle?: string;

    /** value -- returned when updating "Auto-approve compliant reports" */
    value?: boolean;

    /** New description */
    newDescription?: string;

    /** Old description */
    oldDescription?: string;

    /** Report field type */
    fieldType?: string;

    /** Custom field type  */
    field?: string;

    /** Array of field changes for consolidated employee updates */
    fields?: Array<{
        /** The name of the field being updated */
        field: string;
        /** The previous value of the field */
        oldValue: string;
        /** The new value of the field */
        newValue: string;
    }>;

    /** Report field name */
    fieldName?: string;

    /** Custom unit name */
    customUnitName?: string;

    /** Rate name of the custom unit */
    customUnitRateName?: string;

    /** Custom unit name */
    rateName?: string;

    /** Tax percentage of the new tax rate linked to distance rate */
    newTaxPercentage?: string;

    /** Tax percentage of the old tax rate linked to distance rate */
    oldTaxPercentage?: string;

    /** Added/Updated tag name */
    tagName?: string;

    /** Updated tag list name */
    tagListName?: string;

    /** Count of elements updated */
    count?: string;

    /** Updated tag enabled/disabled value */
    enabled?: boolean;

    /** Default value of a report field */
    defaultValue?: string;

    /** field ID of a report field */
    fieldID?: string;

    /**  update type of a report field */
    updateType?: string;

    /** New role of user or new value of the category/tag field */
    newValue?: boolean | string;

    /** Old role of user or old value of the category/tag field */
    oldValue?: boolean | string;

    /** Old approval audit rate */
    oldAuditRate?: number;

    /** New approval audit rate */
    newAuditRate?: number;

    /** Old limit of manual approval threshold */
    oldLimit?: number;

    /** New limit of manual approval threshold */
    newLimit?: number;

    /** Name for the field of which approver has been updated */
    name?: string;

    /** Account ID of the approver */
    approverAccountID?: string;

    /** Email of the new approver */
    newApproverEmail?: string;

    /** Name of the new approver */
    newApproverName?: string;

    /** Email of the old approver */
    oldApproverEmail?: string;

    /** Name of the old approver */
    oldApproverName?: string;

    /** Email of the approver */
    approverEmail?: string;

    /** Name of the approver */
    approverName?: string;

    /** Option name of a list report field */
    optionName?: string;

    /** Option enabled state of a list report field */
    optionEnabled?: string;

    /** Number of report field options updated */
    toggledOptionsCount?: number;

    /** Are all allEnabled report field options enabled */
    allEnabled?: string;

    /** The amount of the transaction */
    amount?: number;

    /** The ID of the transaction thread report */
    transactionThreadReportID?: string;

    /** The name of the enabled/disabled feature */
    featureName?: string;

    /** The new reimburser details */
    reimburser?: {
        /** The email of the new reimburser */
        email: string;
        /** The name of the new reimburser */
        name: string;
        /** The accountID of the new reimburser */
        accountID: number;
    };

    /** The previous reimburser details */
    previousReimburser?: {
        /** The email of the previous reimburser */
        email: string;
        /** The name of the previous reimburser */
        name: string;
        /** The accountID of the previous reimburser */
        accountID: number;
    };
};

/** Model of `join policy` report action */
type OriginalMessageJoinPolicy = {
    /** What was the invited user decision */
    choice: JoinWorkspaceResolution;

    /** ID of the affected policy */
    policyID: string;

    /** AccountID for the user requesting to join the policy */
    accountID?: number;

    /** Email of the requested user */
    email?: string;
};

/** Model of `modified expense` report action */
type OriginalMessageModifiedExpense = {
    /** Old content of the comment */
    oldComment?: string;

    /** Edited content of the comment */
    newComment?: string;

    /** Edited merchant name */
    merchant?: string;

    /** Old creation date timestamp */
    oldCreated?: string;

    /** Edited creation date timestamp */
    created?: string;

    /** Old merchant name */
    oldMerchant?: string;

    /** Old expense amount */
    oldAmount?: number;

    /** Edited expense amount */
    amount?: number;

    /** Old expense amount currency  */
    oldCurrency?: string;

    /** Edited expense amount currency */
    currency?: string;

    /** Edited expense category */
    category?: string;

    /** Old expense category */
    oldCategory?: string;

    /** Edited expense tag */
    tag?: string;

    /** Old expense tag */
    oldTag?: string;

    /** Edited billable */
    billable?: string;

    /** Old billable */
    oldBillable?: string;

    /** Old expense tag amount */
    oldTaxAmount?: number;

    /** Edited expense tax amount */
    taxAmount?: number;

    /** Edited expense tax rate */
    taxRate?: string;

    /** Old expense tax rate */
    oldTaxRate?: string;

    /** Edited expense reimbursable */
    reimbursable?: string;

    /** Old expense reimbursable */
    oldReimbursable?: string;

    /** Collection of accountIDs of users mentioned in expense report */
    whisperedTo?: number[];

    /** The ID of moved report */
    movedToReportID?: string;

    /** The ID of the report the expense moved from */
    movedFromReport?: string;

    /** The old list of attendees */
    oldAttendees?: Attendee[];

    /** The list of attendees */
    newAttendees?: Attendee[];

    /** Source of category change (agentZero, mccMapping, or manual) */
    source?: ValueOf<typeof CONST.CATEGORY_SOURCE>;

    /** Whether the updated description was generated by AI */
    aiGenerated?: boolean;

    /** The policy ID that the expense was modified in */
    policyID?: string;

    /** The fields that were modified by poliy rules*/
    policyRulesModifiedFields?: PolicyRulesModifiedFields;
};

type PolicyRulesModifiedFields = {
    merchant?: string;
    category?: string;
    tag?: string;
    description?: string;
    billable?: string;
    reimbursable?: string;
    tax?: Record<string, TaxRate>;
};

/** Model of a `travel update` report action */
type OriginalMessageTravelUpdate = Reservation & UpdateOperationType;

/** Travel update operation type */
type UpdateOperationType = {
    /** Type of operation */
    operation: ValueOf<typeof CONST.TRAVEL.UPDATE_OPERATION_TYPE>;
};

/** Model of the `deleted transaction` report action */
type OriginalMessageDeletedTransaction = {
    /** The merchant of the transaction */
    merchant?: string;

    /** The amount of the transaction */
    amount?: number;

    /** The currency of the transaction */
    currency?: string;
};

/** Common model for Concierge category/description options actions */
type OriginalMessageConciergeBaseOptions = {
    /** The options we present to the user when confidence in the prediction is low */
    options: string[];

    /** The confidence levels for each option */
    confidenceLevels?: number[];

    /** The transaction ID associated with this action */
    transactionID?: string;
};

/** Model of `concierge category options` report action */
type OriginalMessageConciergeCategoryOptions = OriginalMessageConciergeBaseOptions & {
    /** The category selected by the user (set when the action is resolved) */
    selectedCategory?: string;

    /** Agent Zero metadata (optional) */
    agentZero?: Record<string, unknown>;
};

/** Model of `concierge description options` report action */
type OriginalMessageConciergeDescriptionOptions = OriginalMessageConciergeBaseOptions & {
    /** The description selected by the user (set when the action is resolved) */
    selectedDescription?: string;

    /** Agent Zero metadata (optional) */
    agentZero?: Record<string, unknown>;
};

/** Model of `concierge auto map mcc groups` report action */
type OriginalMessageConciergeAutoMapMccGroups = {
    /** The policy ID for which MCC groups were auto-mapped */
    policyID: string;
};

/** Model of `reimbursement queued` report action */
type OriginalMessageReimbursementQueued = {
    /** How is the payment getting reimbursed */
    paymentType: DeepValueOf<typeof CONST.IOU.PAYMENT_TYPE>;
};

/** Model of `actionable tracked expense whisper` report action */
type OriginalMessageActionableTrackedExpenseWhisper = {
    /** ID of the transaction */
    transactionID: string;

    /** When was the tracked expense whisper last modified */
    lastModified: string;

    /** What was the decision of the user */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION>;
};

/** Model of `reimbursement dequeued` report action */
type OriginalMessageReimbursementDequeued = {
    /** Why the reimbursement was cancelled */
    cancellationReason: ValueOf<typeof CONST.REPORT.CANCEL_PAYMENT_REASONS>;

    /** ID of the `expense` report */
    expenseReportID?: string;

    /** Amount that wasn't reimbursed */
    amount: number;

    /** Currency of the money that wasn't reimbursed */
    currency: string;
};

/** Model of CHANGE_POLICY report action */
type OriginalMessageChangePolicy = {
    /** ID of the old policy */
    fromPolicy: string | undefined;

    /** ID of the new policy */
    toPolicy: string;
};

/** Model of `UNREPORTED_TRANSACTION` report action */
type OriginalMessageUnreportedTransaction = {
    /** ID of the old report */
    fromReportID: string;
};

/** Model of MOVED_TRANSACTION report action */
type OriginalMessageMovedTransaction = {
    /** @Deprecated ID of the new report for backwards compatibility */
    toReportID?: string;
    /** ID of the original report */
    fromReportID: string;
};

/** Model of `moved` report action */
type OriginalMessageMoved = {
    /** ID of the old policy */
    fromPolicyID: string | undefined;

    /** ID of the new policy */
    toPolicyID: string;

    /** ID of the new parent report */
    newParentReportID: string;

    /** ID of the moved report */
    movedReportID: string;
};

/** Model of `dismissed violation` report action */
type OriginalMessageDismissedViolation = {
    /** Why the violation was dismissed */
    reason: string;

    /** Name of the violation */
    violationName: string;
};

/** Model of DYNAMIC_EXTERNAL_WORKFLOW_ROUTED report action */
type OriginalMessageDynamicExternalWorkflowRouted = {
    /** The approver of the report is submitted to */
    to: string;
};

/** Model of `marked reimbursed` report action */
type OriginalMessageMarkedReimbursed = {
    /** Whether this action was created from NewDot */
    isNewDot?: boolean;

    /** When was the action last modified */
    lastModified?: string;

    /** Type of payment method */
    type?: string;

    /** Optional comment/reason for the manual payment */
    message?: string;
};

/** Model of `trip room preview` report action */
type OriginalMessageTripRoomPreview = {
    /** ID of the report to be previewed */
    linkedReportID: string;

    /** When was report action last modified */
    lastModified?: string;

    /** Collection of accountIDs of users mentioned in report */
    whisperedTo?: number[];
};

/** Model of `approved` report action */
type OriginalMessageApproved = {
    /** Approved expense amount */
    amount: number;

    /** Was the action created automatically, not by a human */
    automaticAction?: boolean;

    /** Currency of the approved expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;

    /** The login of approver who is on vacation */
    managerOnVacation?: string;
};

/** Model of `forwarded` report action */
type OriginalMessageForwarded = {
    /** Forwarded expense amount */
    amount: number;

    /** Was the action created automatically, not by a human */
    automaticAction?: boolean;

    /** Currency of the forwarded expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;

    /** The login the approver who is acting on behalf of the vacationer */
    to?: string;

    /** The workflow the report is approved on */
    workflow?: ValueOf<typeof CONST.POLICY.APPROVAL_MODE>;
};

/**
 *
 */
type OriginalMessageExportIntegration = {
    /**
     * Whether the export was done via an automation
     */
    automaticAction: false;

    /**
     * The integration that was exported to (display text)
     */
    label: string;

    /**
     *
     */
    lastModified: string;

    /**
     * Whether the report was manually marked as exported
     */
    markedManually: boolean;

    /**
     * An list of URLs to the report in the integration for company card expenses
     */
    nonReimbursableUrls?: string[];

    /**
     * An list of URLs to the report in the integration for out of pocket expenses
     */
    reimbursableUrls?: string[];

    /**
     * The type of the export action
     */
    type?: string;
};

/** Model of `unapproved` report action */
type OriginalMessageUnapproved = {
    /** Unapproved expense amount */
    amount: number;

    /** Currency of the unapproved expense amount */
    currency: string;

    /** Report ID of the expense */
    expenseReportID: string;
};

/** Model of `Removed From Approval Chain` report action */
type OriginalMessageRemovedFromApprovalChain = {
    /** The submitter IDs whose approval chains changed such that the approver was removed from their approval chains */
    submittersAccountIDs: number[];

    /** The accountID of the approver who was removed from the submitter's approval chain */
    whisperedTo: number[];
};

/** Model of `Demoted From Workspace` report action */
type OriginalMessageDemotedFromWorkspace = {
    /** The policy name */
    policyName: string;

    /** The old role of the employee that is being demoted */
    oldRole: string;

    /** The accountID of the member who was demoted from workspace */
    whisperedTo: number[];
};

/**
 * Model of `Add payment card` report action
 */
type OriginalMessageAddPaymentCard = Record<string, never>;

/**
 * Original message for INTEGRATION_SYNC_FAILED actions
 */
type OriginalMessageIntegrationSyncFailed = {
    /** The user friendly connection name */
    label: string;

    /** The source of the connection sync */
    source: string;

    /** The error message from Integration Server */
    errorMessage: string;
};

/**
 * Original message for broken Concierge company card connection
 */
type OriginalMessageCompanyCardConnectionBroken = {
    /** The policy ID for which the company card connection was broken */
    policyID: string;

    /** The feed name for which the company card connection was broken */
    feedName: string;
};

/**
 * Original message for DEW_SUBMIT_FAILED and DEW_APPROVE_FAILED actions
 */
type OriginalMessageDEWFailed = {
    /** The error message */
    message: string;

    /** Whether the action was automatic */
    automaticAction?: boolean;
};

/**
 * Model of CARD_ISSUED, CARD_MISSING_ADDRESS, CARD_ISSUED_VIRTUAL, and CARD_REPLACED_VIRTUAL actions
 */
type OriginalMessageCard = {
    /** The id of the user the card was assigned to */
    assigneeAccountID: number;

    /** The id of the card */
    cardID: number;

    /** Whether the card was issued without a shipping address */
    hadMissingAddress?: boolean;
};

/**
 * Model of INTEGRATIONS_MESSAGE report action
 */
type OriginalMessageIntegrationMessage = {
    /** Object with detailed result */
    result: {
        /** Wether action was successful */
        success: boolean;
    };
};

/**
 * Model of Take Control action original message
 */
type OriginalMessageTakeControl = {
    /** Time the action was created */
    lastModified: string;
    /** Tagged account IDs of new approvers */
    mentionedAccountIDs: number[];
};

/**
 * Original message for CARD_ISSUED, CARD_MISSING_ADDRESS, CARD_ASSIGNED, CARD_ISSUED_VIRTUAL and CARD_ISSUED_VIRTUAL actions
 */
type IssueNewCardOriginalMessage = OriginalMessage<
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED_VIRTUAL
    | typeof CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED
>;

/**
 * Model of reimbursement director information report action
 */
type OriginalMessageReimbursementDirectorInformationRequired = {
    /** Last four digits of bank account number */
    bankAccountLastFour: string;

    /** Currency of policy */
    currency: string;

    /** ID of policy */
    policyID: string;

    /** ID of bank account */
    bankAccountID: string;

    /** Whether user added signer information */
    completed: boolean;
};

/** The map type of original message */
/* eslint-disable jsdoc/require-jsdoc */
type OriginalMessageMap = {
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_ADD_PAYMENT_CARD]: OriginalMessageAddPaymentCard;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT]: OriginalMessageCardFraudAlert;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST]: OriginalMessageJoinPolicy;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_WHISPER]: OriginalMessageActionableMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER]: OriginalMessageActionableMentionInviteToSubmitExpenseConfirmWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_REPORT_MENTION_WHISPER]: OriginalMessageActionableReportMentionWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_TRACK_EXPENSE_WHISPER]: OriginalMessageActionableTrackedExpenseWhisper;
    [CONST.REPORT.ACTIONS.TYPE.POLICY_EXPENSE_CHAT_WELCOME_WHISPER]: OriginalMessagePolicyExpenseChatWelcomeWhisper;
    [CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT]: OriginalMessageAddComment;
    [CONST.REPORT.ACTIONS.TYPE.APPROVED]: OriginalMessageApproved;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_FIELD]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_POLICY]: OriginalMessageChangePolicy;
    [CONST.REPORT.ACTIONS.TYPE.CHANGE_TYPE]: never;
    [CONST.REPORT.ACTIONS.TYPE.CHRONOS_OOO_LIST]: OriginalMessageChronosOOOList;
    [CONST.REPORT.ACTIONS.TYPE.CLOSED]: OriginalMessageClosed;
    [CONST.REPORT.ACTIONS.TYPE.CREATED]: OriginalMessageCreated;
    [CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS]: OriginalMessageCreatedReportForUnapprovedTransactions;
    [CONST.REPORT.ACTIONS.TYPE.DISMISSED_VIOLATION]: OriginalMessageDismissedViolation;
    [CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED]: OriginalMessageDynamicExternalWorkflowRouted;
    [CONST.REPORT.ACTIONS.TYPE.EXPENSIFY_CARD_SYSTEM_MESSAGE]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_CSV]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION]: OriginalMessageExportIntegration;
    [CONST.REPORT.ACTIONS.TYPE.FIX_VIOLATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.FORWARDED]: OriginalMessageForwarded;
    [CONST.REPORT.ACTIONS.TYPE.HOLD]: never;
    [CONST.REPORT.ACTIONS.TYPE.HOLD_COMMENT]: never;
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATIONS_MESSAGE]: OriginalMessageIntegrationMessage;
    [CONST.REPORT.ACTIONS.TYPE.REJECTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD]: never;
    [CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED]: never;
    [CONST.REPORT.ACTIONS.TYPE.IOU]: OriginalMessageIOU;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED]: OriginalMessageMarkedReimbursed;
    [CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE]: OriginalMessageModifiedExpense;
    [CONST.REPORT.ACTIONS.TYPE.MOVED]: OriginalMessageMoved;
    [CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION]: OriginalMessageMovedTransaction;
    [CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION]: OriginalMessageUnreportedTransaction;
    [CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_BOUNCE]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACH_CANCELED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_ACCOUNT_CHANGED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DEQUEUED]: OriginalMessageReimbursementDequeued;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DELAYED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED]: OriginalMessageReimbursementQueued;
    [CONST.REPORT.ACTIONS.TYPE.REMOVED_FROM_APPROVAL_CHAIN]: OriginalMessageRemovedFromApprovalChain;
    [CONST.REPORT.ACTIONS.TYPE.DEMOTED_FROM_WORKSPACE]: OriginalMessageDemotedFromWorkspace;
    [CONST.REPORT.ACTIONS.TYPE.RENAMED]: OriginalMessageRenamed;
    [CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW]: OriginalMessageReportPreview;
    [CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES]: never;
    [CONST.REPORT.ACTIONS.TYPE.SELECTED_FOR_RANDOM_AUDIT]: never;
    [CONST.REPORT.ACTIONS.TYPE.SHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.STRIPE_PAID]: never;
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED]: OriginalMessageSubmitted;
    [CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED]: OriginalMessageSubmitted;
    [CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_COMPLETED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_EDITED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TASK_REOPENED]: never;
    [CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL]: OriginalMessageTakeControl;
    [CONST.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE]: OriginalMessageTravelUpdate;
    [CONST.REPORT.ACTIONS.TYPE.UNAPPROVED]: OriginalMessageUnapproved;
    [CONST.REPORT.ACTIONS.TYPE.UNHOLD]: never;
    [CONST.REPORT.ACTIONS.TYPE.UNSHARE]: never;
    [CONST.REPORT.ACTIONS.TYPE.UPDATE_GROUP_CHAT_MEMBER_ROLE]: never;
    [CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW]: OriginalMessageTripRoomPreview;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP]: never;
    [CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_QUICK_BOOKS]: never;
    [CONST.REPORT.ACTIONS.TYPE.DONATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_REQUESTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_SETUP_REQUESTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_ISSUED_VIRTUAL]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED_VIRTUAL]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_REPLACED]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.CARD_ASSIGNED]: OriginalMessageCard;
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED]: OriginalMessageIntegrationSyncFailed;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION]: OriginalMessageDeletedTransaction;
    [CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED]: OriginalMessageDEWFailed;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS]: OriginalMessageConciergeCategoryOptions;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_DESCRIPTION_OPTIONS]: OriginalMessageConciergeDescriptionOptions;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_AUTO_MAP_MCC_GROUPS]: OriginalMessageConciergeAutoMapMccGroups;
    [CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN]: OriginalMessageCompanyCardConnectionBroken;
    [CONST.REPORT.ACTIONS.TYPE.RETRACTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REOPENED]: never;
    [CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REROUTE]: OriginalMessageTakeControl;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED]: OriginalMessageReimbursementDirectorInformationRequired;
} & OldDotOriginalMessageMap &
    Record<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>, OriginalMessagePolicyChangeLog> &
    Record<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>, OriginalMessageChangeLog>;

type OriginalMessage<T extends ReportActionName> = OriginalMessageMap[T];

export default OriginalMessage;
export type {
    DecisionName,
    OriginalMessageCardFraudAlert,
    OriginalMessageIOU,
    ChronosOOOEvent,
    PaymentMethodType,
    OriginalMessageSource,
    Decision,
    OriginalMessageChangeLog,
    JoinWorkspaceResolution,
    OriginalMessageModifiedExpense,
    OriginalMessageExportIntegration,
    IssueNewCardOriginalMessage,
    OriginalMessageChangePolicy,
    OriginalMessageUnreportedTransaction,
    OriginalMessageMovedTransaction,
    OriginalMessageMarkedReimbursed,
    OriginalMessageConciergeAutoMapMccGroups,
    OriginalMessageCompanyCardConnectionBroken,
    OriginalMessageReimbursementDirectorInformationRequired,
};
