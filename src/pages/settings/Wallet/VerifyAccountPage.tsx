import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useBeforeRemove from '@hooks/useBeforeRemove';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as User from '@userActions/User';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const styles = useThemeStyles();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const contactMethod = account?.primaryLogin ?? '';
    const {translate} = useLocalize();
    const loginData = loginList?.[contactMethod];
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(true);

    const navigateForwardTo = route.params?.forwardTo;
    const backTo = route.params?.backTo;

    useBeforeRemove(() => setIsValidateCodeActionModalVisible(false));

    useEffect(() => () => User.clearUnvalidatedNewContactMethodAction(), []);

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            User.validateSecondaryLogin(loginList, contactMethod, validateCode, true);
        },
        [loginList, contactMethod],
    );

    const clearError = useCallback(() => {
        User.clearContactMethodErrors(contactMethod, 'validateLogin');
    }, [contactMethod]);

    const closeModal = useCallback(() => {
        // Disable modal visibility so the navigation is animated
        setIsValidateCodeActionModalVisible(false);
        Navigation.goBack(backTo);
    }, [backTo]);

    // Handle navigation once the user is validated
    useEffect(() => {
        if (!isUserValidated) {
            return;
        }

        setIsValidateCodeActionModalVisible(false);

        if (navigateForwardTo) {
            Navigation.navigate(navigateForwardTo, CONST.NAVIGATION.TYPE.UP);
        } else {
            Navigation.goBack(backTo);
        }
    }, [isUserValidated, navigateForwardTo, backTo]);

    // Once user is validated or the modal is dismissed, we don't want to show empty content.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isUserValidated || !isValidateCodeActionModalVisible) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom
                testID={VerifyAccountPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('contacts.validateAccount')}
                    onBackButtonPress={() => Navigation.goBack(backTo)}
                />
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            </ScreenWrapper>
        );
    }

    return (
        <ValidateCodeActionModal
            sendValidateCode={() => User.requestValidateCodeAction()}
            handleSubmitForm={handleSubmitForm}
            validateError={validateLoginError}
            hasMagicCodeBeenSent={validateCodeAction?.validateCodeSent}
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
