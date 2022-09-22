import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import redirectToSignIn from '../../libs/actions/SignInRedirect';
import Avatar from '../../components/Avatar';
import * as ReportUtils from '../../libs/ReportUtils';
import OfflineIndicator from '../../components/OfflineIndicator';
import networkPropTypes from '../../components/networkPropTypes';
import {withNetwork} from '../../components/OnyxProvider';

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

    /** Information about the network */
    network: networkPropTypes.isRequired,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

class ResendValidationForm extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formSuccess: '',
        };
    }

    componentWillUnmount() {
        if (!this.successMessageTimer) {
            return;
        }

        clearTimeout(this.successMessageTimer);
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        this.setState({
            formSuccess: this.props.translate('resendValidationForm.linkHasBeenResent'),
        });

        if (!this.props.account.validated) {
            Session.resendValidationLink();
        } else {
            Session.resetPassword();
        }

        this.successMessageTimer = setTimeout(() => {
            this.setState({formSuccess: ''});
        }, 5000);
    }

    render() {
        const isSMSLogin = Str.isSMSLogin(this.props.credentials.login);
        const login = isSMSLogin ? this.props.toLocalPhone(Str.removeSMSDomain(this.props.credentials.login)) : this.props.credentials.login;
        const loginType = (isSMSLogin ? this.props.translate('common.phone') : this.props.translate('common.email')).toLowerCase();

        return (
            <>
                <View style={[styles.mt3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                    <Avatar
                        source={ReportUtils.getDefaultAvatar(this.props.credentials.login)}
                        imageStyles={[styles.mr2]}
                    />
                    <View style={[styles.flex1]}>
                        <Text style={[styles.textStrong]}>
                            {login}
                        </Text>
                    </View>
                </View>
                <View style={[styles.mv5]}>
                    <Text>
                        {this.props.translate('resendValidationForm.weSentYouMagicSignInLink', {login, loginType})}
                    </Text>
                </View>
                {!_.isEmpty(this.state.formSuccess) && (
                    <Text style={[styles.formSuccess]}>
                        {this.state.formSuccess}
                    </Text>
                )}
                <View style={[styles.mb4, styles.flexRow, styles.justifyContentBetween, styles.alignItemsCenter]}>
                    <TouchableOpacity onPress={() => redirectToSignIn()}>
                        <Text>
                            {this.props.translate('common.back')}
                        </Text>
                    </TouchableOpacity>
                    <Button
                        medium
                        success
                        text={this.props.translate('resendValidationForm.resendLink')}
                        isLoading={this.props.account.loading}
                        onPress={this.validateAndSubmitForm}
                        isDisabled={this.props.network.isOffline}
                    />
                </View>
                <OfflineIndicator containerStyles={[styles.mv1]} />
            </>
        );
    }
}

ResendValidationForm.propTypes = propTypes;
ResendValidationForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withNetwork(),
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(ResendValidationForm);
