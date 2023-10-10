import {ValueOf} from 'type-fest';
import OriginalMessage, {Reaction} from './OriginalMessage';
import * as OnyxCommon from './OnyxCommon';
import CONST from '../../CONST';
import {Receipt} from './Transaction';

type Message = {
    /** The type of the action item fragment. Used to render a corresponding component */
    type: string;

    /** The text content of the fragment. */
    text: string;

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

    isDeletedParentAction?: boolean;
    whisperedTo?: number[];
    reactions?: Reaction[];
    taskReportID?: string;
    html?: string;
    translationKey?: string;
};

type Person = {
    type?: string;
    style?: string;
    text?: string;
};

type ReportActionBase = {
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID?: string;

    /** The ID of the previous reportAction on the report. It is a string represenation of a 64-bit integer (or null for CREATED actions). */
    previousReportActionID?: string;

    actorAccountID?: number;

    /** Person who created the action */
    person?: Person[];

    /** ISO-formatted datetime */
    created?: string;

    /** report action message */
    message?: Message[];

    /** Whether we have received a response back from the server */
    isLoading?: boolean;

    /** Error message that's come back from the server. */
    error?: string;

    /** accountIDs of the people to which the whisper was sent to (if any). Returns empty array if it is not a whisper */
    whisperedToAccountIDs?: number[];

    avatar?: string;
    automatic?: boolean;
    shouldShow?: boolean;
    childReportID?: string;
    childType?: string;
    childOldestFourEmails?: string;
    childOldestFourAccountIDs?: string;
    childCommenterCount?: number;
    childLastVisibleActionCreated?: string;
    childVisibleActionCount?: number;
    parentReportID?: string;
    childReportName?: string;
    childManagerAccountID?: number;
    childStatusNum?: ValueOf<typeof CONST.REPORT.STATUS>;
    childStateNum?: ValueOf<typeof CONST.REPORT.STATE_NUM>;
    pendingAction?: OnyxCommon.PendingAction;
    childLastReceiptTransactionIDs?: string;
    childLastMoneyRequestComment?: string;
    childMoneyRequestCount?: number;
    isFirstItem?: boolean;
    isAttachment?: boolean;
    attachmentInfo?: (File & {source: string; uri: string}) | Record<string, never>;
    receipt?: Receipt;
};

type ReportAction = ReportActionBase & OriginalMessage;

export default ReportAction;
export type {Message};
