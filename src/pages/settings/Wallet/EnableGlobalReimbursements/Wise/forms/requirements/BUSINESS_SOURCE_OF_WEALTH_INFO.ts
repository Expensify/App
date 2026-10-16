import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';

import {getSourceOfWealthOptions} from './sourceOfWealthOptions';

/** Where the company's money comes from. The page key is Wise's requirement type, so the answer saves under requirements and Submit forwards it. */
const BUSINESS_SOURCE_OF_WEALTH_INFO: DynamicFormPage = {
    key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO,
    title: "Where does your company's money come from?",
    content: [{key: 'businessSourceOfWealthInfo', type: 'radio', required: true, label: 'Source of funds', values: getSourceOfWealthOptions()}],
};

export default BUSINESS_SOURCE_OF_WEALTH_INFO;
