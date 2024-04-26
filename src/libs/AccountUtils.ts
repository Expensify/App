import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {Account} from '@src/types/onyx';

const isValidateCodeFormSubmitting = (account: OnyxEntry<Account>) =>
    !!account?.isLoading && account.loadingForm === (account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM);

const isAccountIDOddNumber = (accountID: number) => accountID % 2 === 1;

export default {isValidateCodeFormSubmitting, isAccountIDOddNumber};
