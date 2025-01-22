import type {Receipt} from '@src/types/onyx/Transaction';

type CategorizeTrackedExpenseParams = {
    amount: number;
    currency: string;
    comment: string;
    created: string;
    merchant: string;
    policyID: string | undefined;
    transactionID: string | undefined;
    moneyRequestPreviewReportActionID: string | undefined;
    moneyRequestReportID: string | undefined;
    moneyRequestCreatedReportActionID: string | undefined;
    actionableWhisperReportActionID: string | undefined;
    modifiedExpenseReportActionID: string;
    reportPreviewReportActionID: string | undefined;
    category?: string;
    tag?: string;
    receipt?: Receipt;
    taxCode: string;
    taxAmount: number;
    billable?: boolean;
};

export default CategorizeTrackedExpenseParams;
