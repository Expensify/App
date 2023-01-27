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
import SignInPageLayout from './signin/SignInPageLayout';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';
import NewPasswordForm from './settings/NewPasswordForm';
import FormAlertWithSubmitButton from '../components/FormAlertWithSubmitButton';
import FormSubmit from '../components/FormSubmit';
import * as ErrorUtils from '../libs/ErrorUtils';
import OfflineIndicator from '../components/OfflineIndicator';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
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
        errors: PropTypes.objectOf(PropTypes.string),
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
        errors: null,
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

    componentWillUnmount() {
        Session.clearAccountMessages();
    }

    validateAndSubmitForm() {
        if (!this.state.isFormValid) {
            return;
        }
        const accountID = lodashGet(this.props.route.params, 'accountID', '');
        const validateCode = lodashGet(this.props.route.params, 'validateCode', '');
        Session.updatePasswordAndSignin(accountID, validateCode, this.state.password);
    }

    render() {
        const buttonText = this.props.translate('setPasswordPage.setPassword');
        const error = ErrorUtils.getLatestErrorMessage(this.props.account) || ErrorUtils.getLatestErrorMessage(this.props.session);
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout
                    shouldShowWelcomeText
                    welcomeText={this.props.translate('setPasswordPage.passwordFormTitle')}
                >
                    <FormSubmit onSubmit={this.validateAndSubmitForm}>
                        <View style={[styles.mb4]}>
                            <NewPasswordForm
                                password={this.state.password}
                                updatePassword={password => this.setState({password})}
                                updateIsFormValid={isValid => this.setState({isFormValid: isValid})}
                            />
                        </View>
                        <View>
                            <FormAlertWithSubmitButton
                                buttonText={buttonText}
                                isLoading={this.props.account.isLoading}
                                onSubmit={this.validateAndSubmitForm}
                                containerStyles={[styles.mb2, styles.mh0]}
                                message={error}
                                isAlertVisible={!_.isEmpty(error)}
                                isDisabled={!this.state.isFormValid}
                            />
                        </View>
                    </FormSubmit>
                    <OfflineIndicator containerStyles={[styles.mv1]} />
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
    }),
)(SetPasswordPage);
