type Participant = {
    accountID: number;
    login?: string;
    isPolicyExpenseChat?: boolean;
    isOwnPolicyExpenseChat?: boolean;
    selected?: boolean;
    reportID?: string;
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
