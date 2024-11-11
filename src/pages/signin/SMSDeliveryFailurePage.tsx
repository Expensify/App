import {Str} from 'expensify-common';
import React, {useEffect, useMemo} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Credentials} from '@src/types/onyx';

type SMSDeliveryFailurePageOnyxProps = {
    /** The credentials of the logged in person */
    credentials: OnyxEntry<Credentials>;
};
type SMSDeliveryFailurePageProps = SMSDeliveryFailurePageOnyxProps;
function SMSDeliveryFailurePage({credentials}: SMSDeliveryFailurePageProps) {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const login = useMemo(() => {
        if (!credentials?.login) {
            return '';
        }
        return Str.isSMSLogin(credentials.login) ? Str.removeSMSDomain(credentials.login) : credentials.login;
    }, [credentials?.login]);
    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);
    return (
        <>
            <View style={[styles.mv3, styles.flexRow]}>
                <View style={[styles.flex1]}>
                    <Text>{translate('smsDeliveryFailurePage.smsDeliveryFailureMessage', {login})}</Text>
                </View>
            </View>
            <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsStart]}>
                <FormAlertWithSubmitButton
                    buttonText={translate('common.validate')}
                    isLoading={false}
                    onSubmit={() => {}}
                    message={''}
                    isAlertVisible={false}
                    buttonStyles={styles.mt3}
                    containerStyles={[styles.mh0]}
                />
            </View>
            <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsEnd]}>
                <PressableWithFeedback
                    onPress={() => Session.clearSignInData()}
                    role="button"
                    accessibilityLabel={translate('common.back')}
                    // disable hover dim for switch
                    hoverDimmingValue={1}
                    pressDimmingValue={0.2}
                >
                    <Text style={[styles.link]}>{translate('common.back')}</Text>
                </PressableWithFeedback>
            </View>
        </>
    );
}
SMSDeliveryFailurePage.displayName = 'SMSDeliveryFailurePage';
export default withOnyx<SMSDeliveryFailurePageProps, SMSDeliveryFailurePageOnyxProps>({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(SMSDeliveryFailurePage);
