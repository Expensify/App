import type CONST from '@src/CONST';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {ValueOf} from 'type-fest';

import type {CardID} from './Card';
import type {PolicyRuleTaxRate} from './ExpenseRule';
import type {Attendee} from './IOU';
import type {OldDotOriginalMessageMap} from './OldDotAction';
import type {AllConnectionName} from './Policy';
import type {PolicyChangeLogCopyReportActionNames} from './ReportAction';
import type ReportActionName from './ReportActionName';
import type {Reservation, TransactionCommentVendor} from './Transaction';
import type TransactionPending3DSReview from './TransactionPending3DSReview';

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

    /**
     * ID of the IOU/expense report the action belongs to. Temporary fallback for resolving the report when the
     * backend omits `reportID` on hydrated IOU actions. Remove once the backend reliably sends `reportID`.
     * See https://github.com/Expensify/App/issues/93882.
     */
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

    /** Masked number (e.g., 'XXXXXX1234') of the bank account used to fund the payment */
    accountNumber?: string;

    /** True when the submitter marked the report as payment received outside Expensify */
    isSubmitterMarkedPaymentReceived?: boolean;

    /** How much was transaction */
    amount?: number;

    /** Currency of the transaction money */
    currency?: string;

    /** Only exists when we are sending money */
    IOUDetails?: IOUDetails;
};

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

