import React from 'react';
import PropTypes from 'prop-types';
import {SafeAreaView} from 'react-native-safe-area-context';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import SignInPageLayout from './SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    signInProvider: PropTypes.oneOf(['google', 'apple']),

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    signInProvider: 'google',
};

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

/* Dedicated screen that the desktop app links to on the web app, as Apple/Google
 * sign-in cannot work fully within Electron, so we escape to web and redirect
 * to desktop once we have an Expensify auth token.
 */
function ThirdPartySignInPage(props) {
    const goBack = () => {
        Navigation.navigate(ROUTES.HOME);
    };

    return (
        <SafeAreaView style={[styles.signInPage]}>
            <SignInPageLayout
                welcomeHeader={props.translate('welcomeText.getStarted')}
                shouldShowWelcomeHeader
            >
                {props.signInProvider === 'google' && (
                    <Button
                        large
                        text="Continue with Google"
                        style={[styles.mb5]}
                        onPress={() => {}}
                    />
                )}
                <Text style={[styles.mt5]}>{props.translate('thirdPartySignIn.redirectToDesktopMessage')}</Text>
                <Text style={[styles.mt5]}>{props.translate('thirdPartySignIn.goBackMessage', {provider: capitalize(props.signInProvider)})}</Text>
                <TextLink
                    style={[styles.link]}
                    onPress={goBack}
                >
                    {props.translate('common.goBack')}.
                </TextLink>
                <Text style={[styles.textExtraSmallSupporting, styles.mt5, styles.mb5]}>
                    {props.translate('thirdPartySignIn.signInAgreementMessage')}
                    <TextLink
                        style={[styles.textExtraSmallSupporting, styles.link]}
                        href=""
                    >
                        {` ${props.translate('common.termsOfService')}`}
                    </TextLink>
                    {` ${props.translate('common.and')} `}
                    <TextLink
                        style={[styles.textExtraSmallSupporting, styles.link]}
                        href=""
                    >
                        {props.translate('common.privacy')}
                    </TextLink>
                    .
                </Text>
            </SignInPageLayout>
        </SafeAreaView>
    );
}

ThirdPartySignInPage.propTypes = propTypes;
ThirdPartySignInPage.defaultProps = defaultProps;
ThirdPartySignInPage.displayName = 'ThirdPartySignInPage';

export default compose(withLocalize, withWindowDimensions)(ThirdPartySignInPage);
