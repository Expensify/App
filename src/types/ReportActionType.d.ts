import ReportActionFragmentType from './ReportActionFragmentType';

type ReportActionType = {
    /** The ID of the reportAction. It is the string representation of the a 64-bit integer. */
    reportActionID: string;

    /** Name of the action e.g. ADDCOMMENT */
    actionName: string;

    /** Person who created the action */
    person: ReportActionFragmentType[];

    /** ISO-formatted datetime */
    created: string;

    /** report action message */
    message: ReportActionFragmentType[];

    /** Original message associated with this action */
    originalMessage: {
        // The ID of the iou transaction
        IOUTransactionID: string;
    };

    /** Whether we have received a response back from the server */
    isLoading: boolean;

    /** Error message that's come back from the server. */
    error: string;

    /** Emails of the people to which the whisper was sent to (if any). Returns empty array if it is not a whisper */
    whisperedTo: string[];
};

export default ReportActionType;
