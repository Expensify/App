import React, {useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearPendingContactActionErrors, requestValidateCodeAction, verifyAddSecondaryLoginCode} from '@libs/actions/User';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getContactMethod} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type NewContactMethodConfirmMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE>;

function NewContactMethodConfirmMagicCodePage({route}: NewContactMethodConfirmMagicCodePageProps) {
    const {translate} = useLocalize();
    const navigateBackTo = route?.params?.backTo;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION, {canBeMissing: false});
    const validateCodeError = getLatestErrorField(pendingContactAction, 'addedLogin');

    useEffect(() => {
        if (!pendingContactAction?.isVerifiedValidateActionCode) {
            return;
        }
        Navigation.navigate(ROUTES.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo));
    }, [navigateBackTo, pendingContactAction?.isVerifiedValidateActionCode]);

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            descriptionPrimary={translate('contacts.enterMagicCode', contactMethod)}
            validateCodeActionErrorField="addedLogin"
            validateError={validateCodeError}
            handleSubmitForm={verifyAddSecondaryLoginCode}
            clearError={() => {
                clearPendingContactActionErrors();
            }}
            onClose={() => {
                Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHODS.getRoute(navigateBackTo));
            }}
            isLoading={pendingContactAction?.isLoading}
        />
    );
}

export default NewContactMethodConfirmMagicCodePage;
