import type {OnyxEntry} from 'react-native-onyx';
import type {Receipt} from '@src/types/onyx/Transaction';

type CategorizeTrackedExpenseParams = {
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
    receipt: OnyxEntry<Receipt>;
    taxCode: string;
    taxAmount: number;
    billable?: boolean;
};

export default CategorizeTrackedExpenseParams;
