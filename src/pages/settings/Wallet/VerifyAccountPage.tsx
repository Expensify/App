import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [user] = useOnyx(ONYXKEYS.USER);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const contactMethod = account?.primaryLogin ?? '';
    const {translate} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID ?? 0});

    // We store validated state in two places so this is a bit of a workaround to check both
    const isUserValidated = user?.validated ?? false;
    const isAccountValidated = account?.validated ?? false;
    const isValidated = isUserValidated || isAccountValidated;

    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(true);

    const navigateBackTo = route?.params?.backTo;

    useEffect(() => () => User.clearUnvalidatedNewContactMethodAction(), []);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            User.validateLogin(accountID ?? 0, validateCode);
        },
        [accountID],
    );

    const clearError = useCallback(() => {
        User.clearContactMethodErrors(contactMethod, 'validateLogin');
    }, [contactMethod]);

    useEffect(() => {
        if (!isValidated) {
            return;
        }

        setIsValidateCodeActionModalVisible(false);

        if (!navigateBackTo) {
            return;
        }

        Navigation.navigate(navigateBackTo);
    }, [isValidated, navigateBackTo]);

    useEffect(() => {
        if (isValidateCodeActionModalVisible) {
            return;
        }

        if (!isValidated && navigateBackTo) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET);
        } else if (!navigateBackTo) {
            Navigation.goBack();
        }
    }, [isValidateCodeActionModalVisible, isValidated, navigateBackTo]);

    return (
        <ValidateCodeActionModal
            sendValidateCode={() => User.requestValidateCodeAction()}
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
            hasMagicCodeBeenSent={!!loginData?.validateCodeSent}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('contacts.validateAccount')}
            description={translate('contacts.featureRequiresValidate')}
            onClose={() => setIsValidateCodeActionModalVisible(false)}
            clearError={clearError}
        />
    );
}

VerifyAccountPage.displayName = 'VerifyAccountPage';

export default VerifyAccountPage;
