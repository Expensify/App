import type {SearchQueryString} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    excludedTransactionIDList?: string[];
    isBasicExport: boolean;
    exportColumnLabels: string;
    exportName: string;
    isGroupExport?: boolean;
    isGroupsOnly?: boolean;

    /** The violation names the search's own `violation:` filter allows, for a violation group export that also has expenses selected on their own */
    searchViolationNameList?: string[];
};

export default ExportSearchItemsToCSVParams;
