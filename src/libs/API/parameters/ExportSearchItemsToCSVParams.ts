import type {SearchQueryString, SearchStatus} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    query: SearchStatus;
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    excludedTransactionIDList?: string[];
    isBasicExport: boolean;
    exportColumnLabels: string;
    exportName: string;
};

export default ExportSearchItemsToCSVParams;
