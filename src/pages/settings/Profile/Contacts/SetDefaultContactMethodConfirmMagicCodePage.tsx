import React, {useEffect, useMemo} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionContent from '@components/ValidateCodeActionModal/ValidateCodeActionContent';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDynamicBackPath from '@hooks/useDynamicBackPath';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {clearContactMethodErrors, requestValidateCodeAction, resetValidateActionCodeSent, setContactMethodAsDefault} from '@libs/actions/User';
import {getLatestErrorField} from '@libs/ErrorUtils';
import findMatchingDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/findMatchingDynamicSuffix';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getContactMethod} from '@libs/UserUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import getDecodedContactMethodFromUriParam from './utils';

type SetDefaultContactMethodConfirmMagicCodePageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.DYNAMIC_CONTACT_METHOD_SET_DEFAULT_CONFIRM>;

function SetDefaultContactMethodConfirmMagicCodePage({route}: SetDefaultContactMethodConfirmMagicCodePageProps) {
    const {translate, formatPhoneNumber} = useLocalize();
    const contactMethod = getDecodedContactMethodFromUriParam(route.params?.contactMethod ?? '');
    const backToDetailsPath = useDynamicBackPath(DYNAMIC_ROUTES.CONTACT_METHOD_SET_DEFAULT_CONFIRM.path);
    const backToContactMethodsPath = useMemo(() => {
        const match = findMatchingDynamicSuffix(backToDetailsPath);
        if (match?.pattern === DYNAMIC_ROUTES.CONTACT_METHOD_DETAILS.path) {
            return getPathWithoutDynamicSuffix(backToDetailsPath, match.actualSuffix, match.pattern);
        }
        return backToDetailsPath;
    }, [backToDetailsPath]);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
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

        resetValidateActionCodeSent();
        Navigation.goBack(backToContactMethodsPath, {compareParams: false});
    }, [session?.email, contactMethod, loginData?.pendingFields?.defaultLogin, backToContactMethodsPath]);

    useEffect(() => {
        return () => {
            clearContactMethodErrors(contactMethod, 'defaultLogin');
        };
    }, [contactMethod]);

    if (!contactMethod || !loginData) {
        return (
            <ScreenWrapper testID="SetDefaultContactMethodConfirmMagicCodePage">
                <FullPageNotFoundView
                    shouldShow
                    linkTranslationKey="contacts.goBackContactMethods"
                    onBackButtonPress={() => Navigation.goBack(backToContactMethodsPath, {compareParams: false})}
                    onLinkPress={() => Navigation.goBack(backToContactMethodsPath, {compareParams: false})}
                />
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionContent
            title={translate('delegate.makeSureItIsYou')}
            sendValidateCode={() => requestValidateCodeAction()}
            descriptionPrimary={translate('contacts.enterMagicCode', primaryContactMethod)}
            validateCodeActionErrorField="defaultLogin"
            validateError={defaultLoginError}
            handleSubmitForm={(validateCode) => setContactMethodAsDefault(currentUserPersonalDetails, contactMethod, formatPhoneNumber, true, validateCode)}
            isLoading={!!loginData?.pendingFields?.defaultLogin}
            clearError={() => {
                clearContactMethodErrors(contactMethod, 'defaultLogin');
            }}
            onClose={() => {
                resetValidateActionCodeSent();
                Navigation.goBack(backToDetailsPath, {compareParams: false});
            }}
        />
    );
}

export default SetDefaultContactMethodConfirmMagicCodePage;
