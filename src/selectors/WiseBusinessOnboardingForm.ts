import type {WiseBusinessOnboardingForm} from '@src/types/form';

import type {OnyxEntry} from 'react-native-onyx';

/** The bank account the Wise onboarding draft holds answers for */
const wiseBusinessOnboardingDraftBankAccountIDSelector = (draft: OnyxEntry<WiseBusinessOnboardingForm>) => (typeof draft?.bankAccountID === 'string' ? draft.bankAccountID : undefined);

// eslint-disable-next-line import/prefer-default-export -- additional selectors may be added here
export {wiseBusinessOnboardingDraftBankAccountIDSelector};
