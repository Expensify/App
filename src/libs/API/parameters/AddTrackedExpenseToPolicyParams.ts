import type {Receipt} from '@src/types/onyx/Transaction';

type AddTrackedExpenseToPolicyParams = {
    amount: number;
    currency: string;
    created: string;
    comment?: string;
    merchant?: string;
    category: string | undefined;
    tag: string | undefined;
    taxCode: string;
    taxAmount: number;
    reimbursable: boolean;
    billable: boolean | undefined;
    receipt: Receipt | undefined;
    waypoints?: string;
    customUnitRateID?: string;
    policyID: string;
    transactionID: string;
    actionableWhisperReportActionID: string | undefined;
    moneyRequestReportID: string;
    reportPreviewReportActionID: string;
    modifiedExpenseReportActionID: string;
    moneyRequestCreatedReportActionID: string | undefined;
    moneyRequestPreviewReportActionID: string;
};

export default AddTrackedExpenseToPolicyParams;
