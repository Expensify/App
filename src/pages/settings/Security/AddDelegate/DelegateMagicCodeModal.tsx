import React, {useEffect, useState} from 'react';
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
    login: string,
    role: ValueOf<typeof CONST.DELEGATE_ROLE>
}

function DelegateMagicCodeModal({login, role}: DelegateMagicCodeModalProps) {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(true);

    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);
    const validateLoginError = ErrorUtils.getLatestErrorField(currentDelegate, 'addDelegate');

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.email || !!currentDelegate.errorFields?.addDelegate) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.dismissModal();
    }, [login, currentDelegate, role]);

    const onBackButtonPress = () => {
        setIsValidateCodeActionModalVisible(false);
        Navigation.goBack(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(login, role));
    };

    const clearError = () => {
        if (!validateLoginError) {
            return;
        }
        Delegate.clearAddDelegateErrors(currentDelegate?.email ?? '', 'addDelegate');
    };

    return (
        <ValidateCodeActionModal
            clearError={clearError}
            onClose={onBackButtonPress}
            validateError={validateLoginError}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => User.requestValidateCodeAction()}
            handleSubmitForm={(validateCode) => Delegate.addDelegate(login, role, validateCode)}
            description={translate('delegate.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
        />
    );
}

DelegateMagicCodeModal.displayName = 'DelegateMagicCodeModal';

export default DelegateMagicCodeModal;
