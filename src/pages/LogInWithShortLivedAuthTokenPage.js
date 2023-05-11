import React, {Component} from 'react';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import Text from '../components/Text';
import * as Session from '../libs/actions/Session';
import FullScreenLoadingIndicator from '../components/FullscreenLoadingIndicator';
import Navigation from '../libs/Navigation/Navigation';
import styles from '../styles/styles';
import colors from '../styles/colors';
import Icon from '../components/Icon';
import * as Expensicons from '../components/Icon/Expensicons';
import * as Illustrations from '../components/Icon/Illustrations';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import TextLink from '../components/TextLink';
import ONYXKEYS from '../ONYXKEYS';

const propTypes = {
    /** The parameters needed to authenticate with a short lived token are in the URL */
    route: PropTypes.shape({
        /** Each parameter passed via the URL */
        params: PropTypes.shape({
            /** Short lived authToken to sign in a user */
            shortLivedAuthToken: PropTypes.string,

            /** Short lived authToken to sign in as a user, if they are coming from the old mobile app */
            shortLivedToken: PropTypes.string,

            /** The email of the transitioning user */
            email: PropTypes.string,
        }),
    }).isRequired,

    ...withLocalizePropTypes,

    /** Whether the short lived auth token is valid */
    isTokenValid: PropTypes.bool,
};

const defaultProps = {
    isTokenValid: true,
};

class LogInWithShortLivedAuthTokenPage extends Component {
    componentDidMount() {
        const email = lodashGet(this.props, 'route.params.email', '');

        // We have to check for both shortLivedAuthToken and shortLivedToken, as the old mobile app uses shortLivedToken, and is not being actively updated.
        const shortLivedAuthToken = lodashGet(this.props, 'route.params.shortLivedAuthToken', '') || lodashGet(this.props, 'route.params.shortLivedToken', '');
        if (shortLivedAuthToken) {
            Session.signInWithShortLivedAuthToken(email, shortLivedAuthToken);
            return;
        }
        const exitTo = lodashGet(this.props, 'route.params.exitTo', '');
        if (exitTo) {
            Navigation.isNavigationReady().then(() => {
                Navigation.navigate(exitTo);
            });
        }
    }

    render() {
        if (this.props.isTokenValid) {
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
                    <Text style={[styles.textHeadline, styles.textXXLarge]}>{this.props.translate('deeplinkWrapper.launching')}</Text>
                    <View style={styles.mt2}>
                        <Text style={[styles.fontSizeNormal, styles.textAlignCenter]}>
                            {this.props.translate('deeplinkWrapper.expired')} <TextLink onPress={() => Navigation.navigate()}>{this.props.translate('deeplinkWrapper.signIn')}</TextLink>
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
}

LogInWithShortLivedAuthTokenPage.propTypes = propTypes;
LogInWithShortLivedAuthTokenPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        isTokenValid: {key: ONYXKEYS.IS_TOKEN_VALID},
    }),
)(LogInWithShortLivedAuthTokenPage);
