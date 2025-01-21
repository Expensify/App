import type {Receipt} from '@src/types/onyx/Transaction';

type AddTrackedExpenseToPolicyParams = {
    amount: number;
    currency: string;
    created: string;
    comment?: string;
    merchant?: string;
    receipt: Receipt | undefined;
    category: string | undefined;
    tag: string | undefined;
    taxCode: string;
    taxAmount: number;
    billable: boolean | undefined;
    linkedTrackedExpenseReportID: string;
    policyID: string | undefined;
    chatReportID: string;
    transactionID: string;
    actionableWhisperReportActionID: string;
    moneyRequestReportID: string;
    reportPreviewReportActionID: string;
};

export default AddTrackedExpenseToPolicyParams;
