import type {DynamicFormValues} from '@components/DynamicForm/types';

import {getAnsweredSources, getStringList} from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/kycRequirementAttributes';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

/** The daily operations page's key. It saves under the BUSINESS_SOURCE_OF_WEALTH_INFO step with the sources page. */
const SOURCE_OF_FUNDS_PAGE_KEY = 'BUSINESS_SOURCE_OF_FUNDS';

/** Which of the picked sources fund the business's daily operations. A lone source funds them, so the page asks only when several are picked. */
function getSourceOfFundsPage(attributes: WiseKYCRequirement['attributes'], answers: DynamicFormValues): DynamicFormPage {
    const pickedSources = getAnsweredSources(attributes, answers[CONST.WISE.SOURCE_OF_WEALTH_INFO_KEY]);
    return {
        key: SOURCE_OF_FUNDS_PAGE_KEY,
        descriptionKey: 'walletPage.wiseOnboarding.sourceOfFunds.description',
        content:
            pickedSources.length > 1
                ? [
                      {
                          key: CONST.WISE.SOURCE_OF_FUNDS_KEY,
                          type: 'multiselect',
                          required: true,
                          labelKey: 'walletPage.wiseOnboarding.sourceOfFunds.label',
                          values: pickedSources.map((key) => ({key, labelKey: `walletPage.wiseOnboarding.sourceOfWealth.options.${key}` as const})),
                      },
                  ]
                : [],
    };
}

/** The daily operations answer that still holds once the picked sources change: the sources it named that are still picked, or the lone picked source */
function getKeptSourceOfFunds(pickedSources: unknown, sourceOfFunds: unknown): string[] {
    const sources = getStringList(pickedSources);
    if (sources.length === 1) {
        return sources;
    }
    return getStringList(sourceOfFunds).filter((source) => sources.includes(source));
}

export default getSourceOfFundsPage;
export {getKeptSourceOfFunds, SOURCE_OF_FUNDS_PAGE_KEY};
