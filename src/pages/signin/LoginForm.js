import React from 'react';
import {TextInput, View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import styles from '../../styles/styles';
import themeColors from '../../styles/themes/default';
import Button from '../../components/Button';
import Text from '../../components/Text';
import ONYXKEYS from '../../ONYXKEYS';
import withWindowDimensions, {windowDimensionsPropTypes} from '../../components/withWindowDimensions';
import compose from '../../libs/compose';
import canFocusInputOnScreenFocus from '../../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import getEmailKeyboardType from '../../libs/getEmailKeyboardType';

const propTypes = {

    onChangeLogin: PropTypes.func.isRequired,

    login: PropTypes.string,

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
    login: '',
    account: {},
};

class LoginForm extends React.Component {
    constructor(props) {
        super(props);


        this.onChangeLogin = this.props.onChangeLogin.bind(this);
        this.validateAndSubmitForm = this.props.onSubmitLogin.bind(this);
    }


    render() {
        return (
            <>
                <View style={[styles.mt3]}>
                    <Text style={[styles.formLabel]}>{this.props.translate('loginForm.enterYourPhoneOrEmail')}</Text>
                    <TextInput
                        style={[styles.textInput]}
                        value={this.props.login}
                        autoCompleteType="email"
                        textContentType="username"
                        onChangeText={this.onChangeLogin}
                        onSubmitEditing={this.validateAndSubmitForm}
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType={getEmailKeyboardType()}
                        placeholder={this.props.translate('loginForm.phoneOrEmail')}
                        placeholderTextColor={themeColors.placeholderText}
                        autoFocus={canFocusInputOnScreenFocus()}
                    />
                </View>
                <View style={[styles.mt5]}>
                    <Button
                        success
                        text={this.props.translate('common.continue')}
                        isLoading={this.props.account.loading}
                        onPress={this.validateAndSubmitForm}
                    />
                </View>

                {this.props.loginError && (
                    <Text style={[styles.formError]}>
                        {this.props.loginError}
                    </Text>
                )}

                {!_.isEmpty(this.props.account.error) && (
                    <Text style={[styles.formError]}>
                        {this.props.account.error}
                    </Text>
                )}
                {!_.isEmpty(this.props.account.success) && (
                    <Text style={[styles.formSuccess]}>
                        {this.props.account.success}
                    </Text>
                )}
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
