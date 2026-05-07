import type {SearchColumnType, SearchQueryString, SearchStatus} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    query: SearchStatus;
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    isBasicExport: boolean;
    exportColumnLabels: Partial<Record<SearchColumnType, string>>;
};

export default ExportSearchItemsToCSVParams;
