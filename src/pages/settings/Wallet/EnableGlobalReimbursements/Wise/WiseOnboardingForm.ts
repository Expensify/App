import type {Country} from '@src/CONST';
import type {DynamicFormSchema} from '@src/types/onyx';

import US from './forms/US';

/** The business onboarding form of each supported country, one file per country under ./forms */
const WISE_ONBOARDING_FORM: Partial<Record<Country, DynamicFormSchema>> = {
    US,
};

export default WISE_ONBOARDING_FORM;
