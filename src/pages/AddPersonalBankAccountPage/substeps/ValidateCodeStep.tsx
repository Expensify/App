import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
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

import {CONST as COMMON_CONST} from 'expensify-common';

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

    // Once the bank account is added, the page moves on to the success step. The success step is pushed on top of this one, so going back from it lands here, where the code
    // form would send another magic code.
    if (personalBankAccount?.shouldShowSuccess) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterSecurityCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS})}
            validateCodeReasonCode={COMMON_CONST.VALIDATE_CODE_REASONS.UPDATE_PERSONAL_DETAILS}
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
