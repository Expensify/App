import React, {useCallback, useEffect} from 'react';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import {addNewContactMethod as addNewContactMethodUser, clearContactMethod, clearUnvalidatedNewContactMethodAction, requestValidateCodeAction} from '@libs/actions/User';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getContactMethod} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type NewContactMethodConfirmMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE>;

function NewContactMethodConfirmMagicCodePage({route}: NewContactMethodConfirmMagicCodePageProps) {
    const {translate} = useLocalize();
    const navigateBackTo = route?.params?.backTo;

    const [pendingContactAction, pendingContactActionMetadata] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION, {canBeMissing: false});

    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const prevPendingContactAction = usePrevious(pendingContactAction);
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);

    const loginData = loginList?.[pendingContactAction?.contactMethod ?? contactMethod];
    const validateLoginError = getLatestErrorField(loginData, 'addedLogin');

    const addNewContactMethod = useCallback(
        (magicCode: string) => {
            addNewContactMethodUser(addSMSDomainIfPhoneNumber(pendingContactAction?.contactMethod ?? ''), magicCode);
        },
        [pendingContactAction?.contactMethod],
    );

    useEffect(() => {
        if (isLoadingOnyxValue(pendingContactActionMetadata)) {
            return;
        }
        if (pendingContactAction?.contactMethod) {
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo));
        clearUnvalidatedNewContactMethodAction();
    }, [navigateBackTo, pendingContactAction?.contactMethod, pendingContactActionMetadata]);

    useEffect(() => {
        if (!pendingContactAction?.actionVerified || !prevPendingContactAction?.contactMethod) {
            return;
        }
        clearUnvalidatedNewContactMethodAction();
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(addSMSDomainIfPhoneNumber(prevPendingContactAction?.contactMethod ?? ''), navigateBackTo, true));
    }, [navigateBackTo, pendingContactAction?.actionVerified, prevPendingContactAction?.contactMethod]);

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            descriptionPrimary={translate('contacts.enterMagicCode', {contactMethod})}
            validateCodeActionErrorField="addedLogin"
            validateError={validateLoginError}
            handleSubmitForm={addNewContactMethod}
            clearError={() => {
                if (!pendingContactAction?.contactMethod) {
                    return;
                }
                clearContactMethod(pendingContactAction?.contactMethod);
                clearUnvalidatedNewContactMethodAction();
            }}
            onClose={() => {
                if (pendingContactAction?.contactMethod) {
                    clearContactMethod(pendingContactAction?.contactMethod);
                    clearUnvalidatedNewContactMethodAction();
                }
                Navigation.goBack(ROUTES.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo));
            }}
        />
    );
}

NewContactMethodConfirmMagicCodePage.displayName = 'NewContactMethodConfirmMagicCodePage';

export default NewContactMethodConfirmMagicCodePage;
