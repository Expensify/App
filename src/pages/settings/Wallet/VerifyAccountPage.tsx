import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

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
    const [accountID] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.accountID ?? 0});

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
        if (!isUserValidated) {
            return;
        }

        setIsValidateCodeActionModalVisible(false);

        if (!navigateBackTo) {
            return;
        }
        Navigation.goBack();
        Navigation.navigate(navigateBackTo);
    }, [isUserValidated, navigateBackTo]);

    useEffect(() => {
        if (isValidateCodeActionModalVisible) {
            return;
        }

        if (!isUserValidated && navigateBackTo) {
            Navigation.navigate(ROUTES.SETTINGS_WALLET);
        } else if (!navigateBackTo) {
            Navigation.goBack();
        }
    }, [isValidateCodeActionModalVisible, isUserValidated, navigateBackTo]);

    // Once user is validated or the modal is dismissed, we don't want to show empty content.
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if (isUserValidated || !isValidateCodeActionModalVisible) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={VerifyAccountPage.displayName}
            >
                <HeaderWithBackButton
                    title={translate('contacts.validateAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
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
            description={translate('contacts.featureRequiresValidate')}
            onClose={() => setIsValidateCodeActionModalVisible(false)}
            clearError={clearError}
        />
    );
}

VerifyAccountPage.displayName = 'VerifyAccountPage';

export default VerifyAccountPage;
