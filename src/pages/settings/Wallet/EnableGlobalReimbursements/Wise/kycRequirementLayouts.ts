import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

import sourceOfWealthInfoPage from './forms/requirements/sourceOfWealthInfo';
import sourceOfWealthProofPage from './forms/requirements/sourceOfWealthProof';

/** The pages the App draws itself, by Wise's requirement key. The server sends only the keys, and Wise's embedded page collects every other one. */
const KYC_REQUIREMENT_LAYOUTS: Partial<Record<string, DynamicFormPage>> = {
    [CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO]: sourceOfWealthInfoPage,
    [CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF]: sourceOfWealthProofPage,
};

/** The App's page for a requirement, or undefined when only Wise's embedded page can collect it */
function getKYCRequirementPage(requirement: WiseKYCRequirement): DynamicFormPage | undefined {
    if (requirement.isHostedOnly) {
        return undefined;
    }
    return KYC_REQUIREMENT_LAYOUTS[requirement.key];
}

export default getKYCRequirementPage;
