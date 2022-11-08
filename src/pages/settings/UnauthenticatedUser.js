import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import Button from '../../components/Button';
import Text from '../../components/Text';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '../../components/withCurrentUserPersonalDetails';
import compose from '../../libs/compose';
import ONYXKEYS from '../../ONYXKEYS';
import styles from '../../styles/styles';
import * as Expensicons from '../../components/Icon/Expensicons';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import * as Session from '../../libs/actions/Session';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';

const propTypes = {
    account: PropTypes.shape({

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    ...withCurrentUserPersonalDetailsPropTypes,
    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    ...withCurrentUserPersonalDetailsDefaultProps,
};

class UnauthenticatedUser extends Component {
    constructor(props) {
        super(props);
        this.onResendValidationLink = this.onResendValidationLink.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.account.isLoading || this.props.account.isLoading) { return; }
        Navigation.navigate(ROUTES.SETTINGS_RESEND_VALIDATION_LINK);
    }

    onResendValidationLink() {
        Session.updateSessionLoginAndResendValidationLink(this.props.currentUserPersonalDetails.login);
    }

    render() {
        const isSMSLogin = Str.isSMSLogin(this.props.currentUserPersonalDetails.login);
        let note;
        if (isSMSLogin) {
            note = this.props.translate('loginField.numberHasNotBeenValidated');
        } else {
            note = this.props.translate('loginField.emailHasNotBeenValidated');
        }

        return (
            <View style={[styles.ph5, styles.pb5]}>
                <View style={[styles.mv5]}>
                    <Text>
                        {note}
                    </Text>
                </View>
                <View style={[styles.mb4, styles.flexGrow0]}>
                    <Button
                        success
                        text={this.props.translate('resendValidationForm.resendLink')}
                        icon={Expensicons.Mail}
                        isLoading={this.props.account.isLoading}
                        iconStyles={[styles.buttonCTAIcon]}
                        shouldShowRightIcon
                        onPress={this.onResendValidationLink}
                    />
                </View>
            </View>
        );
    }
}

UnauthenticatedUser.propTypes = propTypes;
UnauthenticatedUser.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(UnauthenticatedUser);
