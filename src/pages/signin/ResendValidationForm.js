import React from 'react';
import {TouchableOpacity, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Button from '../../components/Button';
import Text from '../../components/Text';
import {reopenAccount, resendValidationLink, resetPassword} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import redirectToSignIn from '../../libs/actions/SignInRedirect';
import Avatar from '../../components/Avatar';
import {getDefaultAvatar} from '../../libs/OptionsListUtils';

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

        /** Whether or not the account is closed */
        closed: PropTypes.bool,
    }),

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
        if (this.successMessageTimer) {
            clearTimeout(this.successMessageTimer);
        }
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        this.setState({
            formSuccess: this.props.translate('resendValidationForm.linkHasBeenResent'),
        });

        if (this.props.account.closed) {
            reopenAccount();
        } else if (!this.props.account.validated) {
            resendValidationLink();
        } else {
            resetPassword();
        }

        this.successMessageTimer = setTimeout(() => {
            this.setState({formSuccess: ''});
        }, 5000);
    }

    render() {
        return (
            <>
                <View style={[styles.mt3, styles.flexRow, styles.alignItemsCenter, styles.justifyContentStart]}>
                    <Avatar
                        source={getDefaultAvatar(this.props.credentials.login)}
                        imageStyles={[styles.mr2]}
                    />
                    <Text style={[styles.textStrong]}>
                        {Str.isSMSLogin(this.props.credentials.login) ? this.props.toLocalPhone(Str.removeSMSDomain(this.props.credentials.login)) : this.props.credentials.login}
                    </Text>
                </View>
                <View>
                    <Text style={[styles.mv5]}>
                        {
                            this.props.account.validated
                                ? this.props.translate('resendValidationForm.weSentYouMagicSignInLink', {
                                    loginType: (Str.isSMSLogin(this.props.credentials.login)
                                        ? this.props.translate('common.phoneNumber')
                                            .toLowerCase()
                                        : this.props.translate('common.email')).toLowerCase(),
                                })
                                : this.props.translate('resendValidationForm.unvalidatedAccount')
                        }
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
                        success
                        text={this.props.translate('resendValidationForm.resendLink')}
                        isLoading={this.props.account.loading}
                        onPress={this.validateAndSubmitForm}
                    />
                </View>
            </>
        );
    }
}

ResendValidationForm.propTypes = propTypes;
ResendValidationForm.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(ResendValidationForm);
