import {Str} from 'expensify-common';
import React, {useEffect, useMemo} from 'react';
import {Keyboard, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import Button from '@components/Button';

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

    const isResetPhoneNumberFailureSuccess = account?.isResetPhoneNumberFailureSuccess;
    const resetPhoneNumberFailureMessage = account?.resetPhoneNumberFailureMessage;

    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    if(isResetPhoneNumberFailureSuccess){
        return (
            <>
                <View style={[styles.mv3, styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        <Text>{resetPhoneNumberFailureMessage}</Text>
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
        )
    }

    if(isResetPhoneNumberFailureSuccess !== undefined && !isResetPhoneNumberFailureSuccess){
        return (
            <>
                <View style={[styles.mv3, styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        <Text>{resetPhoneNumberFailureMessage}</Text>
                    </View>
                </View>
                <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <Button
                        success
                        medium
                        text={translate('common.back')}
                        onPress={() => Session.clearSignInData()}
                        pressOnEnter
                    />
                </View>
            </>
        )
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
                    onPress={() => Session.resetPhoneNumberFailure(login)}
                    pressOnEnter
                />

                <PressableWithFeedback
                    onPress={() => Session.clearSignInData()}
                    role="button"
                    accessibilityLabel={translate('common.back')}
                    hoverDimmingValue={1}
                    pressDimmingValue={0.2}
                    style={[styles.mb2]}
                >
                    <Text style={[styles.link]}>{translate('common.back')}</Text>
                </PressableWithFeedback>
            </View>
        </>
    );
}

SMSDeliveryFailurePage.displayName = 'SMSDeliveryFailurePage';

export default SMSDeliveryFailurePage;
