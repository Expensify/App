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
