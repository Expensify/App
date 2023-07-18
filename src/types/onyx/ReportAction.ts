type Message = {
    /** The type of the action item fragment. Used to render a corresponding component */
    type: string;

    /** The text content of the fragment. */
    text: string;

    /** Used to apply additional styling. Style refers to a predetermined constant and not a class name. e.g. 'normal'
     * or 'strong'
     */
    style: string;

    /** ID of a report */
    reportID: string;

    /** ID of a policy */
    policyID: string;

    /** The target of a link fragment e.g. '_blank' */
    target: string;

    /** The destination of a link fragment e.g. 'https://www.expensify.com' */
    href: string;

    /** An additional avatar url - not the main avatar url but used within a message. */
    iconUrl: string;

    /** Fragment edited flag */
    isEdited: boolean;
};

type OriginalMessage = {
    /** The ID of the iou transaction */
    IOUTransactionID?: string;

    IOUReportID?: number;
    amount?: number;
    comment?: string;
    currency?: string;
    lastModified?: string;
    participantAccountIDs?: number[];
    participants?: string[];
    type?: string;
};

type Person = {
    type?: string;
    style?: string;
    text?: string;
};

type ReportAction = {
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID?: string;

    actorAccountID?: number;

    /** Name of the action e.g. ADDCOMMENT */
    actionName?: string;

    /** Person who created the action */
    person?: Person[];

    /** ISO-formatted datetime */
    created?: string;

    /** report action message */
    message?: Message[];

    /** Original message associated with this action */
    originalMessage?: OriginalMessage;

    /** Whether we have received a response back from the server */
    isLoading?: boolean;

    /** Error message that's come back from the server. */
    error?: string;

    /** accountIDs of the people to which the whisper was sent to (if any). Returns empty array if it is not a whisper */
    whisperedToAccountIDs: number[];

    avatar?: string;
    automatic?: boolean;
    shouldShow?: boolean;
    childReportID?: number;
    childType?: string;
    childOldestFourEmails?: string;
    childOldestFourAccountIDs?: string;
    childCommenterCount?: number;
    childLastVisibleActionCreated?: string;
    childVisibleActionCount?: number;
};

export default ReportAction;
