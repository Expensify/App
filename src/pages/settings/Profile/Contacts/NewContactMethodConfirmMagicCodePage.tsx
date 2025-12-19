import React, {useCallback, useEffect, useMemo} from 'react';
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
import getDecodedContactMethodFromUriParam from './utils';

type NewContactMethodConfirmMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE>;

function NewContactMethodConfirmMagicCodePage({route}: NewContactMethodConfirmMagicCodePageProps) {
    const {translate} = useLocalize();
    const navigateBackTo = route?.params?.backTo;
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: false});
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const contactMethod = getContactMethod(account?.primaryLogin, session?.email);
    const newContactMethod = useMemo(() => getDecodedContactMethodFromUriParam(route.params.newContactMethod), [route.params.newContactMethod]);

    const [pendingContactAction] = useOnyx(ONYXKEYS.PENDING_CONTACT_ACTION, {canBeMissing: false});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});

    const prevPendingContactAction = usePrevious(pendingContactAction);
    const loginData = loginList?.[pendingContactAction?.contactMethod ?? newContactMethod];
    const validateLoginError = getLatestErrorField(loginData, 'addedLogin');

    const addNewContactMethod = useCallback(
        (magicCode: string) => {
            addNewContactMethodUser(addSMSDomainIfPhoneNumber(newContactMethod), magicCode);
        },
        [newContactMethod],
    );

    useEffect(() => {
        if (!pendingContactAction?.actionVerified) {
            return;
        }
        clearUnvalidatedNewContactMethodAction();
        Navigation.goBack(ROUTES.SETTINGS_CONTACT_METHOD_DETAILS.getRoute(addSMSDomainIfPhoneNumber(newContactMethod), navigateBackTo, true));
    }, [navigateBackTo, newContactMethod, pendingContactAction?.actionVerified, prevPendingContactAction?.contactMethod]);

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            descriptionPrimary={translate('contacts.enterMagicCode', contactMethod)}
            validateCodeActionErrorField="addedLogin"
            validateError={validateLoginError}
            handleSubmitForm={addNewContactMethod}
            clearError={() => {
                if (!pendingContactAction?.contactMethod) {
                    return;
                }
                clearContactMethod(newContactMethod);
            }}
            onClose={() => {
                if (!pendingContactAction?.contactMethod) {
                    return;
                }
                clearContactMethod(newContactMethod);
                clearUnvalidatedNewContactMethodAction();
                Navigation.goBack(ROUTES.SETTINGS_NEW_CONTACT_METHOD.getRoute(navigateBackTo));
            }}
        />
    );
}

export default NewContactMethodConfirmMagicCodePage;
