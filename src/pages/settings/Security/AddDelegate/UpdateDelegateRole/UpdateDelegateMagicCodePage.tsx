import React, {useEffect} from 'react';
import type {ValueOf} from 'type-fest';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {requestValidateCodeAction} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {clearDelegateErrorsByField, updateDelegateRole} from '@userActions/Delegate';
import type CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type UpdateDelegateMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE>;

function UpdateDelegateMagicCodePage({route}: UpdateDelegateMagicCodePageProps) {
    const {translate} = useLocalize();
    const login = route.params.login;
    const newRole = route.params.newRole as ValueOf<typeof CONST.DELEGATE_ROLE>;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE, {canBeMissing: true});
    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);
    const updateDelegateErrors = account?.delegatedAccess?.errorFields?.updateDelegateRole?.[login];
    useEffect(() => {
        if (currentDelegate?.role !== newRole || !!currentDelegate.pendingFields?.role || !!updateDelegateErrors) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.goBack(ROUTES.SETTINGS_SECURITY);
    }, [login, currentDelegate?.role, currentDelegate?.pendingFields?.role, updateDelegateErrors, newRole]);

    const clearError = () => {
        if (isEmptyObject(updateDelegateErrors) && isEmptyObject(validateCodeAction?.errorFields)) {
            return;
        }
        clearDelegateErrorsByField({email: currentDelegate?.email ?? '', fieldName: 'updateDelegateRole', delegatedAccess: account?.delegatedAccess});
    };

    return (
        <ValidateCodeActionContent
            clearError={clearError}
            validateCodeActionErrorField="updateDelegateRole"
            onClose={() => Navigation.goBack(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(login, currentDelegate?.role ?? ''))}
            validateError={updateDelegateErrors}
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            handleSubmitForm={(validateCode) => updateDelegateRole({email: login, role: newRole, validateCode, delegatedAccess: account?.delegatedAccess})}
            descriptionPrimary={translate('delegate.enterMagicCode', account?.primaryLogin ?? session?.email ?? '')}
        />
    );
}

export default UpdateDelegateMagicCodePage;
