import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    TextInput,
    View,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import validateLinkPropTypes from './validateLinkPropTypes';
import styles from '../styles/styles';
import {setPassword} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import Button from '../components/Button';
import themeColors from '../styles/themes/default';
import SignInPageLayout from './signin/SignInPageLayout';
import canFocusInputOnScreenFocus from '../libs/canFocusInputOnScreenFocus';
import withLocalize, {withLocalizePropTypes} from '../components/withLocalize';
import compose from '../libs/compose';

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
            formError: null,
        };
    }

    /**
     * Validate the form and then submit it
     */
    validateAndSubmitForm() {
        if (!this.state.password.trim()) {
            this.setState({
                formError: this.props.translate('setPasswordPage.passwordCannotBeBlank'),
            });
            return;
        }

        this.setState({
            formError: null,
        });
        setPassword(
            this.state.password,
            lodashGet(this.props.route, 'params.validateCode', ''),
            lodashGet(this.props.route, 'params.accountID', ''),
        );
    }

    render() {
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout>
                    <View style={[styles.mb4]}>
                        <Text style={[styles.formLabel]}>
                            {this.props.translate('setPasswordPage.enterPassword')}
                        </Text>
                        <TextInput
                            style={[styles.textInput]}
                            value={this.state.password}
                            secureTextEntry
                            autoCompleteType="password"
                            textContentType="password"
                            onChangeText={text => this.setState({password: text})}
                            onSubmitEditing={this.validateAndSubmitForm}
                            autoCapitalize="none"
                            placeholderTextColor={themeColors.placeholderText}
                            autoFocus={canFocusInputOnScreenFocus()}
                        />
                    </View>
                    <View>
                        <Button
                            success
                            style={[styles.mb2]}
                            text={this.props.translate('setPasswordPage.setPassword')}
                            isLoading={this.props.account.loading}
                            onPress={this.validateAndSubmitForm}
                        />
                    </View>

                    {this.state.formError && (
                        <Text style={[styles.formError]}>
                            {this.state.formError}
                        </Text>
                    )}

                    {!_.isEmpty(this.props.account.error) && (
                        <Text style={[styles.formError]}>
                            {this.props.account.error}
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
