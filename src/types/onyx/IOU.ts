import {Icon} from './OnyxCommon';

type Participant = {
    accountID?: number;
    login?: string;
    email?: string;
    isPolicyExpenseChat?: boolean;
    chatReportID?: string;
    isOwnPolicyExpenseChat?: boolean;
    selected?: boolean;
    reportID?: string;
    policyID?: string;
    displayName?: string;
    alternateText?: string;
    firstName?: string;
    icons?: Icon[];
    keyForList?: string;
    lastName?: string;
    phoneNumber?: string;
    searchText?: string;
    text?: string;
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
export type {Participant};
