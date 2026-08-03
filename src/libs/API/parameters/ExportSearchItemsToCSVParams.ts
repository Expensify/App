import type {SearchQueryString} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    isBasicExport: boolean;
    exportColumnLabels: string;
    exportName: string;
    isGroupExport?: boolean;
};

export default ExportSearchItemsToCSVParams;
