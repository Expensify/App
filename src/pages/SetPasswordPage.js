import React, {Component} from 'react';
import {
    SafeAreaView,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import validateLinkPropTypes from './validateLinkPropTypes';
import styles from '../styles/styles';
import {setPassword, signIn} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import Button from '../components/Button';
import SignInPageLayout from './signin/SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import NewPasswordForm from './settings/NewPasswordForm';
import Text from '../components/Text';
import * as API from '../libs/API';
import CONST from '../CONST';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,

        /** The password used to log in the user */
        password: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
    route: {
        params: {},
    },
};

class SetPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            password: '',
            isFormValid: false,
            error: '',
        };
    }

    /**
     * Validate the form and then submit it
     */
    validateAndSubmitForm() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        if (!this.state.isFormValid) {
            return;
        }
        API.ValidateEmail({
            accountID,
            validateCode,
        }).then((responseValidate) => {
            if (responseValidate.jsonCode === 200) {
                API.ChangePassword({
                    authToken: responseValidate.authToken,
                    password: this.state.password,
                }).then((responsePassword) => {
                    if (responsePassword.jsonCode === 200) {
                        signIn(this.state.password);
                    } else {
                        this.setState({
                            error: this.props.translate('setPasswordPage.passwordNotSet'),
                        });
                    }
                });
            } else if (responseValidate.title === CONST.PASSWORD_PAGE.ERROR.ALREADY_VALIDATED) {
                // If the email is already validated, set the password using the validate code
                setPassword(
                    this.state.password,
                    lodashGet(this.props.route, 'params.validateCode', ''),
                    lodashGet(this.props.route, 'params.accountID', ''),
                );
            } else {
                this.setState({
                    error: this.props.translate('setPasswordPage.accountNotValidated'),
                });
            }
        });
    }

    render() {
        const error = this.state.error || this.props.account.error;
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout welcomeText={this.props.translate('setPasswordPage.passwordFormTitle')}>
                    <View style={[styles.mb4]}>
                        <NewPasswordForm
                            password={this.state.password}
                            updatePassword={password => this.setState({password})}
                            updateIsFormValid={isValid => this.setState({isFormValid: isValid})}
                            onSubmitEditing={this.validateAndSubmitForm}
                        />
                    </View>
                    <View>
                        <Button
                            success
                            style={[styles.mb2]}
                            text={this.props.translate('setPasswordPage.setPassword')}
                            isLoading={this.props.account.loading}
                            onPress={this.validateAndSubmitForm}
                            isDisabled={!this.state.isFormValid}
                        />
                    </View>
                    {!_.isEmpty(error) && (
                        <Text style={[styles.formError]}>
                            {error}
                        </Text>
                    )}
                </SignInPageLayout>
            </SafeAreaView>
        );
    }
}

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
)(SetPasswordPage);
