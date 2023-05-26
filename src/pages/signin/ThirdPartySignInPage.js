import React, {useEffect} from 'react';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {SafeAreaView} from 'react-native-safe-area-context';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import compose from '../../libs/compose';
import SignInPageLayout from './SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Performance from '../../libs/Performance';
import * as App from '../../libs/actions/App';
import Text from '../../components/Text';
import TextLink from '../../components/TextLink';
import Button from '../../components/Button';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import * as Localize from '../../libs/Localize';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Error to display when there is an account error returned */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Whether the account is validated */
        validated: PropTypes.bool,

        /** The primaryLogin associated with the account */
        primaryLogin: PropTypes.string,
    }),

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    credentials: PropTypes.objectOf(PropTypes.string),

    signInProvider: PropTypes.oneOf(['google', 'apple']),

    ...withLocalizePropTypes,

    ...windowDimensionsPropTypes,
};

const defaultProps = {
    account: {},
    betas: [],
    credentials: {},
    signInProvider: 'google',
};

const capitalize = (word) => word.charAt(0).toUpperCase() + word.slice(1);

function ThirdPartySignInPage(props) {
    useEffect(() => {
        Performance.measureTTI();

        App.setLocale(Localize.getDevicePreferredLocale());
    }, []);

    const continueWithCurrentSession = () => {
        console.log('ContinueWithCurrentSession');
    };

    const goBack = () => {
        Navigation.navigate(ROUTES.HOME);
    };

    window.account = props.account;

    return (
        <SafeAreaView style={[styles.signInPage]}>
            <SignInPageLayout
                welcomeHeader={props.translate('welcomeText.getStarted')}
                shouldShowWelcomeHeader
            >
                <Text style={[styles.mb5]}>{props.translate('thirdPartySignIn.alreadySignedIn', {email: 'johndoe@example.com'})}</Text>
                <Button
                    large
                    text={props.translate('thirdPartySignIn.continueWithMyCurrentSession')}
                    onPress={continueWithCurrentSession}
                />
                <Text style={[styles.mb5, styles.mt5]}>{props.translate('thirdPartySignIn.or')}</Text>
                {props.signInProvider === 'google' && (
                    <Button
                        large
                        text="Continue with Google"
                        style={[styles.mb5]}
                        onPress={continueWithCurrentSession}
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

export default compose(
    withLocalize,
    withWindowDimensions,
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
        betas: {key: ONYXKEYS.BETAS},
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(ThirdPartySignInPage);
