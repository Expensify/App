import type {FormValue} from '@components/Form/types';

import type {BaseForm} from './Form';

/** Wise business onboarding form answers, keyed by field */
type WiseBusinessOnboardingForm = BaseForm & Record<string, FormValue>;

// eslint-disable-next-line import/prefer-default-export
export type {WiseBusinessOnboardingForm};
