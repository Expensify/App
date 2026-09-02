import Button from '@components/ButtonComposed';
import ButtonDisabledWhenOffline from '@components/ButtonComposed/composed/ButtonDisabledWhenOffline';
import FormHelpMessage from '@components/FormHelpMessage';
import Text from '@components/Text';

import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';

import {clearSignInData, resendValidateCode} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import {CONST as COMMON_CONST} from 'expensify-common';
import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';

import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

type ChooseSSOOrValidateCodeProps = {
    /** Function that returns whether the user is using SAML or validateCodes to log in */
    setIsUsingValidateCode: (value: boolean) => void;
};

function ChooseSSOOrValidateCode({setIsUsingValidateCode}: ChooseSSOOrValidateCodeProps) {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    return (
        <>
            <View>
                <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>{translate('samlSignIn.welcomeSAMLEnabled')}</Text>
                <ButtonDisabledWhenOffline
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.LARGE}
                    style={[styles.mv3]}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        Navigation.navigate(ROUTES.SAML_SIGN_IN);
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.SIGN_IN.SSO}
                >
                    <Button.Text>{translate('samlSignIn.useSingleSignOn')}</Button.Text>
                </ButtonDisabledWhenOffline>

                <View style={[styles.mt5]}>
                    <Text style={[styles.loginHeroBody, styles.mb5, styles.textNormal, !shouldUseNarrowLayout ? styles.textAlignLeft : {}]}>
                        {translate('samlSignIn.orContinueWithSecurityCode')}
                    </Text>
                </View>

                <ButtonDisabledWhenOffline
                    style={[styles.mv3]}
                    size={CONST.BUTTON_SIZE.LARGE}
                    isLoading={account?.isLoading && account?.loadingForm === (account?.requiresTwoFactorAuth ? CONST.FORMS.VALIDATE_TFA_CODE_FORM : CONST.FORMS.VALIDATE_CODE_FORM)}
                    onPress={() => {
                        resendValidateCode({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.SIGN_IN}, credentials?.login);
                        setIsUsingValidateCode(true);
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.SIGN_IN.VALIDATE_CODE}
                >
                    <Button.Text>{translate('samlSignIn.useSecurityCode')}</Button.Text>
                </ButtonDisabledWhenOffline>
                {!!account && !isEmptyObject(account.errors) && <FormHelpMessage message={getLatestErrorMessage(account)} />}
                <ChangeExpensifyLoginLink onPress={() => clearSignInData()} />
            </View>
            <View style={[styles.mt5, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

export default ChooseSSOOrValidateCode;
