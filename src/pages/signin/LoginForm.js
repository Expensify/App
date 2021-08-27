import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Button from '../../components/Button';
import Text from '../../components/Text';
import {fetchAccountDetails} from '../../libs/actions/Session';
import ONYXKEYS from '../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import getEmailKeyboardType from '../../libs/getEmailKeyboardType';
import ExpensiTextInput from '../../components/ExpensiTextInput';

const propTypes = {
    /* Onyx Props */

    /** The details about the account that the user is signing in with */
    account: PropTypes.shape({
        /** An error message to display to the user */
        error: PropTypes.string,

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether or not a sign on form is loading (being submitted) */
        loading: PropTypes.bool,
    }),

    ...windowDimensionsPropTypes,

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);

        this.validateAndSubmitForm = this.validateAndSubmitForm.bind(this);
        this.isFormValid = this.isFormValid.bind(this);

        this.state = {
            formError: false,
            login: '',
        };
    }

    /**
     * Check that all the form fields are valid
     * @returns {Boolean}
     */
    isFormValid() {
        if (!this.state.login.trim()) {
            this.setState({formError: 'loginForm.pleaseEnterEmailOrPhoneNumber'});
            return false;
        }

        this.setState({
            formError: null,
        });

        return true;
    }


    /**
     * Check if form is valid, then trigger the submit callback
     */
    validateAndSubmitForm() {
        const isValid = this.isFormValid();

        if (isValid) {
            // Check if this login has an account associated with it or not
            fetchAccountDetails(this.state.login);
        }
    }

    render() {
        return (
            <>
                <View style={[styles.mt3]}>
                    <ExpensiTextInput
                        label={this.props.translate('loginForm.phoneOrEmail')}
                        value={this.state.login}
                        autoCompleteType="email"
                        textContentType="username"
                        onChangeText={text => this.setState({login: text})}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={getEmailKeyboardType()}
                        placeholder={this.props.translate('loginForm.enterYourPhoneOrEmail')}
                        placeholderTextColor={themeColors.placeholderText}
                        autoFocus={canFocusInputOnScreenFocus()}
                        translateX={-18}
                        onBlur={this.isFormValid}
                    />
                </View>
                {this.state.formError && (
                    <Text style={[styles.formError]}>
                        {this.props.translate(this.state.formError)}
                    </Text>
                )}

                {!this.state.formError && !_.isEmpty(this.props.account.error) && (
                    <Text style={[styles.formError]}>
                        {this.props.account.error}
                    </Text>
                )}
                {!_.isEmpty(this.props.account.success) && (
                    <Text style={[styles.formSuccess]}>
                        {this.props.account.success}
                    </Text>
                )}
                <View style={[styles.mt5]}>
                    <Button
                        success
                        text={this.props.translate('common.continue')}
                        isLoading={this.props.account.loading}
                        onPress={this.validateAndSubmitForm}
                    />
                </View>

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
)(LoginForm);
