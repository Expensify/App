import CONST from '@src/CONST';
import type {DynamicFormFieldOption} from '@src/types/onyx';

const SOURCE_OF_WEALTH_LABELS: Record<string, string> = {
    [CONST.WISE.SOURCE_OF_WEALTH.REVENUE]: 'Business revenue',
    [CONST.WISE.SOURCE_OF_WEALTH.PERSONAL_FUNDING]: 'Personal funding',
    [CONST.WISE.SOURCE_OF_WEALTH.BUSINESS_LOAN]: 'Business loan',
    [CONST.WISE.SOURCE_OF_WEALTH.FUNDING_AND_SHAREHOLDER_INVESTMENTS]: 'Funding & shareholder investments',
    [CONST.WISE.SOURCE_OF_WEALTH.INVESTMENT_INCOME]: 'Investment income',
    [CONST.WISE.SOURCE_OF_WEALTH.DONATIONS]: 'Donations',
    [CONST.WISE.SOURCE_OF_WEALTH.GRANTS]: 'Grants',
    [CONST.WISE.SOURCE_OF_WEALTH.LEGAL]: 'Legal settlement',
};

function humanizeKey(key: string): string {
    const words = key.toLowerCase().replaceAll('_', ' ');
    return words.charAt(0).toUpperCase() + words.slice(1);
}

/** One option per Wise source of wealth, in Wise's order */
function getSourceOfWealthOptions(): DynamicFormFieldOption[] {
    return Object.values(CONST.WISE.SOURCE_OF_WEALTH).map((key) => ({key, label: SOURCE_OF_WEALTH_LABELS[key]}));
}

/** One option per document type Wise accepts as proof of source of wealth */
function getDocumentTypeOptions(): DynamicFormFieldOption[] {
    return Object.values(CONST.WISE.SOURCE_OF_WEALTH_DOCUMENT_TYPE).map((key) => ({key, label: humanizeKey(key)}));
}

export {getDocumentTypeOptions, getSourceOfWealthOptions};
