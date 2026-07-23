import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrimaryContactMethod from '@hooks/usePrimaryContactMethod';

import {getLatestErrorMessageField} from '@libs/ErrorUtils';

import {requestValidateCodeAction} from '@userActions/User';
import {clearWalletAdditionalDetailsErrors} from '@userActions/Wallet';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React from 'react';

type WalletMagicCodePromptProps = {
    /** Called with the entered magic code to confirm the phone number change */
    onConfirm: (validateCode: string) => void;

    /** Called when the prompt is dismissed */
    onClose: () => void;
};

/** Magic code prompt shown in the wallet KYC flows when changing the phone number used for card 3DS verification */
function WalletMagicCodePrompt({onConfirm, onClose}: WalletMagicCodePromptProps) {
    const {translate} = useLocalize();
    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const [formData] = useOnyx(ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS);
    const primaryLogin = usePrimaryContactMethod();

    return (
        <ValidateCodeActionContent
            validateCodeActionErrorField={CONST.WALLET.VALIDATE_CODE_ERROR_FIELD}
            handleSubmitForm={onConfirm}
            isLoading={formData?.isLoading}
            title={translate('delegate.makeSureItIsYou')}
            descriptionPrimary={translate('contacts.enterMagicCode', primaryLogin ?? '')}
            sendValidateCode={() => requestValidateCodeAction()}
            validateError={getLatestErrorMessageField(walletAdditionalDetails)}
            clearError={clearWalletAdditionalDetailsErrors}
            onClose={onClose}
        />
    );
}

export default WalletMagicCodePrompt;
