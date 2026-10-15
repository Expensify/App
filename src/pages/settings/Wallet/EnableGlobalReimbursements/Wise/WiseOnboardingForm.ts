import type CONST from '@src/CONST';
import type {DynamicFormSchema} from '@src/types/onyx';

import US from './forms/US';

type Country = keyof typeof CONST.ALL_COUNTRIES;

/** The business onboarding form of each supported country, one file per country under ./forms */
const WISE_ONBOARDING_FORM: Partial<Record<Country, DynamicFormSchema>> = {
    US,
};

export default WISE_ONBOARDING_FORM;
