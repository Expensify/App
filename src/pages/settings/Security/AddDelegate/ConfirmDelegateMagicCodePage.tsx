import React, {useEffect} from 'react';
import type {ValueOf} from 'type-fest';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {requestValidateCodeAction} from '@libs/actions/User';
import {getLatestError} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {addDelegate, clearDelegateErrorsByField} from '@userActions/Delegate';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type ConfirmDelegateMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM_MAGIC_CODE>;

function ConfirmDelegateMagicCodePage({route}: ConfirmDelegateMagicCodePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);
    const addDelegateErrors = account?.delegatedAccess?.errorFields?.addDelegate?.[login];
    const validateLoginError = getLatestError(addDelegateErrors);
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.email || !!addDelegateErrors) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.goBack(ROUTES.SETTINGS_SECURITY);
    }, [login, currentDelegate, role, addDelegateErrors]);

    const clearError = () => {
        if (isEmptyObject(validateLoginError) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearDelegateErrorsByField({email: currentDelegate?.email ?? '', fieldName: 'addDelegate', delegatedAccess: account?.delegatedAccess});
    };

    return (
        <ValidateCodeActionContent
            clearError={clearError}
            validateCodeActionErrorField="addDelegate"
            onClose={() => Navigation.goBack(ROUTES.SETTINGS_DELEGATE_CONFIRM.getRoute(login, role))}
            validateError={validateLoginError}
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            handleSubmitForm={(validateCode) => addDelegate({email: login, role, validateCode, delegatedAccess: account?.delegatedAccess})}
            descriptionPrimary={translate('delegate.enterMagicCode', account?.primaryLogin ?? session?.email ?? '')}
        />
    );
}

export default ConfirmDelegateMagicCodePage;
