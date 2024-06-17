import type {Receipt} from '@src/types/onyx/Transaction';

type ShareTrackedExpenseParams = {
    amount: number;
    currency: string;
    comment: string;
    created: string;
    merchant: string;
    policyID: string;
    transactionID: string;
    moneyRequestPreviewReportActionID: string;
    moneyRequestReportID: string;
    moneyRequestCreatedReportActionID: string;
    actionableWhisperReportActionID: string;
    modifiedExpenseReportActionID: string;
    reportPreviewReportActionID: string;
    category?: string;
    tag?: string;
    receipt?: Receipt;
    taxCode: string;
    taxAmount: number;
    billable?: boolean;
};

export default ShareTrackedExpenseParams;
