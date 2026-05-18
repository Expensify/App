import type {SearchQueryString} from '@components/Search/types';

type ExportSearchWithTemplateParams = {
    templateName: string;
    templateType: string;
    jsonQuery: SearchQueryString;
    reportIDList: string[];
    transactionIDList: string[];
    policyID: string | undefined;
};

export default ExportSearchWithTemplateParams;
