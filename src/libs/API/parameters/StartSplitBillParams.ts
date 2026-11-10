import type {Receipt} from '@src/types/onyx/Transaction';

type StartSplitBillParams = {
    chatReportID: string;
    reportActionID: string;
    transactionID: string;
    splits: string;
    receipt: Receipt;
    comment: string;
    category: string;
    tag: string;
    currency: string;

    /** The amount, merchant and date the user typed in on the Scan confirmation. Left out, SmartScan fills them in from the receipt. */
    amount?: number;
    merchant?: string;
    created?: string;

    isFromGroupDM: boolean;
    createdReportActionID?: string;
    billable: boolean;
    reimbursable: boolean;
    chatType?: string;
    taxCode?: string;
    taxAmount?: number;
    description?: string;
};

export default StartSplitBillParams;
