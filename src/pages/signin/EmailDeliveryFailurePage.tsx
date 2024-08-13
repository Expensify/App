import {Str} from 'expensify-common';
import React, {useEffect, useMemo} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as Session from '@userActions/Session';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Credentials} from '@src/types/onyx';

type EmailDeliveryFailurePageOnyxProps = {
    /** The credentials of the logged in person */
    credentials: OnyxEntry<Credentials>;
};

type EmailDeliveryFailurePageProps = EmailDeliveryFailurePageOnyxProps;

function EmailDeliveryFailurePage({credentials}: EmailDeliveryFailurePageProps) {
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
                    <Text>{translate('emailDeliveryFailurePage.ourEmailProvider', {login})}</Text>
                    <Text style={[styles.mt5]}>
                        <Text style={[styles.textStrong]}>{translate('emailDeliveryFailurePage.confirmThat', {login})}</Text>
                        {translate('emailDeliveryFailurePage.emailAliases')}
                    </Text>
                    <Text style={[styles.mt5]}>
                        <Text style={[styles.textStrong]}>{translate('emailDeliveryFailurePage.ensureYourEmailClient')}</Text>
                        {translate('emailDeliveryFailurePage.youCanFindDirections')}
                        <TextLink
                            href="https://community.expensify.com/discussion/5651/deep-dive-best-practices-when-youre-running-into-trouble-receiving-emails-from-expensify/p1?new=1"
                            style={[styles.link]}
                        >
                            {translate('common.here')}
                        </TextLink>
                        {translate('emailDeliveryFailurePage.helpConfigure')}
                    </Text>
                    <Text style={styles.mt5}>
                        {translate('emailDeliveryFailurePage.onceTheAbove')}
                        <TextLink
                            href={`mailto:${CONST.EMAIL.CONCIERGE}`}
                            style={[styles.link]}
                        >
                            {CONST.EMAIL.CONCIERGE}
                        </TextLink>
                        {translate('emailDeliveryFailurePage.toUnblock')}
                    </Text>
                </View>
            </View>
            <View style={[styles.mv4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
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

EmailDeliveryFailurePage.displayName = 'EmailDeliveryFailurePage';

export default withOnyx<EmailDeliveryFailurePageProps, EmailDeliveryFailurePageOnyxProps>({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(EmailDeliveryFailurePage);
