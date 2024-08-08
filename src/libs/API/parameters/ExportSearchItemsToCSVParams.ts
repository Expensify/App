import type {ExpenseSearchStatus} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    query: ExpenseSearchStatus;
    reportIDList: string[];
    transactionIDList: string[];
    policyIDs: string[];
};

export default ExportSearchItemsToCSVParams;
