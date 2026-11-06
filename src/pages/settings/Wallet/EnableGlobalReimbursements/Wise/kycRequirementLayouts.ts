import type {DynamicFormValues} from '@components/DynamicForm/types';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

import getSourceOfFundsPage from './forms/requirements/sourceOfFunds';
import getSourceOfWealthInfoPage from './forms/requirements/sourceOfWealthInfo';
import getSourceOfWealthProofPage from './forms/requirements/sourceOfWealthProof';

type KYCRequirementLayout = (attributes: WiseKYCRequirement['attributes'], answers: DynamicFormValues) => DynamicFormPage[];

/** The pages the App draws itself, by Wise's requirement key, built from the requirement's attributes and the answers so far. The server sends no layout, and Wise's embedded page collects every other requirement. */
const KYC_REQUIREMENT_LAYOUTS: Partial<Record<string, KYCRequirementLayout>> = {
    [CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO]: (attributes, answers) => [getSourceOfWealthInfoPage(attributes), getSourceOfFundsPage(attributes, answers)],
    [CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF]: (attributes) => [getSourceOfWealthProofPage(attributes)],
};

/** The App's pages for a requirement, none when only Wise's embedded page can collect it */
function getKYCRequirementPages(requirement: WiseKYCRequirement, answers: DynamicFormValues): DynamicFormPage[] {
    if (requirement.isHostedOnly) {
        return [];
    }
    return KYC_REQUIREMENT_LAYOUTS[requirement.key]?.(requirement.attributes, answers) ?? [];
}

export default getKYCRequirementPages;
