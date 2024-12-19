import {Str} from 'expensify-common';
import React, {useEffect, useMemo} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

function SMSDeliveryFailurePage() {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    const login = useMemo(() => {
        if (!credentials?.login) {
            return '';
        }
        return Str.isSMSLogin(credentials.login) ? Str.removeSMSDomain(credentials.login) : credentials.login;
    }, [credentials?.login]);

    const SMSDeliveryFailureMessage = account?.smsDeliveryFailureStatus?.message;
    const hasSMSDeliveryFailure = account?.smsDeliveryFailureStatus?.hasSMSDeliveryFailure;
    const isReset = account?.smsDeliveryFailureStatus?.isReset;

    const errorText = useMemo(() => (account ? ErrorUtils.getLatestErrorMessage(account) : ''), [account]);
    const shouldShowError = !!errorText;

    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    if (hasSMSDeliveryFailure && isReset) {
        return (
            <>
                <View style={[styles.mv3, styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        <Text>
                            {translate('smsDeliveryFailurePage.validationFailed')} {SMSDeliveryFailureMessage}
                        </Text>
                    </View>
                </View>
                <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <Button
                        success
                        large
                        text={translate('common.buttonConfirm')}
                        onPress={() => Session.clearSignInData()}
                        pressOnEnter
                        style={styles.w100}
                    />
                </View>
                <View style={[styles.mt3, styles.mb2]}>
                    <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
                </View>
                <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                    <Terms />
                </View>
            </>
        );
    }

    if (!hasSMSDeliveryFailure && isReset) {
        return (
            <>
                <View style={[styles.mv3, styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        <Text>{translate('smsDeliveryFailurePage.validationSuccess')}</Text>
                    </View>
                </View>
                <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <FormAlertWithSubmitButton
                        buttonText={translate('common.send')}
                        isLoading={account?.isLoading}
                        onSubmit={() => Session.beginSignIn(login)}
                        message={errorText}
                        isAlertVisible={shouldShowError}
                        containerStyles={[styles.w100, styles.mh0]}
                    />
                </View>
                <View style={[styles.mt3, styles.mb2]}>
                    <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
                </View>
                <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                    <Terms />
                </View>
            </>
        );
    }

    return (
        <>
            <View style={[styles.mv3, styles.flexRow]}>
                <View style={[styles.flex1]}>
                    <Text>{translate('smsDeliveryFailurePage.smsDeliveryFailureMessage', {login})}</Text>
                </View>
            </View>
            <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                <FormAlertWithSubmitButton
                    buttonText={translate('common.validate')}
                    isLoading={account?.smsDeliveryFailureStatus?.isLoading}
                    onSubmit={() => Session.resetSMSDeliveryFailure(login)}
                    message={errorText}
                    isAlertVisible={shouldShowError}
                    containerStyles={[styles.w100, styles.mh0]}
                />
            </View>
            <View style={[styles.mt3, styles.mb2]}>
                <ChangeExpensifyLoginLink onPress={() => Session.clearSignInData()} />
            </View>
            <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

SMSDeliveryFailurePage.displayName = 'SMSDeliveryFailurePage';

export default SMSDeliveryFailurePage;
