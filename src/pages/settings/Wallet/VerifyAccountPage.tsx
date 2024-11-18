import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const contactMethod = account?.primaryLogin ?? '';
    const {translate} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(true);

    const navigateBackTo = route?.params?.backTo;

    useEffect(() => () => User.clearUnvalidatedNewContactMethodAction(), []);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            User.validateSecondaryLogin(loginList, contactMethod, validateCode);
        },
        [loginList, contactMethod],
    );

    const clearError = useCallback(() => {
        User.clearContactMethodErrors(contactMethod, 'validateLogin');
    }, [contactMethod]);

    const closeModal = useCallback(() => {
        // Disable modal visibility so the navigation is animated
        setIsValidateCodeActionModalVisible(false);
        Navigation.goBack();
    }, []);

    // Handle navigation once the user is validated
    useEffect(() => {
        if (!isUserValidated) {
            return;
        }

        setIsValidateCodeActionModalVisible(false);

        if (navigateBackTo) {
            Navigation.navigate(navigateBackTo);
        } else {
            Navigation.goBack();
        }
    }, [isUserValidated, navigateBackTo]);

    return (
        <ValidateCodeActionModal
            sendValidateCode={() => User.requestValidateCodeAction()}
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
            hasMagicCodeBeenSent={!!loginData?.validateCodeSent}
            isVisible={isValidateCodeActionModalVisible}
            title={translate('contacts.validateAccount')}
            descriptionPrimary={translate('contacts.featureRequiresValidate')}
            descriptionSecondary={translate('contacts.enterMagicCode', {contactMethod})}
            clearError={clearError}
            onClose={closeModal}
            onModalHide={() => {}}
        />
    );
}

VerifyAccountPage.displayName = 'VerifyAccountPage';

export default VerifyAccountPage;
