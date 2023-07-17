import React, {useEffect} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import TextLink from '../../components/TextLink';
import Text from '../../components/Text';
import Icon from '../../components/Icon';
import * as Illustrations from '../../components/Icon/Illustrations';
import * as Expensicons from '../../components/Icon/Expensicons';
import colors from '../../styles/colors';
import styles from '../../styles/styles';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import * as Browser from '../../libs/Browser';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import CONFIG from '../../CONFIG';
import Navigation from '../../libs/Navigation/Navigation';
import ROUTES from '../../ROUTES';

const propTypes = {
    session: PropTypes.shape({
        /** Currently logged-in user email */
        email: PropTypes.string,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    session: {
        email: '',
    },
};

function openRouteInDesktopApp(expensifyDeeplinkUrl) {
    const browser = Browser.getBrowser();

    // This check is necessary for Safari, otherwise, if the user
    // does NOT have the Expensify desktop app installed, it's gonna
    // show an error in the page saying that the address is invalid
    // It is also necessary for Firefox, otherwise the window.location.href redirect
    // will abort the fetch request from NetInfo, which will cause the app to go offline temporarily.
    if (browser === CONST.BROWSER.SAFARI || browser === CONST.BROWSER.FIREFOX) {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        iframe.contentWindow.location.href = expensifyDeeplinkUrl;

        // Since we're creating an iframe for Safari to handle
        // deeplink we need to give this iframe some time for
        // it to do what it needs to do. After that we can just
        // remove the iframe.
        setTimeout(() => {
            if (!iframe.parentNode) {
                return;
            }

            iframe.parentNode.removeChild(iframe);
        }, 100);
    } else {
        window.location.href = expensifyDeeplinkUrl;
    }
}

/**
 * Landing page for when a user enters third party login flow on desktop.
 * Allows user to open the link in browser if they accidentally canceled the auto-prompt.
 * Also allows them to continue to the web app if they want to use it there.
 * @param {Object} props
 * @returns {React.Component}
 */
function DesktopRedirectPage(props) {
    useEffect(() => {
        Session.setSignInAttemptPlatform(null);
    }, []);

    const expensifyUrl = new URL(CONFIG.EXPENSIFY.NEW_EXPENSIFY_URL);
    const expensifyDeeplinkUrl = `${CONST.DEEPLINK_BASE_URL}${expensifyUrl.host}}`;
    return (
        <View style={styles.deeplinkWrapperContainer}>
            <View style={styles.deeplinkWrapperMessage}>
                <View style={styles.mb2}>
                    <Icon
                        width={200}
                        height={164}
                        src={Illustrations.RocketBlue}
                    />
                </View>
                <Text style={[styles.textHeadline, styles.textXXLarge]}>{props.translate('deeplinkWrapper.launching')}</Text>
                <View style={[styles.mt2, styles.fontSizeNormal, styles.textAlignCenter]}>
                    <Text>{props.translate('thirdPartySignIn.loggedInAs', {email: props.session.email})}</Text>
                    <Text style={[styles.textAlignCenter]}>
                        {props.translate('thirdPartySignIn.doNotSeePrompt')}{' '}
                        <TextLink onPress={() => openRouteInDesktopApp(expensifyDeeplinkUrl)}>{props.translate('thirdPartySignIn.tryAgain')}</TextLink>
                        {props.translate('thirdPartySignIn.or')} <TextLink onPress={() => Navigation.navigate(ROUTES.HOME)}>{props.translate('thirdPartySignIn.continueInWeb')}</TextLink>.
                    </Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={colors.green}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

DesktopRedirectPage.propTypes = propTypes;
DesktopRedirectPage.defaultProps = defaultProps;
DesktopRedirectPage.displayName = 'DesktopRedirectPage';

export default compose(
    withLocalize,
    withOnyx({
        session: {
            key: ONYXKEYS.SESSION,
        },
    }),
)(DesktopRedirectPage);
