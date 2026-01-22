import React, {useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';
import Button from '@components/Button';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {normalizeLogin} from '@libs/LoginUtils';
import {beginSignIn, clearSignInData, resetSMSDeliveryFailureStatus} from '@userActions/Session';
import ONYXKEYS from '@src/ONYXKEYS';
import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

function SMSDeliveryFailurePage() {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});

    const login = normalizeLogin(credentials?.login);

    const SMSDeliveryFailureMessage = account?.smsDeliveryFailureStatus?.message;
    const isResettingSMSDeliveryFailureStatus = account?.smsDeliveryFailureStatus?.isLoading;

    type TimeData = {
        days?: number;
        hours?: number;
        minutes?: number;
    };

    let timeData: TimeData | null = null;
    if (SMSDeliveryFailureMessage) {
        const parsedData = JSON.parse(SMSDeliveryFailureMessage) as TimeData | [];

        if (!Array.isArray(parsedData) || parsedData.length > 0) {
            timeData = parsedData as TimeData;
        }
    }

    const hasSMSDeliveryFailure = account?.smsDeliveryFailureStatus?.hasSMSDeliveryFailure;

    // We need to show two different messages after clicking validate button, based on API response for hasSMSDeliveryFailure.
    const [hasClickedValidate, setHasClickedValidate] = useState(false);

    const errorText = account ? getLatestErrorMessage(account) : '';
    const shouldShowError = !!errorText;

    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    if (hasSMSDeliveryFailure && hasClickedValidate && !isResettingSMSDeliveryFailureStatus) {
        return (
            <>
                <View style={[styles.mv3, styles.flexRow]}>
                    <View style={[styles.flex1]}>
                        <Text>{translate('smsDeliveryFailurePage.validationFailed', {timeData})}</Text>
                    </View>
                </View>
                <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <Button
                        success
                        large
                        text={translate('common.buttonConfirm')}
                        onPress={() => clearSignInData()}
                        pressOnEnter
                        style={styles.w100}
                    />
                </View>
                <View style={[styles.mt3, styles.mb2]}>
                    <ChangeExpensifyLoginLink onPress={() => clearSignInData()} />
                </View>
                <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                    <Terms />
                </View>
            </>
        );
    }

    if (!hasSMSDeliveryFailure && hasClickedValidate) {
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
                        onSubmit={() => beginSignIn(login)}
                        message={errorText}
                        isAlertVisible={shouldShowError}
                        containerStyles={[styles.w100, styles.mh0]}
                    />
                </View>
                <View style={[styles.mt3, styles.mb2]}>
                    <ChangeExpensifyLoginLink onPress={() => clearSignInData()} />
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
                    isLoading={isResettingSMSDeliveryFailureStatus}
                    onSubmit={() => {
                        resetSMSDeliveryFailureStatus(login);
                        setHasClickedValidate(true);
                    }}
                    message={errorText}
                    isAlertVisible={shouldShowError}
                    containerStyles={[styles.w100, styles.mh0]}
                />
            </View>
            <View style={[styles.mt3, styles.mb2]}>
                <ChangeExpensifyLoginLink onPress={() => clearSignInData()} />
            </View>
            <View style={[styles.mt4, styles.signInPageWelcomeTextContainer]}>
                <Terms />
            </View>
        </>
    );
}

export default SMSDeliveryFailurePage;
