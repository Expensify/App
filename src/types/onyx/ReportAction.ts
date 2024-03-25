import type {ValueOf} from 'type-fest';
import type {FileObject} from '@components/AttachmentModal';
import type {AvatarSource} from '@libs/UserUtils';
import type CONST from '@src/CONST';
import type ONYXKEYS from '@src/ONYXKEYS';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';
import type {EmptyObject} from '@src/types/utils/EmptyObject';
import type * as OnyxCommon from './OnyxCommon';
import type {Decision, Reaction} from './OriginalMessage';
import type OriginalMessage from './OriginalMessage';
import type {NotificationPreference} from './Report';
import type {Receipt} from './Transaction';

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
    whisperedTo?: number[];
    reactions?: Reaction[];

    moderationDecision?: Decision;
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
    resolution?: ValueOf<typeof CONST.REPORT.ACTIONABLE_MENTION_WHISPER_RESOLUTION> | null;

    /** The time this report action was deleted */
    deleted?: string;
};

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

type Person = {
    type?: string;
    style?: string;
    text?: string;
};

type ReportActionBase = OnyxCommon.OnyxValueWithOfflineFeedback<{
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID: string;

    /** @deprecated Used in old report actions before migration. Replaced by reportActionID. */
    sequenceNumber?: number;

    /** The ID of the previous reportAction on the report. It is a string represenation of a 64-bit integer (or null for CREATED actions). */
    previousReportActionID: string | null;

    actorAccountID?: number;

    /** The account of the last message's actor */
    actor?: string;

    /** Person who created the action */
    person?: Person[];

    /** ISO-formatted datetime */
    created: string;

    /** report action message */
    message?: Message[];

    /** report action message */
    previousMessage?: Message[];

    /** Whether we have received a response back from the server */
    isLoading?: boolean;

    /** accountIDs of the people to which the whisper was sent to (if any). Returns empty array if it is not a whisper */
    whisperedToAccountIDs?: number[];

    avatar?: AvatarSource;

    automatic?: boolean;

    shouldShow?: boolean;

    /** The ID of childReport */
    childReportID?: string;

    /** Name of child report */
    childReportName?: string;

    /** Type of child report  */
    childType?: string;

    /** The user's ID */
    accountID?: number;

    childOldestFourEmails?: string;
    childOldestFourAccountIDs?: string;
    childCommenterCount?: number;
    childLastVisibleActionCreated?: string;
    childVisibleActionCount?: number;
    parentReportID?: string;
    childManagerAccountID?: number;

    /** The status of the child report */
    childStatusNum?: ValueOf<typeof CONST.REPORT.STATUS_NUM>;

    /** Report action child status name */
    childStateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;
    childLastReceiptTransactionIDs?: string;
    childLastMoneyRequestComment?: string;
    childLastActorAccountID?: number;
    timestamp?: number;
    reportActionTimestamp?: number;
    childMoneyRequestCount?: number;
    isFirstItem?: boolean;

    /** Informations about attachments of report action */
    attachmentInfo?: FileObject | EmptyObject;

    /** Receipt tied to report action */
    receipt?: Receipt;

    /** ISO-formatted datetime */
    lastModified?: string;

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
}>;

type ReportAction = ReportActionBase & OriginalMessage;

type ReportActions = Record<string, ReportAction>;

type ReportActionsCollectionDataSet = CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>;

export default ReportAction;
export type {ReportActions, ReportActionBase, Message, LinkMetadata, OriginalMessage, ReportActionsCollectionDataSet};
