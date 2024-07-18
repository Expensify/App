import type {SearchQuery} from '@src/types/onyx/SearchResults';

type ExportSearchItemsToCSVParams = {
    query: SearchQuery;
    reportIDList: string[];
    transactionIDList: string[];
    policyIDs: string[];
};

export default ExportSearchItemsToCSVParams;