/** Model of `smart scan failed` report action */
type OriginalMessageSmartScanFailed = {
    /** Fields that are missing */
    missingFields: string[];

    /** LLM-friendly explanation of the scan failure that activates the Explain button */
    reasoning?: string;
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

    /** The accountID of the human agent assisting Concierge when "Reply as yourself" is used */
    humanAgentAccountID?: number;

    /** The AgentZero request ID that produced this comment, surfaced for internal tracing in non-production builds */
    agentZeroRequestID?: string;
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

    /** Timestamp of when the whisper was deleted (set by the backend when the parent comment is deleted) */
    deleted?: string | null;

    /** The reportActionID of the parent comment that triggered this whisper. Used to find the parent when this
     *  whisper was created during a message edit (and therefore doesn't follow the parentID+1 ID convention).
     *  Stored as a string by the backend to preserve full int64 precision. */
    parentReportActionID?: string;
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

    /** Timestamp of when the whisper was deleted (set by the backend when the parent comment is deleted) */
    deleted?: string | null;

    /** The reportActionID of the parent comment that triggered this whisper.
     *  Stored as a string by the backend to preserve full int64 precision. */
    parentReportActionID?: string;
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

/** Possible values of policy budget frequency */
type PolicyBudgetFrequencyValues = 'yearly' | 'monthly';

/** Model of policy budget frequency action data */
type PolicyBudgetFrequency = {
    /** Values of policy budget frequency */
    frequency: PolicyBudgetFrequencyValues;

    /** Shared value of the entity budget */
    shared?: number;

    /** Individual value of the entity budget */
    individual?: number;

    /** Notification threshold */
    notificationThreshold: number;
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

    /** Old value for max expense amount with no itemized receipt */
    oldMaxExpenseAmountNoItemizedReceipt?: number;

    /** New value for max expense amount with no itemized receipt */
    newMaxExpenseAmountNoItemizedReceipt?: number;

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

    /** MCC group name whose default spend category changed (e.g. "Airlines") */
    mccGroupName?: string;

    /** Previous category name for the MCC group */
    oldCategory?: string;

    /** New category name for the MCC group */
    newCategory?: string;

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

    /** Name of the custom unit sub rate */
    customUnitSubRateName?: string;

    /** Name of the removed sub rate */
    removedSubRateName?: string;

    /** Custom unit name */
    rateName?: string;

    /** Rate amount in cents for the custom unit rate */
    rate?: number;

    /**
     * Distance unit ('mi' or 'km'). Used by custom-unit rate change logs and
     * commuter-exclusion change logs.
     */
    unit?: string;

    /** Start date of the custom unit rate (yyyy-MM-dd), used in ADD actions */
    startDate?: string;

    /** End date of the custom unit rate (yyyy-MM-dd), used in ADD actions */
    endDate?: string;

    /** New start date of the custom unit rate (yyyy-MM-dd), used in UPDATE actions */
    newStartDate?: string;

    /** New end date of the custom unit rate (yyyy-MM-dd), used in UPDATE actions */
    newEndDate?: string;

    /** Previous start date of the custom unit rate (yyyy-MM-dd) */
    oldStartDate?: string;

    /** Previous end date of the custom unit rate (yyyy-MM-dd) */
    oldEndDate?: string;

    /** Tax percentage of the new tax rate linked to distance rate or category */
    newTaxPercentage?: string;

    /** Tax percentage of the old tax rate linked to distance rate or category */
    oldTaxPercentage?: string;

    /** Name of the new tax rate (without percentage) for category default tax rate */
    newTaxName?: string;

    /** Name of the old tax rate (without percentage) for category default tax rate */
    oldTaxName?: string;

    /** Added/Updated tag name */
    tagName?: string;

    /** Updated tag list name */
    tagListName?: string;

    /** Updated tag lists name */
    tagListsName?: string;

    /** Is tag list is required */
    isRequired?: boolean;

    /** Count of elements updated */
    count?: string | number;

    /** Updated tag enabled/disabled value */
    enabled?: boolean;

    /** Default value of a report field */
    defaultValue?: string;

    /** field ID of a report field */
    fieldID?: string;

    /**  update type of a report field */
    updateType?: string;

    /** New role of user or new value of the category/tag field */
    newValue?: boolean | string | number | PolicyBudgetFrequency;

    /** Old role of user or old value of the category/tag field */
    oldValue?: boolean | string | number | PolicyBudgetFrequency;

    /** category/tag field */
    entityType?: string;

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

    /** Old rate of the time enabled */
    oldRate?: number;

    /** New rate of the time enabled */
    newRate?: number;

    /** Old prohibited expenses */
    oldProhibitedExpenses?: Record<ValueOf<typeof CONST.POLICY.PROHIBITED_EXPENSES>, boolean>;

    /** New prohibited expenses */
    newProhibitedExpenses?: Record<ValueOf<typeof CONST.POLICY.PROHIBITED_EXPENSES>, boolean>;

    /** Old reimbursement choice */
    oldChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;

    /** New reimbursement choice */
    newChoice?: ValueOf<typeof CONST.POLICY.REIMBURSEMENT_CHOICES>;

    /** Old owner email */
    oldOwnerEmail?: string;

    /** Old owner name */
    oldOwnerName?: string;

    /** Budget amount */
    budgetAmount?: string;

    /** Budget frequency */
    budgetFrequency?: string;

    /** Budget name */
    budgetName?: string;

    /** Budget type for notification message */
    budgetTypeForNotificationMessage?: string;

    /** Is new DOT */
    isNewDot?: boolean;

    /** Summary link message */
    summaryLinkMessage?: string;

    /** Threshold percentage */
    thresholdPercentage?: number;

    /** Total spend */
    totalSpend?: number;

    /** Unsubmitted spend */
    unsubmittedSpend?: number;

    /** User email */
    userEmail?: string;

    /** Approved reimbursed closed spend */
    approvedReimbursedClosedSpend?: number;

    /** Awaiting approval spend */
    awaitingApprovalSpend?: number;
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

    /** Name of company card feed */
    feedName?: string;

    /** Last four digits of a company card */
    cardLastFour?: string;

    /** Old name of a company card feed */
    oldFeedName?: string;

    /** Company card feed liability type */
    liabilityType?: string;

    /** Statement period end day for a company card feed */
    statementPeriodEndDay?: string;

    /** Previous statement period end day for a company card feed */
    previousStatementPeriodEndDay?: string;

    /** Whether the user joined the workspace via joining link */
    didJoinPolicy?: boolean;
};

/** Amount operators for spend rules */
type SpendRuleAmountOperator = typeof CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN | typeof CONST.SEARCH.SYNTAX_OPERATORS.LOWER_THAN_OR_EQUAL_TO;

/** Currency operators for spend rules */
type SpendRuleCurrencyOperator = typeof CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO | typeof CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO;

/** Model of an Expensify card spend rule change log action (add, update, or remove) */
type OriginalMessageSpendRuleChangeLog = {
    /** Spend rule action */
    action?: ValueOf<typeof CONST.SPEND_RULES.ACTION>;

    /** Previous spend rule action when the rule's restriction type was updated */
    oldAction?: ValueOf<typeof CONST.SPEND_RULES.ACTION>;

    /** Merchants included in a spend rule */
    merchants?: string[];

    /** Previous list of merchants when a spend rule was updated */
    oldMerchants?: string[];

    /** Categories included in a spend rule */
    categories?: string[];

    /** Previous list of categories when a spend rule was updated */
    oldCategories?: string[];

    /** Currencies included in the spend rule */
    currencies?: Array<{
        /** Operator (`eq` for "is", `ne` for "is not") */
        operator: SpendRuleCurrencyOperator;

        /** Currency value */
        value: string[];
    }>;

    /** Old currencies included in the spend rule */
    oldCurrencies?: Array<{
        /** Operator (`eq` for "is", `ne` for "is not") */
        operator: SpendRuleCurrencyOperator;

        /** Currency value */
        value: string[];
    }>;

    /** Max-amount filters in a spend rule */
    amounts?: Array<{
        /** Operator (`gt` for "over", `lte` for "under") */
        operator: SpendRuleAmountOperator;

        /** Amount value as a decimal dollar string array (e.g. `['100.40']`) */
        value: string[];
    }>;

    /** Previous list of max-amount filters when a spend rule was updated */
    oldAmounts?: Array<{
        /** Operator (`gt` for "over", `lte` for "under") */
        operator: SpendRuleAmountOperator;

        /** Amount value as a decimal dollar string array (e.g. `['100.40']`) */
        value: string[];
    }>;

    /** Cards a spend rule is scoped to */
    cards?: Array<{
        /** Card identifier */
        cardID: CardID;

        /** Display name shown when the rule covers a single card */
        displayName?: string;
    }>;

    /** Previous list of cards when a spend rule's card scope was updated */
    oldCards?: Array<{
        /** Card identifier */
        cardID: CardID;

        /** Display name shown when the rule covers a single card */
        displayName?: string;
    }>;

    /** Currency of the spend rule */
    currency?: string;
};

/** Model of a policy copy change log action */
type OriginalMessagePolicyChangeCopyLog = {
    /** The ID of the source policy from which the user copied settings */
    sourcePolicyID?: string;

    /** The quantity of the item copied from source policy */
    quantity?: number;
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

    /** Edited accounting-system vendor on the transaction's comment NVP. `null` means the vendor was cleared. */
    vendor?: TransactionCommentVendor | null;

    /** Previous accounting-system vendor on the transaction's comment NVP. `null` means there was no prior vendor. */
    oldVendor?: TransactionCommentVendor | null;

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

    /** The fields that were modified by policy rules */
    policyRulesModifiedFields?: PolicyRulesModifiedFields;

    /** The fields that were modified by personal rules */
    personalRulesModifiedFields?: PersonalRulesModifiedFields;

    /** The Concierge reasoning for the action */
    reasoning?: string;
};

/** Model of `concierge auto match vendor` report action — emitted on the transaction thread when the PHP fuzzy matcher auto-matches a non-reimbursable expense to a QBO vendor. */
type OriginalMessageConciergeAutoMatchVendor = {
    /** Display name of the matched vendor */
    vendorName?: string;

    /** LLM-consumable explanation of why this vendor was matched — surfaced behind the "Explain" link */
    reasoning?: string;
};

/** Policy rules modified fields */
type PolicyRulesModifiedFields = {
    /** The value that the merchant was changed to */
    merchant?: string;

    /** The value that the amount was changed to */
    category?: string;

    /** The value that the tag was changed to */
    tag?: string;

    /** The value that the description was changed to (backend uses "comment" key) */
    comment?: string;

    /** The value that the description was changed to (display key, mapped from "comment") */
    description?: string;

    /** The value that the billable status was changed to */
    billable?: boolean;

    /** The value that the reimbursable status was changed to */
    reimbursable?: boolean;

    /** The value that the tax was changed to */
    tax?: {
        /** The tax rate being used  */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: PolicyRuleTaxRate;
    };
};

/** Personal rules modified fields */
type PersonalRulesModifiedFields = {
    /** The value that the merchant was changed to */
    merchant?: string;

    /** The value that the amount was changed to */
    category?: string;

    /** The value that the tag was changed to */
    tag?: string;

    /** The value that the description was changed to (backend uses "comment" key) */
    comment?: string;

    /** The value that the description was changed to (display key, mapped from "comment") */
    description?: string;

    /** The value that the billable status was changed to */
    billable?: boolean;

    /** The value that the reimbursable status was changed to */
    reimbursable?: boolean;

    /** The value that the tax was changed to */
    tax?: {
        /** The tax rate being used  */
        // eslint-disable-next-line @typescript-eslint/naming-convention
        field_id_TAX: PolicyRuleTaxRate;
    };

    /** The value that the report name was set to */
    reportName?: string;
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
    /** Reasoning for the automated action, used by Concierge Explain feature */
    reasoning?: string;
};

/** Model of MOVED_TRANSACTION report action */
type OriginalMessageMovedTransaction = {
    /** @Deprecated ID of the new report for backwards compatibility */
    toReportID?: string;
    /** ID of the original report */
    fromReportID: string;
    /** Reasoning for the automated move, used by Concierge Explain feature */
    reasoning?: string;
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

    /** Explanation for why the report was routed that way */
    message?: string;
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

/** Model of `reimbursed` report action */
type OriginalMessageReimbursed = {
    /** Whether this action was created from NewDot */
    isNewDot?: boolean;

    /** Payment method used (e.g., 'Fast_ACH', 'Check', 'StripeConnect', or standard ACH) - set by the openReport path */
    paymentMethod?: string;

    /** Raw payment method field as stored by Auth (e.g., 'Fast_ACH', 'Check', 'StripeConnect', or standard ACH) - set on real-time Pusher updates */
    method?: string;

    /** Last 4 digits of the debit bank account used to fund the payment - set by the openReport path */
    debitBankAccountLast4?: string;

    /** Masked number (e.g., 'XXXXXX1234') of the debit bank account used to fund the payment - set on real-time Pusher updates */
    accountNumber?: string;

    /** Last 4 digits of the credit bank account receiving the payment */
    creditBankAccountLast4?: string;

    /** Expected completion date for the reimbursement */
    expectedDate?: string;

    /** Whether this is an invoice or bill payment */
    isInvoiceOrBill?: boolean;

    /** Whether the submitter is adding a bank account */
    isSubmitterAddingBankAccount?: boolean;

    /** For StripeConnect payments, indicates payment type ('card' or 'bank account') */
    stripePaymentType?: string;
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

    /** The Concierge reasoning for the action */
    reasoning?: string;
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

    /** Optional message explaining why the report was forwarded that way */
    message?: string;
};

/**
 *
 */
type OriginalMessageExportIntegration = {
    /**
     * Whether the export was done via an automation
     */
    automaticAction?: boolean;

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
    markedManually?: boolean;

    /**
     * An list of URLs to the report in the integration for company card expenses
     */
    nonReimbursableUrls?: string[];

    /**
     * An list of URLs to the report in the integration for out of pocket expenses
     */
    reimbursableUrls?: string[];

    /**
     * A list of URLs to the Travel Invoicing Journal Entry records
     */
    travelInvoicingUrls?: string[];

    /**
     * The Concierge reasoning for the action
     */
    reasoning?: string;

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

    /** Number of times this identical failure has recurred (set by server-side de-duplication) */
    recurrenceCount?: number;
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
 * Original message for Plaid balance failure
 */
type OriginalMessagePlaidBalanceFailure = {
    /** The policy ID for which the Plaid balance failure occurred */
    policyID: string;

    /** The masked bank account number */
    maskedAccountNumber: string;

    /** The reasoning for the failure (for AgentZero) */
    reasoning?: string;
};

/**
 * Original message for DEW_SUBMIT_FAILED and DEW_APPROVE_FAILED actions
 */
type OriginalMessageDEWFailed = {
    /** The error message */
    message: string;

    /** Whether the action was automatic */
    automaticAction?: boolean;

    /** Was the report submitted via harvesting (delayed submit) */
    harvesting?: boolean;
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
 * Model of CARDFROZEN action
 */
type OriginalMessageCardFrozen = {
    /** HTML content of the system message */
    html: string;

    /** Whether the action was generated by NewDot */
    isNewDot?: boolean;

    /** When the action was last modified */
    lastModified?: string;
};

/**
 * Model of CARDDEACTIVATED action
 */
type OriginalMessageCardDeactivated = {
    /** HTML content of the system message */
    html: string;

    /** Whether the action was generated by NewDot */
    isNewDot?: boolean;

    /** When the action was last modified */
    lastModified?: string;
};

/**
 * Model of PERSONAL_CARD_CONNECTION_BROKEN action
 */
type OriginalPersonalCard = {
    /** The id of the user the card was assigned to */
    assigneeAccountID: number;

    /** The id of the card */
    cardID: number;

    /** The name of the card */
    cardName?: string;
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
    /** Whether this action was triggered automatically (e.g., during auto-pay) */
    automaticAction?: boolean;
};

/**
 * Model of Reassign Approver action original message (system-generated when approval workflow changes)
 */
type OriginalMessageReassignApprover = {
    /** Account ID of the new approver assigned by the system */
    newApproverID: number;
};

/**
 * Minimal transaction data needed to render the MFA authorize transaction preview.
 */
type OriginalMessageActionableCard3DSTransactionApproval = TransactionPending3DSReview;

/**
 * Model of settlement account locked report action
 */
type OriginalMessageSettlementAccountLocked = {
    /** The masked bank account number that was locked */
    maskedBankAccountNumber: string;

    /** The policy the bank account is connected to and is being notified */
    policyID: string;
};

/**
 * Original message for Expensify Card issue/replacement actions
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
 * Model of a HOME_ADDRESS_REQUIRED Concierge report action.
 */
type OriginalMessageHomeAddressRequired = {
    /** ID of the policy whose commuter-exclusion change triggered the prompt */
    policyID: string;
};

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
    [CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL]: OriginalMessageActionableCard3DSTransactionApproval;
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
    [CONST.REPORT.ACTIONS.TYPE.REJECTED_TO_SUBMITTER]: never;
    [CONST.REPORT.ACTIONS.TYPE.REJECTEDTRANSACTION_THREAD]: never;
    [CONST.REPORT.ACTIONS.TYPE.REJECTED_TRANSACTION_MARKASRESOLVED]: never;
    [CONST.REPORT.ACTIONS.TYPE.IOU]: OriginalMessageIOU;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_ATTACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MANAGER_DETACH_RECEIPT]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARK_REIMBURSED_FROM_INTEGRATION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED]: OriginalMessageMarkedReimbursed;
    [CONST.REPORT.ACTIONS.TYPE.MERGED_WITH_CASH_TRANSACTION]: never;
    [CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE]: OriginalMessageModifiedExpense;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_AUTO_MATCH_VENDOR]: OriginalMessageConciergeAutoMatchVendor;
    [CONST.REPORT.ACTIONS.TYPE.MOVED]: OriginalMessageMoved;
    [CONST.REPORT.ACTIONS.TYPE.MOVED_TRANSACTION]: OriginalMessageMovedTransaction;
    [CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION]: OriginalMessageUnreportedTransaction;
    [CONST.REPORT.ACTIONS.TYPE.OUTDATED_BANK_ACCOUNT]: never;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSED]: OriginalMessageReimbursed;
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
    [CONST.REPORT.ACTIONS.TYPE.CARD_FROZEN]: OriginalMessageCardFrozen;
    [CONST.REPORT.ACTIONS.TYPE.CARD_UNFROZEN]: OriginalMessageCardFrozen;
    [CONST.REPORT.ACTIONS.TYPE.CARD_DEACTIVATED]: OriginalMessageCardDeactivated;
    [CONST.REPORT.ACTIONS.TYPE.PERSONAL_CARD_CONNECTION_BROKEN]: OriginalPersonalCard;
    [CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED]: OriginalMessageIntegrationSyncFailed;
    [CONST.REPORT.ACTIONS.TYPE.DELETED_TRANSACTION]: OriginalMessageDeletedTransaction;
    [CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED]: OriginalMessageDEWFailed;
    [CONST.REPORT.ACTIONS.TYPE.DEW_APPROVE_FAILED]: OriginalMessageDEWFailed;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_CATEGORY_OPTIONS]: OriginalMessageConciergeCategoryOptions;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_DESCRIPTION_OPTIONS]: OriginalMessageConciergeDescriptionOptions;
    [CONST.REPORT.ACTIONS.TYPE.CONCIERGE_AUTO_MAP_MCC_GROUPS]: OriginalMessageConciergeAutoMapMccGroups;
    [CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN]: OriginalMessageCompanyCardConnectionBroken;
    [CONST.REPORT.ACTIONS.TYPE.PLAID_BALANCE_FAILURE]: OriginalMessagePlaidBalanceFailure;
    [CONST.REPORT.ACTIONS.TYPE.RETRACTED]: never;
    [CONST.REPORT.ACTIONS.TYPE.REOPENED]: never;
    [CONST.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED]: OriginalMessageSmartScanFailed;
    [CONST.REPORT.ACTIONS.TYPE.REASSIGN_APPROVER]: OriginalMessageReassignApprover;
    [CONST.REPORT.ACTIONS.TYPE.REROUTE]: OriginalMessageTakeControl;
    [CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED]: OriginalMessageReimbursementDirectorInformationRequired;
    [CONST.REPORT.ACTIONS.TYPE.HOME_ADDRESS_REQUIRED]: OriginalMessageHomeAddressRequired;
    [CONST.REPORT.ACTIONS.TYPE.SETTLEMENT_ACCOUNT_LOCKED]: OriginalMessageSettlementAccountLocked;
} & OldDotOriginalMessageMap &
    Record<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG>, OriginalMessagePolicyChangeLog> &
    Record<PolicyChangeLogCopyReportActionNames, OriginalMessagePolicyChangeCopyLog> & {
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.ADD_EXPENSIFY_CARD_RULE]: OriginalMessageSpendRuleChangeLog;
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_EXPENSIFY_CARD_RULE]: OriginalMessageSpendRuleChangeLog;
        [CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.REMOVE_EXPENSIFY_CARD_RULE]: OriginalMessageSpendRuleChangeLog;
    } & Record<ValueOf<typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>, OriginalMessageChangeLog>;

type OriginalMessage<T extends ReportActionName> = T extends keyof OriginalMessageMap ? OriginalMessageMap[T] : never;

export default OriginalMessage;
export type {
    DecisionName,
    OriginalMessageIOU,
    ChronosOOOEvent,
    PaymentMethodType,
    OriginalMessageSource,
    Decision,
    PolicyRulesModifiedFields,
    PersonalRulesModifiedFields,
    OriginalMessageChangeLog,
    JoinWorkspaceResolution,
    OriginalMessageModifiedExpense,
    OriginalMessageExportIntegration,
    IssueNewCardOriginalMessage,
    OriginalMessageChangePolicy,
    OriginalMessageMovedTransaction,
    PolicyBudgetFrequency,
    OriginalMessageMarkedReimbursed,
    OriginalMessageReimbursed,
    OriginalMessageSettlementAccountLocked,
};
