import type {ValueOf} from 'type-fest';
import type CONST from '@src/CONST';

type Participant = {
    accountID?: number;
    login?: string;
    displayName?: string;
    isPolicyExpenseChat?: boolean;
    isOwnPolicyExpenseChat?: boolean;
    chatType?: ValueOf<typeof CONST.REPORT.CHAT_TYPE>;
    reportID?: string;
    policyID?: string;
    selected?: boolean;
    text?: string;
};

type Split = {
    email?: string;
    amount?: number;
    accountID?: number;
    chatReportID?: string;
    iouReportID?: string;
    reportActionID?: string;
    transactionID?: string;
    policyID?: string;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewReportActionID?: string;
};

type IOU = {
    id: string;
    amount?: number;
    /** Selected Currency Code of the current IOU */
    currency?: string;
    comment?: string;
    category?: string;
    merchant?: string;
    created?: string;
    receiptPath?: string;
    receiptFilename?: string;
    transactionID?: string;
    participants?: Participant[];
    tag?: string;
    billable?: boolean;
    isSplitRequest?: boolean;
};

export default IOU;
export type {Participant, Split};
