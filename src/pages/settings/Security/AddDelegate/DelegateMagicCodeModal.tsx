import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import * as User from '@libs/actions/User';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as Delegate from '@userActions/Delegate';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

type DelegateMagicCodeModalProps = {
    login: string;
    role: ValueOf<typeof CONST.DELEGATE_ROLE>;
    isValidateCodeActionModalVisible: boolean;
    onClose?: () => void;
    shouldHandleNavigationBack?: boolean;
};

function DelegateMagicCodeModal({login, role, onClose, isValidateCodeActionModalVisible, shouldHandleNavigationBack}: DelegateMagicCodeModalProps) {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);
    const addDelegateErrors = account?.delegatedAccess?.errorFields?.addDelegate?.[login];
    const validateLoginError = ErrorUtils.getLatestError(addDelegateErrors);

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.email || !!addDelegateErrors) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.navigate(ROUTES.SETTINGS_SECURITY);
    }, [login, currentDelegate, role, addDelegateErrors]);

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
            shouldHandleNavigationBack={shouldHandleNavigationBack}
            clearError={clearError}
            onClose={onBackButtonPress}
            validateError={validateLoginError}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => User.requestValidateCodeAction()}
            hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
            handleSubmitForm={(validateCode) => Delegate.addDelegate(login, role, validateCode)}
            descriptionPrimary={translate('delegate.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
        />
    );
}

DelegateMagicCodeModal.displayName = 'DelegateMagicCodeModal';

export default DelegateMagicCodeModal;
