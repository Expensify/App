import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../components/ScreenWrapper';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import Navigation from '../../libs/Navigation/Navigation';
import ONYXKEYS from '../../ONYXKEYS';
import EditPasswordScreen from './EditPasswordScreen';
import PasswordConfirmationScreen from './PasswordConfirmationScreen';
import UnauthenticatedUser from './UnauthenticatedUser';
import * as Session from '../../libs/actions/Session';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** Success message to display when necessary */
        success: PropTypes.string,
    }),

    /** Object with various information about the user */
    user: PropTypes.shape({
        /** Is the user account validated? */
        validated: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    user: {},
};
class PasswordPage extends Component {
    componentWillUnmount() {
        Session.clearAccountMessages();
    }

    showMainScreen() {
        if (!_.isEmpty(this.props.account.success)) {
            return <PasswordConfirmationScreen />;
        }
        if (this.props.user.validated) {
            return <EditPasswordScreen />;
        }
        return <UnauthenticatedUser />;
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={() => {
                if (!this.currentPasswordInputRef) {
                    return;
                }

                this.currentPasswordInputRef.focus();
            }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate('passwordPage.changePassword')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.goBack()}
                    onCloseButtonPress={() => Navigation.dismissModal(true)}
                />
                {this.showMainScreen()}
            </ScreenWrapper>
        );
    }
}

PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(PasswordPage);
