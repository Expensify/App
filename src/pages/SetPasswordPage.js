import React, {Component} from 'react';
import {
    SafeAreaView,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import {
    propTypes as validateLinkPropTypes,
    defaultProps as validateLinkDefaultProps,
} from './validateLinkPropTypes';
import styles from '../styles/styles';
import * as Session from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import Button from '../components/Button';
import SignInPageLayout from './signin/SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import NewPasswordForm from './settings/NewPasswordForm';
import Text from '../components/Text';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    /** The credentials of the logged in person */
    credentials: PropTypes.shape({
        /** The email the user logged in with */
        login: PropTypes.string,

        /** The password used to log in the user */
        password: PropTypes.string,
    }),

    /** Session object */
    session: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,
    }),

    /** User signup object */
    userSignUp: PropTypes.shape({
        /** Is Validating Email */
        isValidating: PropTypes.bool,

        /** Auth token used to change password */
        authToken: PropTypes.string,
    }),

    /** The accountID and validateCode are passed via the URL */
    route: validateLinkPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
    credentials: {},
    route: validateLinkDefaultProps,
    session: {
        error: '',
        authToken: '',
    },
    userSignUp: {
        isValidating: false,
        authToken: '',
    },
};

class SetPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            password: '',
            isFormValid: false,
        };
    }

    componentDidMount() {
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        if (this.props.userSignUp.authToken) {
            return;
        }
        Session.validateEmail(accountID, validateCode);
    }

    validateAndSubmitForm() {
        if (!this.state.isFormValid) {
            return;
        }
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        Session.setOrChangePassword(accountID, validateCode, this.state.password, this.props.userSignUp.authToken);
    }


    render() {
        const buttonText = this.props.userSignUp.isValidating ? this.props.translate('setPasswordPage.verifyingAccount') : this.props.translate('setPasswordPage.setPassword');
        const sessionError = this.props.session.error && this.props.translate(this.props.session.error);
        const error = sessionError || this.props.account.error;
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    shouldShowWelcomeText
                    welcomeText={this.props.translate('setPasswordPage.passwordFormTitle')}
                >
                    {_.isEmpty(error) ? (
                        <>
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
                                    text={buttonText}
                                    isLoading={this.props.account.loading || this.props.userSignUp.isValidatingEmail}
                                    onPress={this.validateAndSubmitForm}
                                    isDisabled={!this.state.isFormValid}
                                />
                            </View>
                        </>
                    )
                        : (<Text>{error}</Text>)}
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
        session: {
            key: ONYXKEYS.SESSION,
            initWithStoredValues: false,
        },
        userSignUp: {key: ONYXKEYS.USER_SIGN_UP},
    }),
)(SetPasswordPage);
