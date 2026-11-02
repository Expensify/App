import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';
import {getPages} from '@components/DynamicForm/utils/paginate';

import CONST from '@src/CONST';
import type {DynamicFormPage} from '@src/types/onyx';
import type {WiseKYCRequirement} from '@src/types/onyx/WiseKYCReview';

import US from './forms/US';
import getKYCRequirementPage from './kycRequirementLayouts';

type WiseOnboardingForm = {pages: DynamicFormPage[]};

/** The US profile pages, then a page for each requirement Expensify asks for before Submit, such as enhanced due diligence for a high-risk industry */
function getWiseOnboardingForm(kycRequirements: WiseKYCRequirement[] | undefined): WiseOnboardingForm {
    const requirementPages = (kycRequirements ?? [])
        .filter((requirement) => requirement.requestedBy === CONST.WISE.KYC_REQUIREMENT_REQUESTED_BY.EXPENSIFY)
        .map(getKYCRequirementPage)
        .filter((page): page is DynamicFormPage => !!page);
    return {pages: [...US.pages, ...requirementPages]};
}

/** The flow names its pages by URL-safe keys, so a page is mapped back to its schema key, which is the step the server saves it under */
function getOnboardingStep(form: WiseOnboardingForm, routePageKey: string): string {
    const pageIndex = getPages(form).findIndex((page) => page.key === routePageKey);
    return pageIndex === -1 ? routePageKey : (form.pages.at(pageIndex)?.key ?? routePageKey);
}

function hasAnswer(answer: DynamicFormValues[string]): boolean {
    return !!answer && !(Array.isArray(answer) && answer.length === 0);
}

/** The URL-safe key of the first requirement page with no answer yet */
function getFirstUnansweredRequirementPageKey(form: WiseOnboardingForm, answers: DynamicFormValues): string | undefined {
    return getPages(form)
        .slice(US.pages.length)
        .find((page) =>
            getContentFields(page.content)
                .filter(isSupportedField)
                .flatMap(getAnswerKeys)
                .every((key) => !hasAnswer(answers[key])),
        )?.key;
}

export default getWiseOnboardingForm;
export {getFirstUnansweredRequirementPageKey, getOnboardingStep};
