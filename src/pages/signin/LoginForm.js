import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import styles from '../../styles/styles';
import Text from '../../components/Text';
import * as Session from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import getEmailKeyboardType from '../../libs/getEmailKeyboardType';
import TextInput from '../../components/TextInput';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as LoginUtils from '../../libs/LoginUtils';
import withToggleVisibilityView, {toggleVisibilityViewPropTypes} from '../../components/withToggleVisibilityView';
import FormAlertWithSubmitButton from '../../components/FormAlertWithSubmitButton';
import OfflineIndicator from '../../components/OfflineIndicator';
import {withNetwork} from '../../components/OnyxProvider';
import networkPropTypes from '../../components/networkPropTypes';

const propTypes = {
    /** Should we dismiss the keyboard when transitioning away from the page? */
    blurOnSubmit: PropTypes.bool,

    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    /** Props to detect online status */
    network: networkPropTypes.isRequired,

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,

    ...toggleVisibilityViewPropTypes,
};

const defaultProps = {
    account: {},
    blurOnSubmit: false,
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);
        this.onTextInput = this.onTextInput.bind(this);
        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);

        this.state = {
            formError: false,
            login: '',
        };

        if (this.props.account.errors || this.props.account.isLoading) {
            Session.clearAccountMessages();
        }
    }

    componentDidMount() {
        if (!canFocusInputOnScreenFocus() || !this.input || !this.props.isVisible) {
            return;
        }
        this.input.focus();
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.blurOnSubmit && this.props.blurOnSubmit) {
            this.input.blur();
        }
        if (prevProps.isVisible || !this.props.isVisible) {
            return;
        }
        this.input.focus();

        if (this.state.login) {
            this.clearLogin();
        }
    }

    /**
     * Handle text input and clear formError upon text change
     *
     * @param {String} text
     */
    onTextInput(text) {
        this.setState({
            login: text,
            formError: null,
        });

        if (this.props.account.errors) {
            Session.clearAccountMessages();
        }
    }

    /**
     * Clear Login from the state
     */
    clearLogin() {
        this.setState({login: ''}, this.input.clear);
    }

    /**
     * Check that all the form fields are valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        if (this.props.network.isOffline) {
            return;
        }

        const login = this.state.login.trim();
        if (!login) {
            this.setState({formError: 'common.pleaseEnterEmailOrPhoneNumber'});
            return;
        }

        const phoneLogin = LoginUtils.getPhoneNumberWithoutSpecialChars(login);
        const isValidPhoneLogin = Str.isValidPhone(phoneLogin);

        if (!Str.isValidEmail(login) && !isValidPhoneLogin) {
            if (ValidationUtils.isNumericWithSpecialChars(login)) {
                this.setState({formError: 'common.error.phoneNumber'});
            } else {
                this.setState({formError: 'loginForm.error.invalidFormatEmailLogin'});
            }
            return;
        }

        this.setState({
            formError: null,
        });

        // Check if this login has an account associated with it or not
        Session.beginSignIn(isValidPhoneLogin ? phoneLogin : login);
    }

    render() {
        const formErrorTranslated = this.state.formError && this.props.translate(this.state.formError);
        const error = formErrorTranslated || _.chain(this.props.account.errors || [])
            .keys()
            .sortBy()
            .reverse()
            .map(key => this.props.account.errors[key])
            .first()
            .value();
        return (
            <>
                <View style={[styles.mt3]}>
                    <TextInput
                        ref={el => this.input = el}
                        label={this.props.translate('loginForm.phoneOrEmail')}
                        value={this.state.login}
                        autoCompleteType="username"
                        textContentType="username"
                        nativeID="username"
                        name="username"
                        onChangeText={this.onTextInput}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={getEmailKeyboardType()}
                    />
                </View>
                {!_.isEmpty(this.props.account.success) && (
                    <Text style={[styles.formSuccess]}>
                        {this.props.account.success}
                    </Text>
                )}
                { // We need to unmount the submit button when the component is not visible so that the Enter button
                  // key handler gets unsubscribed and does not conflict with the Password Form
                    this.props.isVisible && (
                        <View style={[styles.mt5]}>
                            <FormAlertWithSubmitButton
                                buttonText={this.props.translate('common.continue')}
                                isLoading={this.props.account.isLoading}
                                onSubmit={this.validateAndSubmitForm}
                                message={error}
                                isAlertVisible={!_.isEmpty(error)}
                                containerStyles={[styles.mh0]}
                            />
                        </View>
                    )
                }
                <OfflineIndicator containerStyles={[styles.mv1]} />
            </>
        );
    }
}

LoginForm.propTypes = propTypes;
LoginForm.defaultProps = defaultProps;

export default compose(
    withOnyx({
        account: {key: ONYXKEYS.ACCOUNT},
    }),
    withWindowDimensions,
    withLocalize,
    withToggleVisibilityView,
    withNetwork(),
)(LoginForm);
