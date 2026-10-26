import type {FormValue} from '@components/Form/types';

import type {BaseForm} from './Form';

/** Wise business onboarding form answers, keyed by field. The index admits the form's own state too, since the server's field errors are merged into it. */
type WiseBusinessOnboardingForm = BaseForm & Record<string, FormValue | BaseForm[keyof BaseForm]>;

// eslint-disable-next-line import/prefer-default-export
export type {WiseBusinessOnboardingForm};
