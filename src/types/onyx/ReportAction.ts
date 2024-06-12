import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import type * as OnyxCommon from './OnyxCommon';
import type {Decision, OriginalMessageModifiedExpense, OriginalMessageReportPreview} from './OriginalMessage';
import type OriginalMessage from './OriginalMessage';
import type {NotificationPreference} from './Report';
import type {Receipt} from './Transaction';

/** Partial content of report action message */
type ReportActionMessageJSON = {
    /** Collection of accountIDs from users that were mentioned in report */
    whisperedTo?: number[];
};

/** Model of report action message */
type Message = {
    /** The type of the action item fragment. Used to render a corresponding component */
    type: string;

    /** The text content of the fragment. */
    text: string;

    /** The html content of the fragment. */
    html?: string;

    /** Used to apply additional styling. Style refers to a predetermined constant and not a class name. e.g. 'normal'
     * or 'strong'
     */
    style?: string;

    /** ID of a report */
    reportID?: string;

    /** ID of a policy */
    policyID?: string;

    /** The target of a link fragment e.g. '_blank' */
    target?: string;

    /** The destination of a link fragment e.g. 'https://www.expensify.com' */
    href?: string;

    /** An additional avatar url - not the main avatar url but used within a message. */
    iconUrl?: string;

    /** Fragment edited flag */
    isEdited?: boolean;

    /** Whether thread's parent message is deleted or not */
    isDeletedParentAction?: boolean;

    /** Whether the pending transaction was reversed and didn't post to the card */
    isReversedTransaction?: boolean;

    /** Collection of accountIDs of users mentioned in message */
    whisperedTo?: number[];

    /** In situations where moderation is required, this is the moderator decision data */
    moderationDecision?: Decision;

    /** Key to translate the message */
    translationKey?: string;

    /** ID of a task report */
    taskReportID?: string;

    /** Reason of payment cancellation */
    cancellationReason?: string;

    /** ID of an expense report */
    expenseReportID?: string;

    /** Amount of an expense */
    amount?: number;

    /** Currency of an expense */
    currency?: string;

    /** resolution for actionable mention whisper */
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | ValueOf<typeof CONST.REPORT.ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION> | null;

    /** The time this report action was deleted */
    deleted?: string;
};

/** Model of image */
type ImageMetadata = {
    /**  The height of the image. */
    height?: number;

    /**  The width of the image. */
    width?: number;

    /**  The URL of the image. */
    url?: string;

    /**  The type of the image. */
    type?: string;
};

/** Model of link */
type LinkMetadata = {
    /**  The URL of the link. */
    url?: string;

    /**  A description of the link. */
    description?: string;

    /**  The title of the link. */
    title?: string;

    /**  The publisher of the link. */
    publisher?: string;

    /**  The image associated with the link. */
    image?: ImageMetadata;

    /**  The provider logo associated with the link. */
    logo?: ImageMetadata;
};

/** Model of report action person */
type Person = {
    /** Type of the message to display */
    type?: string;

    /** Style applied to the message */
    style?: string;

    /** Content of the message to display which corresponds to the user display name */
    text?: string;
};

/** Main properties of report action */
type ReportActionBase = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID: string;

    /** @deprecated Used in old report actions before migration. Replaced by reportActionID. */
    sequenceNumber?: number;

    /** The ID of the previous reportAction on the report. It is a string represenation of a 64-bit integer (or null for CREATED actions). */
    previousReportActionID?: string;

    /** Account ID of the actor that created the action */
    actorAccountID?: number;

    /** The account of the last message's actor */
    actor?: string;

    /** Person who created the action */
    person?: Person[];

    /** ISO-formatted datetime */
    created: string;

    /** report action message */
    message?: Array<Message | undefined>;

    /** report action message */
    previousMessage?: Array<Message | undefined>;

    /** Whether we have received a response back from the server */
    isLoading?: boolean;

    /** Avatar data to display on the report action */
    avatar?: AvatarSource;

    /** TODO: Not enough context */
    automatic?: boolean;

    /** TODO: Not enough context */
    shouldShow?: boolean;

    /** The ID of childReport */
    childReportID?: string;

    /** Name of child report */
    childReportName?: string;

    /** Type of child report  */
    childType?: string;

    /** The user's ID */
    accountID?: number;

    /** Account IDs of the oldest four participants, useful to determine which avatars to display in threads */
    childOldestFourAccountIDs?: string;

    /** How many participants commented in the report */
    childCommenterCount?: number;

    /** Timestamp of the most recent reply */
    childLastVisibleActionCreated?: string;

    /** Number of thread replies */
    childVisibleActionCount?: number;

    /** Report ID of the parent report, if there's one */
    parentReportID?: string;

    /** In task reports this is account ID of the user assigned to the task */
    childManagerAccountID?: number;
    childOwnerAccountID?: number;

    /** The status of the child report */
    childStatusNum?: ValueOf<typeof CONST.REPORT.STATUS_NUM>;

    /** Report action child status name */
    childStateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;

    /** Content of the last money request comment, used in report preview */
    childLastMoneyRequestComment?: string;

    /** Account ID of the last actor */
    childLastActorAccountID?: number;

    /** Amount of money requests */
    childMoneyRequestCount?: number;

    /** Whether the report action is the first one */
    isFirstItem?: boolean;

    /** Informations about attachments of report action */
    attachmentInfo?: FileObject | EmptyObject;

    /** Receipt tied to report action */
    receipt?: Receipt;

    /** ISO-formatted datetime */
    lastModified?: string;

    /** The accountID of the copilot who took this action on behalf of the user */
    delegateAccountID?: number;

    /** Server side errors keyed by microtime */
    errors?: OnyxCommon.Errors | OnyxCommon.ErrorFields;

    /** Error associated with the report action */
    error?: string;

    /** Whether the report action is attachment */
    isAttachment?: boolean;

    /** Recent receipt transaction IDs keyed by reportID */
    childRecentReceiptTransactionIDs?: Record<string, string>;

    /** ReportID of the report action */
    reportID?: string;

    /** Metadata of the link */
    linkMetadata?: LinkMetadata[];

    /** The current user's notification preference for this report's child */
    childReportNotificationPreference?: NotificationPreference;

    /** We manually add this field while sorting to detect the end of the list */
    isNewestReportAction?: boolean;

    /** Flag for checking if data is from optimistic data */
    isOptimisticAction?: boolean;

    /** The admins's ID */
    adminAccountID?: number;

    /** These are the account IDs to whom a message was whispered. It is used to check if a specific user should be displayed a whisper message or not. */
    whisperedToAccountIDs?: number[];
}>;

/** Model of report action */
type ReportAction = ReportActionBase & OriginalMessage;

/** Model of report preview action */
type ReportPreviewAction = ReportActionBase & OriginalMessageReportPreview;

/** Model of modifies expense action */
type ModifiedExpenseAction = ReportActionBase & OriginalMessageModifiedExpense;

/** Record of report actions, indexed by report action ID */
type ReportActions = Record<string, ReportAction>;

/** Collection of mock report actions, indexed by reportActions_${reportID} */
type ReportActionsCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>;

export default ReportAction;
export type {ReportActions, ReportActionBase, Message, LinkMetadata, OriginalMessage, ReportActionsCollectionDataSet, ReportPreviewAction, ModifiedExpenseAction, ReportActionMessageJSON};
