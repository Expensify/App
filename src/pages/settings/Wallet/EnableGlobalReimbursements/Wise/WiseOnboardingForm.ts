import type {Country} from '@src/CONST';
import CONST from '@src/CONST';
import type {DynamicFormPage, DynamicFormSchema, WiseKYCRequirement} from '@src/types/onyx';

import US from './forms/US';
import {getKYCRequirementPage} from './kycRequirementLayouts';

/** The profile pages of each supported country, one file per country under ./forms */
const WISE_ONBOARDING_FORM: Partial<Record<Country, DynamicFormSchema>> = {
    US,
};

/** The intake form for a country: its profile pages, then a page for each KYC requirement the server says to collect before Submit */
function getWiseOnboardingForm(country: Country, requirements: WiseKYCRequirement[] | undefined): DynamicFormSchema | undefined {
    const form = WISE_ONBOARDING_FORM[country];
    if (!form || !('pages' in form)) {
        return form;
    }
    const preCollectedPages = (requirements ?? [])
        .filter((requirement) => requirement.requestedBy === CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY.EXPENSIFY)
        .map(getKYCRequirementPage)
        .filter((page): page is DynamicFormPage => !!page);
    return {pages: [...form.pages, ...preCollectedPages]};
}

export default WISE_ONBOARDING_FORM;
export {getWiseOnboardingForm};
