import type { Transaction } from "@src/types/onyx";
import type { OnyxEntry } from "react-native-onyx";

type MergeDuplicatesParams = {
    transaction: OnyxEntry<Transaction>;
    transactionList: Transaction[];
    created: string;
    merchant: string;
    amount: number;
    currency: string;
    category: string;
    comment: string;
    billable: boolean;
    reimbursable: boolean;
    tag: string;
    receiptID: number;
    reportID: string | undefined;
    reportActionID?: string | undefined;
    transactionThreadReportID?: string;
    createdReportActionIDForThread?: string;
};

export default MergeDuplicatesParams;
