import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';

import {clearContactMethodErrors, requestValidateCodeAction, setContactMethodAsDefault} from '@libs/actions/User';
import {getLatestErrorField} from '@libs/ErrorUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {expensifyLoginsSelector, getContactMethod} from '@libs/UserUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

import React, {useEffect} from 'react';

import getDecodedContactMethodFromUriParam from './utils';

type SetDefaultContactMethodConfirmValidateCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.CONTACT_METHOD_SET_DEFAULT_CONFIRM>;

function SetDefaultContactMethodConfirmValidateCodePage({route}: SetDefaultContactMethodConfirmValidateCodePageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const backTo = route.params?.backTo;
    const contactMethod = getDecodedContactMethodFromUriParam(route.params.contactMethod);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const primaryContactMethod = getContactMethod(account?.primaryLogin, session?.email);

    const loginData = loginList?.[contactMethod];
    const defaultLoginError = getLatestErrorField(loginData, 'defaultLogin');

    // Navigate back to contact methods list when the default login is successfully updated
    useEffect(() => {
        // Wait for the server to confirm the default login change (session.email is updated via successData)
        if (session?.email !== contactMethod || loginData?.pendingFields?.defaultLogin) {
            return;
        }

        Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path, backTo));
    }, [session?.email, contactMethod, loginData?.pendingFields?.defaultLogin, backTo]);

    useEffect(() => {
        return () => {
            clearContactMethodErrors(contactMethod, 'defaultLogin');
        };
    }, [contactMethod]);

    if (!contactMethod || !loginData) {
        return (
            <ScreenWrapper testID="SetDefaultContactMethodConfirmValidateCodePage">
                <FullPageNotFoundView
                    shouldShow
                    linkTranslationKey="contacts.goBackContactMethods"
                    onBackButtonPress={() => Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path, backTo))}
                    onLinkPress={() => Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path, backTo))}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            descriptionPrimary={translate('contacts.enterSecurityCode', primaryContactMethod)}
            validateCodeActionErrorField="defaultLogin"
            validateError={defaultLoginError}
            handleSubmitForm={(validateCode) => setContactMethodAsDefault(currentUserPersonalDetails, contactMethod, formatPhoneNumber, backTo, true, validateCode)}
            isLoading={!!loginData?.pendingFields?.defaultLogin}
            clearError={() => {
                clearContactMethodErrors(contactMethod, 'defaultLogin');
            }}
            onClose={() => {
                const listPath = createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHODS.path, backTo);
                Navigation.goBack(createDynamicRoute(DYNAMIC_ROUTES.CONTACT_METHOD_DETAILS.getRoute(contactMethod), listPath));
            }}
        />
    );
}

export default SetDefaultContactMethodConfirmValidateCodePage;
