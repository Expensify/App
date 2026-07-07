import type {SearchQueryString} from '@components/Search/types';

type ExportSearchWithTemplateParams = {
    templateName: string;
    templateType: string;
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    /** When "select all matching" is active, the IDs the user explicitly excluded so the backend skips them. */
    excludedTransactionIDList?: string[];
    policyID: string | undefined;
    exportName: string;
};

export default ExportSearchWithTemplateParams;
