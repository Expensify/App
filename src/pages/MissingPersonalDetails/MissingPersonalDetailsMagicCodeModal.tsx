import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import {clearDraftValues} from '@libs/actions/FormActions';
import {clearPersonalDetailsErrors} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

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
    const privateDetailsErrors = privatePersonalDetails?.errors ?? undefined;
    const validateLoginError = getLatestError(privateDetailsErrors);
    const primaryLogin = account?.primaryLogin ?? '';

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    useEffect(() => {
        if (missingDetails || !!privateDetailsErrors) {
            return;
        }

        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.goBack();
    }, [missingDetails, privateDetailsErrors]);

    const onBackButtonPress = () => {
        onClose?.();
    };

    const clearError = () => {
        if (!validateLoginError) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    return (
        <ValidateCodeActionModal
            clearError={clearError}
            onClose={onBackButtonPress}
            validateError={validateLoginError}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            sendValidateCode={() => requestValidateCodeAction()}
            hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
            handleSubmitForm={handleSubmitForm}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

MissingPersonalDetailsMagicCodeModal.displayName = 'MissingPersonalDetailsMagicCodeModal';

export default MissingPersonalDetailsMagicCodeModal;
