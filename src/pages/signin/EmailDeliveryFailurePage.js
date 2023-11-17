import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import React, {useEffect} from 'react';
import {Keyboard, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useKeyboardState from '@hooks/useKeyboardState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@styles/useThemeStyles';
import redirectToSignIn from '@userActions/SignInRedirect';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }),
};

const defaultProps = {
    credentials: {},
};

function EmailDeliveryFailurePage(props) {
    const styles = useThemeStyles();
    const {isKeyboardShown} = useKeyboardState();
    const {translate} = useLocalize();
    const login = Str.isSMSLogin(props.credentials.login) ? Str.removeSMSDomain(props.credentials.login) : props.credentials.login;

    // This view doesn't have a field for user input, so dismiss the device keyboard if shown
    useEffect(() => {
        if (!isKeyboardShown) {
            return;
        }
        Keyboard.dismiss();
    }, [isKeyboardShown]);

    return (
        <>
            <View style={[styles.mv3, styles.flexRow, styles.justifyContentetween]}>
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
                    onPress={() => redirectToSignIn()}
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

EmailDeliveryFailurePage.propTypes = propTypes;
EmailDeliveryFailurePage.defaultProps = defaultProps;
EmailDeliveryFailurePage.displayName = 'EmailDeliveryFailurePage';

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
})(EmailDeliveryFailurePage);
