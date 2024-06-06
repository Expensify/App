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
    chatType?: string;
    taxCode?: string;
    taxAmount?: number;
};

export default StartSplitBillParams;
