import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import * as FormActions from '@libs/actions/FormActions';
import {requestValidateCodeAction} from '@libs/actions/User';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Delegate from '@userActions/Delegate';
import ONYXKEYS from '@src/ONYXKEYS';

type MissingPersonalDetailsMagicCodeModalProps = {
    handleSubmitForm: (validateCode: string) => void;
    isValidateCodeActionModalVisible: boolean;
    onClose?: () => void;
};

function MissingPersonalDetailsMagicCodeModal({onClose, isValidateCodeActionModalVisible, handleSubmitForm}: MissingPersonalDetailsMagicCodeModalProps) {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const validateLoginError = ErrorUtils.getLatestError();
    const privateDetailValidated = privatePersonalDetails?.validated;
    const primaryLogin = account?.primaryLogin ?? '';
    useEffect(() => {
        if (!privateDetailValidated) {
            return;
        }

        FormActions.clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.goBack();
    }, [privateDetailValidated]);

    const sendValidateCode = () => {
        if (validateCodeAction?.validateCodeSent) {
            return;
        }

        requestValidateCodeAction();
    };

    const onBackButtonPress = () => {
        onClose?.();
    };

    const clearError = () => {
        if (!validateLoginError) {
            return;
        }
        Delegate.clearDelegateErrorsByField(currentDelegate?.email ?? '', 'addDelegate');
    };
 
    return (
        <ValidateCodeActionModal
            clearError={clearError}
            onClose={onBackButtonPress}
            validateError={validateLoginError}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            sendValidateCode={sendValidateCode}
            hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
            handleSubmitForm={handleSubmitForm}
        />
    );
}

MissingPersonalDetailsMagicCodeModal.displayName = 'MissingPersonalDetailsMagicCodeModal';

export default MissingPersonalDetailsMagicCodeModal;
