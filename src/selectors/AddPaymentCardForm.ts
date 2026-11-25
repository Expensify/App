import type {AddPaymentCardForm} from '@src/types/form';

import type {OnyxEntry} from 'react-native-onyx';

const isCardSetupCompleteSelector = (form: OnyxEntry<AddPaymentCardForm>) => !!form?.setupComplete;

// eslint-disable-next-line import/prefer-default-export -- Selectors for one Onyx key share a file and export by name.
export {isCardSetupCompleteSelector};
