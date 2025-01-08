import type {SearchQueryString, SearchStatus} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    query: SearchStatus;
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    policyIDs: (string | undefined)[] ;
};

export default ExportSearchItemsToCSVParams;
