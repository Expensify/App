import Button from '@components/ButtonComposed';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import Text from '@components/Text';

import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import {getLatestErrorMessage} from '@libs/ErrorUtils';
import {formatList} from '@libs/Localize';
import {normalizeLogin} from '@libs/LoginUtils';

import {beginSignIn, clearSignInData, resetSMSDeliveryFailureStatus} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import React, {useEffect, useState} from 'react';
import {Keyboard, View} from 'react-native';

import ChangeExpensifyLoginLink from './ChangeExpensifyLoginLink';
import Terms from './Terms';

function SMSDeliveryFailurePage() {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

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

    // Each unit is translated separately so it can be pluralized by the locale's own rules, then joined
    // with Intl.ListFormat rather than a hardcoded "and".
    const durationParts: string[] = [];
    if (timeData?.days) {
        durationParts.push(translate('common.durationDays', {count: timeData.days}));
    }
    if (timeData?.hours) {
        durationParts.push(translate('common.durationHours', {count: timeData.hours}));
    }
    if (timeData?.minutes) {
        durationParts.push(translate('common.durationMinutes', {count: timeData.minutes}));
    }
    const timeText = durationParts.length > 0 ? formatList(durationParts) : '';

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
                        <Text>{translate('smsDeliveryFailurePage.validationFailed', {timeText})}</Text>
                    </View>
                </View>
                <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                    <Button
                        variant={CONST.BUTTON_VARIANT.SUCCESS}
                        size={CONST.BUTTON_SIZE.LARGE}
                        onPress={() => clearSignInData()}
                        style={styles.w100}
                        sentryLabel={CONST.SENTRY_LABEL.SIGN_IN.CONFIRM}
                    >
                        <Button.KeyboardShortcut />
                        <Button.Text>{translate('common.buttonConfirm')}</Button.Text>
                    </Button>
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
                        sentryLabel={CONST.SENTRY_LABEL.SIGN_IN.SEND}
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
                    <Text>{translate('smsDeliveryFailurePage.smsDeliveryFailureMessage', login)}</Text>
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
                    sentryLabel={CONST.SENTRY_LABEL.SIGN_IN.VALIDATE}
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
