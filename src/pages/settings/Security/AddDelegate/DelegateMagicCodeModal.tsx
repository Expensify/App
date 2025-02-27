import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {addDelegate, clearDelegateErrorsByField} from '@userActions/Delegate';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type DelegateMagicCodeModalProps = {
    login: string;
    role: ValueOf<typeof CONST.DELEGATE_ROLE>;
    isValidateCodeActionModalVisible: boolean;
    onClose?: () => void;
    shouldHandleNavigationBack?: boolean;
    disableAnimation?: boolean;
};

function DelegateMagicCodeModal({login, role, onClose, isValidateCodeActionModalVisible, shouldHandleNavigationBack, disableAnimation}: DelegateMagicCodeModalProps) {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);
    const addDelegateErrors = account?.delegatedAccess?.errorFields?.addDelegate?.[login];
    const validateLoginError = getLatestError(addDelegateErrors);

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.email || !!addDelegateErrors) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.goBack(ROUTES.SETTINGS_SECURITY);
    }, [login, currentDelegate, role, addDelegateErrors]);

    const onBackButtonPress = () => {
        onClose?.();
    };

    const clearError = () => {
        if (!validateLoginError) {
            return;
        }
        clearDelegateErrorsByField(currentDelegate?.email ?? '', 'addDelegate');
    };

    return (
        <ValidateCodeActionModal
            disableAnimation={disableAnimation}
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            clearError={clearError}
            onClose={onBackButtonPress}
            validateError={validateLoginError}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
            handleSubmitForm={(validateCode) => addDelegate(login, role, validateCode)}
            descriptionPrimary={translate('delegate.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
        />
    );
}

DelegateMagicCodeModal.displayName = 'DelegateMagicCodeModal';

export default DelegateMagicCodeModal;
