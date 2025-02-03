import React, {useEffect} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {updateDelegateRole} from '@libs/actions/Delegate';
import {requestValidateCodeAction} from '@libs/actions/User';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type UpdateDelegateMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.DELEGATE.DELEGATE_CONFIRM>;

function UpdateDelegateMagicCodePage({route}: UpdateDelegateMagicCodePageProps) {
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const login = route.params.login;
    const role = route.params.role as ValueOf<typeof CONST.DELEGATE_ROLE>;

    const currentDelegate = account?.delegatedAccess?.delegates?.find((d) => d.email === login);
    const updateDelegateErrors = account?.delegatedAccess?.errorFields?.updateDelegateRole?.[login];

    useEffect(() => {
        if (!currentDelegate || !!currentDelegate.pendingFields?.role || !!updateDelegateErrors) {
            return;
        }

        // Dismiss modal on successful magic code verification
        Navigation.dismissModal();
    }, [login, currentDelegate, role, updateDelegateErrors]);

    const onBackButtonPress = () => {
        Navigation.goBack(ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute(login, role));
    };

    return (
        <ValidateCodeActionModal
            clearError={() => {}}
            onClose={onBackButtonPress}
            validateError={updateDelegateErrors}
            isVisible={true}
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
            handleSubmitForm={(validateCode) => updateDelegateRole(login, role, validateCode)}
            descriptionPrimary={translate('delegate.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
        />
    );
}

UpdateDelegateMagicCodePage.displayName = 'UpdateDelegateMagicCodePage';

export default UpdateDelegateMagicCodePage;
