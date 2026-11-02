import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';

/** Where the company's money comes from. The field key is Wise's, so the server forwards the answer as it is. */
const sourceOfWealthInfoPage: DynamicFormPage = {
    key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO,
    descriptionKey: 'walletPage.wiseOnboarding.sourceOfWealth.description',
    content: [
        {
            key: 'businessSourceOfWealthInfo',
            type: 'multiselect',
            required: true,
            labelKey: 'walletPage.wiseOnboarding.sourceOfWealth.label',
            values: Object.values(CONST.WISE.SOURCE_OF_WEALTH).map((key) => ({key, labelKey: `walletPage.wiseOnboarding.sourceOfWealth.options.${key}` as const})),
        },
    ],
};

export default sourceOfWealthInfoPage;
