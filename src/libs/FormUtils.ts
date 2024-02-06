import type {OnyxFormKeyWithoutDraft} from '@components/Form/types';
import CONST from '@src/CONST';
import type {Account} from '@src/types/onyx';

const isValidateCodeFormSubmitting = (account: Account) =>
    account.isLoading && account.loadingForm === (account.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM);

function getDraftKey(formID: OnyxFormKeyWithoutDraft): `${OnyxFormKeyWithoutDraft}Draft` {
    return `${formID}Draft`;
}

export default {getDraftKey, isValidateCodeFormSubmitting};
