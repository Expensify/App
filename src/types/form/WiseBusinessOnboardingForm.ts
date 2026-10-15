import type {FormValue} from '@components/Form/types';

import type {BaseForm} from './Form';

/** Answers of the Wise business onboarding form, keyed by the field keys of the country's form file */
type WiseBusinessOnboardingForm = BaseForm & Record<string, FormValue>;

// eslint-disable-next-line import/prefer-default-export
export type {WiseBusinessOnboardingForm};
