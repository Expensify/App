import React, {useEffect} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import Text from '../components/Text';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import themeColors from '../styles/themes/default';
import Icon from '../components/Icon';
import * as Expensicons from '../components/Icon/Expensicons';
import * as Illustrations from '../components/Icon/Illustrations';
import useLocalize from '../hooks/useLocalize';
import TextLink from '../components/TextLink';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The parameters needed to authenticate with a short-lived token are in the URL */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** Short-lived authToken to sign in a user */
            shortLivedAuthToken: PropTypes.string,

            /** Short-lived authToken to sign in as a user, if they are coming from the old mobile app */
            shortLivedToken: PropTypes.string,

            /** The email of the transitioning user */
            email: PropTypes.string,
        }),
    }).isRequired,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether a sign is loading */
        isLoading: PropTypes.bool,
    }),
};

const defaultProps = {
    account: {
        isLoading: false,
    },
};

function LogInWithShortLivedAuthTokenPage(props) {
    const {translate} = useLocalize();

    useEffect(() => {
        const email = lodashGet(props, 'route.params.email', '');

        // We have to check for both shortLivedAuthToken and shortLivedToken, as the old mobile app uses shortLivedToken, and is not being actively updated.
        const shortLivedAuthToken = lodashGet(props, 'route.params.shortLivedAuthToken', '') || lodashGet(props, 'route.params.shortLivedToken', '');

        // Try to authenticate using the shortLivedToken if we're not already trying to load the accounts
        if (shortLivedAuthToken && !props.account.isLoading) {
            Session.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
            return;
        }

        // If an error is returned as part of the route, ensure we set it in the onyxData for the account
        const error = lodashGet(props, 'route.params.error', '');
        if (error) {
            Session.setAccountError(error);
        }

        const exitTo = lodashGet(props, 'route.params.exitTo', '');
        if (exitTo) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(exitTo);
            });
        }
        // The only dependencies of the effect are based on props.route
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.route]);

    if (props.account.isLoading) {
        return <FullScreenLoadingIndicator />;
    }

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
                <Text style={[styles.textHeadline, styles.textXXLarge]}>{translate('deeplinkWrapper.launching')}</Text>
                <View style={styles.mt2}>
                    <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                        {translate('deeplinkWrapper.expired')}{' '}
                        <TextLink
                            onPress={() => {
                                Session.clearSignInData();
                                Navigation.navigate();
                            }}
                        >
                            {translate('deeplinkWrapper.signIn')}
                        </TextLink>
                    </Text>
                </View>
            </View>
            <View style={styles.deeplinkWrapperFooter}>
                <Icon
                    width={154}
                    height={34}
                    fill={themeColors.success}
                    src={Expensicons.ExpensifyWordmark}
                />
            </View>
        </View>
    );
}

LogInWithShortLivedAuthTokenPage.propTypes = propTypes;
LogInWithShortLivedAuthTokenPage.defaultProps = defaultProps;
LogInWithShortLivedAuthTokenPage.displayName = 'LogInWithShortLivedAuthTokenPage';

export default withOnyx({
    account: {key: ONYXKEYS.ACCOUNT},
    session: {key: ONYXKEYS.SESSION},
})(LogInWithShortLivedAuthTokenPage);
