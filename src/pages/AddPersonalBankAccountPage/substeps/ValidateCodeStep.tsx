import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {getLatestErrorMessageField} from '@libs/ErrorUtils';

import {clearPersonalBankAccountErrors} from '@userActions/BankAccounts';
import {requestValidateCodeAction} from '@userActions/User';

import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

function ValidateCodeStep({onNext, prevPage}: SubPageProps) {
    const {translate} = useLocalize();
    const primaryLogin = usePrimaryContactMethod();
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);

    const submitError = getLatestErrorMessageField(personalBankAccount);

    const clearError = () => {
        if (isEmptyObject(submitError)) {
            return;
        }
        clearPersonalBankAccountErrors();
    };

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateCodeActionErrorField="addPersonalBankAccount"
            handleSubmitForm={onNext}
            validateError={submitError}
            clearError={clearError}
            onClose={prevPage}
            isLoading={personalBankAccount?.isLoading}
        />
    );
}

ValidateCodeStep.displayName = 'ValidateCodeStep';

export default ValidateCodeStep;
