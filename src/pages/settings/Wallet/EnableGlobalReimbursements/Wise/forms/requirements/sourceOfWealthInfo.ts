import {getAcceptedSources} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementAttributes';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

/** Where the company's money comes from, out of the sources Wise accepts */
function getSourceOfWealthInfoPage(attributes: WiseKYCRequirement['attributes']): DynamicFormPage {
    return {
        key: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO,
        descriptionKey: 'walletPage.wiseOnboarding.sourceOfWealth.description',
        content: [
            {
                key: CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY,
                type: 'multiselect',
                required: true,
                labelKey: 'walletPage.wiseOnboarding.sourceOfWealth.label',
                values: getAcceptedSources(attributes).map((key) => ({key, labelKey: `walletPage.wiseOnboarding.sourceOfWealth.options.${key}` as const})),
            },
        ],
    };
}

export default getSourceOfWealthInfoPage;
