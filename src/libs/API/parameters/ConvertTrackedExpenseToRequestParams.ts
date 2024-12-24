import type {Receipt} from '@src/types/onyx/Transaction';

type ConvertTrackedExpenseToRequestParams = {
    amount: number;
    currency: string;
    created: string;
    comment?: string;
    merchant?: string;
    payerAccountID: number;
    chatReportID: string;
    transactionID: string;
    actionableWhisperReportActionID: string;
    createdChatReportActionID: string | undefined;
    receipt?: Receipt;
    moneyRequestReportID: string;
    moneyRequestCreatedReportActionID: string | undefined;
    moneyRequestPreviewReportActionID: string;
    reportPreviewReportActionID: string;
};

export default ConvertTrackedExpenseToRequestParams;
