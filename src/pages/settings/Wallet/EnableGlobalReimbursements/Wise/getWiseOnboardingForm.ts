/** Builds the Wise business onboarding form from the US profile pages and the KYC requirements the App collects itself, and maps its URL pages back to save steps */

import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import getVisibleFields from '@components/DynamicForm/utils/getVisibleFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

import {SOURCE_OF_FUNDS_PAGE_KEY} from './forms/requirements/sourceOfFunds';
import US from './forms/US';
import getKYCRequirementPages from './kycRequirementLayouts';

type WiseOnboardingForm = {pages: DynamicFormPage[]};

/** Pages saved under another page's step, since the server takes one step per requirement */
const STEP_BY_PAGE_KEY: Partial<Record<string, string>> = {
    [SOURCE_OF_FUNDS_PAGE_KEY]: CONST.WISE.KYC_REQUIREMENT.BUSINESS_SOURCE_OF_WEALTH_INFO,
};

/**
 * The US profile pages, then the pages of each requirement Expensify asks for before Submit, such as enhanced due diligence for a high-risk industry.
 * A requirement's pages can depend on the answers so far, such as the daily operations page listing the picked sources.
 */
function getWiseOnboardingForm(kycRequirements: WiseKYCRequirement[] | undefined, answers: DynamicFormValues = {}): WiseOnboardingForm {
    const requirementPages = (kycRequirements ?? [])
        .filter((requirement) => requirement.requestedBy === CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY.EXPENSIFY)
        .flatMap((requirement) => getKYCRequirementPages(requirement, answers));
    return {pages: [...US.pages, ...requirementPages]};
}

/** The flow names its pages by URL-safe keys, so a page is mapped back to its schema key, and from there to the step the server saves it under */
function getOnboardingStep(form: WiseOnboardingForm, routePageKey: string): string {
    const pageIndex = getPages(form).findIndex((page) => page.key === routePageKey);
    const pageKey = pageIndex === -1 ? routePageKey : (form.pages.at(pageIndex)?.key ?? routePageKey);
    return STEP_BY_PAGE_KEY[pageKey] ?? pageKey;
}

function hasAnswer(answer: DynamicFormValues[string]): boolean {
    return !!answer && !(Array.isArray(answer) && answer.length === 0);
}

/** The URL-safe key of the first requirement page with a required question the user sees and has not answered, such as a picked source of funds with no document */
function getFirstUnansweredRequirementPageKey(form: WiseOnboardingForm, answers: DynamicFormValues): string | undefined {
    const pages = getPages(form);
    const allFields = getAllFields(pages);
    return pages
        .slice(US.pages.length)
        .find((page) =>
            getVisibleFields(getContentFields(page.content).filter(isSupportedField), answers, allFields).some(
                (field) => field.required && getAnswerKeys(field).every((key) => !hasAnswer(answers[key])),
            ),
        )?.key;
}

export default getWiseOnboardingForm;
export {getFirstUnansweredRequirementPageKey, getOnboardingStep};
