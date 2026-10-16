import CONST from '@src/CONST';
import type {DynamicFormPage, WiseKYCRequirement} from '@src/types/onyx';

import BUSINESS_SOURCE_OF_WEALTH_INFO from './forms/requirements/BUSINESS_SOURCE_OF_WEALTH_INFO';
import BUSINESS_SOURCE_OF_WEALTH_PROOF from './forms/requirements/BUSINESS_SOURCE_OF_WEALTH_PROOF';

type KYCRequirementLayout = (attributes?: WiseKYCRequirement['attributes']) => DynamicFormPage;

/** One page per Wise KYC requirement type the App can collect itself. Wise sends the key; the layout lives here. A type without a layout opens Wise's embedded page. */
const KYC_REQUIREMENT_LAYOUTS: Record<string, KYCRequirementLayout> = {
    [CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO]: () => BUSINESS_SOURCE_OF_WEALTH_INFO,
    [CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_PROOF]: () => BUSINESS_SOURCE_OF_WEALTH_PROOF,
};

/** The page that collects a requirement Wise asked for, or undefined when only Wise's own page can */
function getKYCRequirementPage(requirement: WiseKYCRequirement): DynamicFormPage | undefined {
    if (requirement.hostedOnly) {
        return undefined;
    }
    return KYC_REQUIREMENT_LAYOUTS[requirement.key]?.(requirement.attributes);
}

export default KYC_REQUIREMENT_LAYOUTS;
export {getKYCRequirementPage};
