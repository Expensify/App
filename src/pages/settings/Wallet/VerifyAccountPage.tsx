import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useRef} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';
import useLocalize from '@hooks/useLocalize';
import useSafePaddingBottomStyle from '@hooks/useSafePaddingBottomStyle';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import * as BankAccounts from '@userActions/BankAccounts';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type VerifyAccountPageProps = StackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.PROFILE.NEW_CONTACT_METHOD>;

function VerifyAccountPage({route}: VerifyAccountPageProps) {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const contactMethod = account?.primaryLogin ?? '';
    const themeStyles = useThemeStyles();
    const {translate} = useLocalize();
    const safePaddingBottomStyle = useSafePaddingBottomStyle();
    const loginInputRef = useRef<AnimatedTextInputRef>(null);
    const firstRenderRef = useRef(true);
    const loginData = loginList?.[contactMethod];
    const styles = useThemeStyles();
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});

    const [validateCodeAction] = useOnyx(ONYXKEYS.VALIDATE_ACTION_CODE);

    const navigateBackTo = route?.params?.backTo ?? ROUTES.SETTINGS_WALLET;

    useEffect(() => {
        if (firstRenderRef.current) {
            firstRenderRef.current = false;
            User.requestValidateCodeAction();
        }
        return () => User.clearUnvalidatedNewContactMethodAction();
    }, []);

    const handleSubmitForm = useCallback(
        (submitCode: string) => {
            User.validateSecondaryLogin(loginList, contactMethod ?? '', submitCode);
        },
        [loginList, contactMethod],
    );

    useEffect(() => {
        if (!isUserValidated) {
            return;
        }
        if (navigateBackTo === ROUTES.SETTINGS_ENABLE_PAYMENTS) {
            BankAccounts.openPersonalBankAccountSetupWithPlaid();
        }
        Navigation.navigate(navigateBackTo);
    }, [isUserValidated, navigateBackTo]);

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => loginInputRef.current?.focus()}
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={VerifyAccountPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('contacts.validateAccount')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_WALLET)}
            />
            <View style={[themeStyles.ph5, themeStyles.mt3, themeStyles.mb7, styles.flex1]}>
                <Text style={[themeStyles.mb3]}>{translate('contacts.featureRequiresValidate')}</Text>
                <ValidateCodeForm
                    validateCodeAction={validateCodeAction}
                    validateError={validateLoginError}
                    handleSubmitForm={handleSubmitForm}
                    clearError={() => User.clearContactMethodErrors(contactMethod, 'validateLogin')}
                    buttonStyles={[styles.justifyContentEnd, styles.flex1, safePaddingBottomStyle]}
                />
            </View>
        </ScreenWrapper>
    );
}

VerifyAccountPage.displayName = 'VerifyAccountPage';

export default VerifyAccountPage;
