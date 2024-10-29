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
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const contactMethod = account?.primaryLogin ?? '';
    const {translate} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(true);

    const navigateForwardTo = route.params?.forwardTo;
    const navigateBackTo = route?.params?.backTo;

    useEffect(() => () => User.clearUnvalidatedNewContactMethodAction(), []);

    const handleSubmitForm = useCallback(
        (submitCode: string) => {
            User.validateSecondaryLogin(loginList, contactMethod ?? '', submitCode);
        },
        [loginList, contactMethod],
    );

    const clearError = useCallback(() => {
        User.clearContactMethodErrors(contactMethod, 'validateLogin');
    }, [contactMethod]);

    useEffect(() => {
        if (!isUserValidated) {
            return;
        }

        setIsValidateCodeActionModalVisible(false);

        if (!navigateBackTo) {
            return;
        }

        Navigation.navigate(navigateForwardTo);
    }, [isUserValidated, navigateForwardTo]);

    useEffect(() => {
        if (isValidateCodeActionModalVisible) {
            return;
        }

        if (!isUserValidated && navigateBackTo) {
            Navigation.goBack(navigateBackTo);
        } else if (!navigateBackTo) {
            Navigation.goBack();
        }
    }, [isValidateCodeActionModalVisible, isUserValidated, navigateBackTo]);

    return (
        <ValidateCodeActionModal
            sendValidateCode={() => User.requestValidateCodeAction()}
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
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
