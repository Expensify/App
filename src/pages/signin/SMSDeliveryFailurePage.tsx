import {Str} from 'expensify-common';
import React, {useEffect, useMemo} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
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

    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    if (hasSMSDeliveryFailure === true) {
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
                        medium
                        text={translate('common.buttonConfirm')}
                        onPress={() => Session.clearSignInData()}
                        pressOnEnter
                        style={styles.w100}
                    />
                </View>
            </>
        );
    }

    if (hasSMSDeliveryFailure === false) {
        return (
            <>
                <View style={[styles.mv3, styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        <Text>{translate('smsDeliveryFailurePage.validationSuccess')}</Text>
                    </View>
                </View>
                <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <Button
                        success
                        medium
                        text={translate('common.send')}
                        onPress={() => Session.beginSignIn(login)}
                        pressOnEnter
                        style={styles.w100}
                    />
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
                <Button
                    success
                    medium
                    text={translate('common.validate')}
                    onPress={() => console.log('resetSMSDeliveryFailure')}
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

SMSDeliveryFailurePage.displayName = 'SMSDeliveryFailurePage';

export default SMSDeliveryFailurePage;
