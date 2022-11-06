import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import PropTypes from 'prop-types';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import Navigation from '../../libs/Navigation/Navigation';
import styles from '../../styles/styles';
import DotIndicatorMessage from '../../components/DotIndicatorMessage';
import OfflineIndicator from '../../components/OfflineIndicator';
import Text from '../../components/Text';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';

const propTypes = {
    /* Onyx Props */

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email/phone the user logged in with */
        login: PropTypes.string,
    }).isRequired,

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,

        /** Whether or not the account is validated */
        validated: PropTypes.bool,
    }),
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};
class ResendValidationLinkPage extends Component {
    render() {
        const isSMSLogin = Str.isSMSLogin(this.props.credentials.login);
        const login = isSMSLogin ? this.props.toLocalPhone(Str.removeSMSDomain(this.props.credentials.login)) : this.props.credentials.login;
        const loginType = (isSMSLogin ? this.props.translate('common.phone') : this.props.translate('common.email')).toLowerCase();
        return (
            <ScreenWrapper onTransitionEnd={() => {
                if (!this.currentPasswordInputRef) {
                    return;
                }

                this.currentPasswordInputRef.focus();
            }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('resendValidationForm.resendLink')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                <View style={[styles.ph5, styles.pb5]}>
                    <View style={[styles.mv5]}>
                        <Text>
                            {this.props.translate('resendValidationForm.weSentYouMagicSignInLink', {login, loginType})}
                        </Text>
                    </View>
                    {!_.isEmpty(this.props.account.message) && (

                    // DotIndicatorMessage mostly expects onyxData errors so we need to mock an object so that the messages looks similar to prop.account.errors
                    <DotIndicatorMessage style={[styles.mb5]} type="success" messages={{0: this.props.account.message}} />
                    )}
                    {!_.isEmpty(this.props.account.errors) && (
                    <DotIndicatorMessage style={[styles.mb5]} type="error" messages={this.props.account.errors} />
                    )}
                    <OfflineIndicator containerStyles={[styles.mv1]} />
                </View>
            </ScreenWrapper>
        );
    }
}

ResendValidationLinkPage.propTypes = propTypes;
ResendValidationLinkPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(ResendValidationLinkPage);
