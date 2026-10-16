import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';

import {getDocumentTypeOptions, getSourceOfWealthOptions} from './sourceOfWealthOptions';

/** A document proving the source of wealth. It asks the source again so the page stands alone when Wise asks for proof after Submit. */
const BUSINESS_SOURCE_OF_WEALTH_PROOF: DynamicFormPage = {
    key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF,
    title: 'Source of funds document',
    content: [
        {key: 'sourceOfWealthType', type: 'select', required: true, label: 'Source of funds', values: getSourceOfWealthOptions()},
        {key: 'documentType', type: 'select', required: true, label: 'Document type', values: getDocumentTypeOptions()},
        {key: 'proofFile', type: 'file', required: true, maxFiles: 2, label: 'Source of funds document'},
    ],
};

export default BUSINESS_SOURCE_OF_WEALTH_PROOF;
