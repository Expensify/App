import type {SearchStatus} from '@components/Search/types';

type ExportSearchItemsToCSVParams = {
    query: SearchStatus;
    reportIDList: string[];
    transactionIDList: string[];
    policyIDs: string[];
};

export default ExportSearchItemsToCSVParams;
