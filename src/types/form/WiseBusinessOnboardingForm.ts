import type {FormValue} from '@components/Form/types';

import type {BaseForm} from './Form';

/** Answers of the Wise business onboarding form, keyed by field key */
type WiseBusinessOnboardingForm = BaseForm & Record<string, FormValue>;

// eslint-disable-next-line import/prefer-default-export
export type {WiseBusinessOnboardingForm};
