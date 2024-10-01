import type {Spread, ValueOf} from 'type-fest';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type OldDotAction from './OldDotAction';
import type * as OnyxCommon from './OnyxCommon';
import type OriginalMessage from './OriginalMessage';
import type {Decision} from './OriginalMessage';
import type {NotificationPreference} from './Report';
import type ReportActionName from './ReportActionName';
import type {Receipt} from './Transaction';

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

    /** The name (or type) of the action */
    actionName: ReportActionName;

    /** Account ID of the actor that created the action */
    actorAccountID?: number;

    /** The account of the last message's actor */
    actor?: string;

    /** Person who created the action */
    person?: Person[];

    /** ISO-formatted datetime */
    created: string;

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

    /** The owner account ID of the child report action */
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

    /** Whether the report action is only an attachment */
    isAttachmentOnly?: boolean;

    /** Whether the report action is an attachment with text */
    isAttachmentWithText?: boolean;

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

    /**
     * Unix timestamp of when the report action was created
     *
     * Note: This is sent by the backend but we don't use it locally
     */
    reportActionTimestamp?: number;

    /**
     * Unix timestamp of when the report action was created, without the miliseconds (need to multiply by 1000)
     *
     * Note: This is sent by the backend but we don't use it locally
     */
    timestamp?: number;
}>;

/**
 *
 */
type OldDotReportAction = ReportActionBase & OldDotAction;

/**
 *
 */
type ReportAction<T extends ReportActionName = ReportActionName> = ReportActionBase & {
    /** @deprecated Used in old report actions before migration. Replaced by using getOriginalMessage function. */
    originalMessage?: OriginalMessage<T>;

    /** report action message */
    message?: (OriginalMessage<T> & Message) | Array<Message | undefined>;

    /** report action message */
    previousMessage?: (OriginalMessage<T> & Message) | Array<Message | undefined>;
};

/** */
type ReportActionChangeLog = ReportAction<ValueOf<Spread<typeof CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG, typeof CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG>>>;

/** Record of report actions, indexed by report action ID */
type ReportActions = Record<string, ReportAction>;

/** Collection of mock report actions, indexed by reportActions_${reportID} */
type ReportActionsCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>;

export default ReportAction;
export type {ReportActions, Message, LinkMetadata, OriginalMessage, ReportActionsCollectionDataSet, ReportActionChangeLog, OldDotReportAction};
