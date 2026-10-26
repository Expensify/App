import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {WiseBusinessOnboarding} from '@src/types/onyx/ReimbursementAccount';

import {deepEqual} from 'fast-equals';

/**
 * The onboarding answers the server holds, under the form's field keys. The representative's details are saved to the user's private personal details,
 * which the prefill reads, and the SSN and the ID files never come back.
 */
function getWiseSavedAnswers(wise: WiseBusinessOnboarding | undefined): DynamicFormValues {
    const business = wise?.business;
    if (!business) {
        return {};
    }
    return {
        companyRole: business.companyRole,
        industryCategories: business.industryCategories,
        description: business.description,
    };
}

/** The saved answers the draft does not match. What the server saved wins, since it may come from another device. */
function getOutdatedDraftAnswers(savedAnswers: DynamicFormValues, draft: DynamicFormValues): DynamicFormValues {
    return Object.fromEntries(Object.entries(savedAnswers).filter(([key, answer]) => answer !== undefined && !deepEqual(draft[key], answer)));
}

export default getWiseSavedAnswers;
export {getOutdatedDraftAnswers};
