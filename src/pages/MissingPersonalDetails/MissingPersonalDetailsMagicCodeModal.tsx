import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import {clearDraftValues} from '@libs/actions/FormActions';
import {clearPersonalDetailsErrors} from '@libs/actions/PersonalDetails';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type MissingPersonalDetailsMagicCodeModalProps = {
    handleSubmitForm: (validateCode: string) => void;
    isValidateCodeActionModalVisible: boolean;
    onClose?: () => void;
};

function MissingPersonalDetailsMagicCodeModal({onClose, isValidateCodeActionModalVisible, handleSubmitForm}: MissingPersonalDetailsMagicCodeModalProps) {
    const {translate} = useLocalize();
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [cardList] = useOnyx(ONYXKEYS.CARD_LIST, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const privateDetailsErrors = privatePersonalDetails?.errors ?? undefined;
    const validateLoginError = getLatestError(privateDetailsErrors);
    const primaryLogin = account?.primaryLogin ?? '';
    const areAllCardsShipped = Object.values(cardList ?? {})?.every((card) => card?.state !== CONST.EXPENSIFY_CARD.STATE.STATE_NOT_ISSUED);

    const missingDetails =
        !privatePersonalDetails?.legalFirstName ||
        !privatePersonalDetails?.legalLastName ||
        !privatePersonalDetails?.dob ||
        !privatePersonalDetails?.phoneNumber ||
        isEmptyObject(privatePersonalDetails?.addresses) ||
        privatePersonalDetails.addresses.length === 0;

    useEffect(() => {
        if (missingDetails || !!privateDetailsErrors || !areAllCardsShipped) {
            return;
        }

        clearDraftValues(ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM);
        Navigation.goBack();
    }, [missingDetails, privateDetailsErrors, areAllCardsShipped]);

    const onBackButtonPress = () => {
        onClose?.();
    };

    const clearError = () => {
        if (isEmptyObject(validateLoginError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearPersonalDetailsErrors();
    };

    return (
        <ValidateCodeActionModal
            clearError={clearError}
            onClose={onBackButtonPress}
            validateCodeActionErrorField="personalDetails"
            validateError={validateLoginError}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('cardPage.validateCardTitle')}
            descriptionPrimary={translate('cardPage.enterMagicCode', {contactMethod: primaryLogin})}
            sendValidateCode={() => requestValidateCodeAction()}
            handleSubmitForm={handleSubmitForm}
            isLoading={privatePersonalDetails?.isLoading}
        />
    );
}

MissingPersonalDetailsMagicCodeModal.displayName = 'MissingPersonalDetailsMagicCodeModal';

export default MissingPersonalDetailsMagicCodeModal;
