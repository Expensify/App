import {Str} from 'expensify-common';
import React, {useMemo, useState} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FormHelpMessage from '@components/FormHelpMessage';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {setReadyToShowAuthScreens} from '@userActions/HybridApp';
import {clearSignInData, signUpUser} from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

function SignUpWelcomeForm() {
    const network = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [login] = useOnyx(ONYXKEYS.CREDENTIALS, {selector: (credentials) => credentials?.login});
    const [preferredLocale] = useOnyx(ONYXKEYS.NVP_PREFERRED_LOCALE);
    const serverErrorText = useMemo(() => (account ? getLatestErrorMessage(account) : ''), [account]);
    const isPhoneSignup = Str.isSMSLogin(login ?? '');
    const [hasSMSMarketingConsent, setHasSMSMarketingConsent] = useState(false);
    const marketingSMSConsentLabel = translate('welcomeSignUpForm.marketingSMSConsent');

    return (
        <>
            {isPhoneSignup && (
                <View style={[styles.mt3, styles.mb2]}>
                    <CheckboxWithLabel
                        label={marketingSMSConsentLabel}
                        isChecked={hasSMSMarketingConsent}
                        onInputChange={(value) => setHasSMSMarketingConsent(value ?? false)}
                        accessibilityLabel={marketingSMSConsentLabel}
                    />
                </View>
            )}
            <View style={[styles.mt3, styles.mb2]}>
                <Button
                    isDisabled={network.isOffline || !!account?.message}
                    success
                    large
                    text={translate('welcomeSignUpForm.join')}
                    isLoading={account?.isLoading}
                    onPress={() => {
                        signUpUser(preferredLocale, isPhoneSignup ? hasSMSMarketingConsent : undefined);
                        setReadyToShowAuthScreens(true);
                    }}
                    pressOnEnter
                    style={[styles.mb2]}
                    sentryLabel={CONST.SENTRY_LABEL.SIGN_IN.JOIN}
                />
                {!!serverErrorText && (
                    <FormHelpMessage
                        isError
                        message={serverErrorText}
                    />
                )}
                <ChangeExpensifyLoginLink onPress={() => clearSignInData()} />
            </View>
            <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

export default SignUpWelcomeForm;
