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
    isFromGroupDM: boolean;
    createdReportActionID?: string;
};

export default StartSplitBillParams;
