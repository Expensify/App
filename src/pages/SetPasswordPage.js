import React from 'react';
import {
    Image, SafeAreaView, Text, TextInput, View,
} from 'react-native';
import PropTypes from 'prop-types';
import lodashGet from 'lodash/get';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import styles from '../styles/styles';
import SignInPageLayout from './signin/SignInPageLayout';
import welcomeScreenshot from '../../assets/images/welcome-screenshot.png';
import withWindowDimensions from '../components/withWindowDimensions';
import WelcomeText from '../components/WelcomeText';
import ONYXKEYS from '../ONYXKEYS';
import {setPassword} from '../libs/actions/Session';
import ButtonWithLoader from '../components/ButtonWithLoader';
import compose from '../libs/compose';

const propTypes = {
    /* Onyx Props */

    // The details about the account that the user is signing in with
    account: PropTypes.shape({
        // An error message to display to the user
        error: PropTypes.string,

        // Whether or not a sign on form is loading (being submitted)
        loading: PropTypes.bool,
    }),

    // The credentials of the logged in person
    credentials: PropTypes.shape({
        // The email the user logged in with
        login: PropTypes.string,

        // The password used to log in the user
        password: PropTypes.string,
    }),

    // Is this displaying on a device with a narrower screen width?
    isSmallScreenWidth: PropTypes.bool.isRequired,

    route: PropTypes.shape({
        params: PropTypes.shape({
            validateCode: PropTypes.string,
        }),
    }),
};
const defaultProps = {
    account: {},
    credentials: {},
    route: {
        params: {},
    },
};

class SetPasswordPage extends React.Component {
    constructor(props) {
        super(props);
        this.submitForm = this.submitForm.bind(this);

        this.state = {
            password: '',
            formError: null,
        };
    }

    /**
     * Validate the form and then submit it
     */
    submitForm() {
        if (!this.state.password.trim()) {
            this.setState({
                formError: 'Password cannot be blank',
            });
            return;
        }

        this.setState({
            formError: null,
        });
        setPassword(this.state.password, lodashGet(this.props.route, 'params.validateCode', ''));
    }

    render() {
        return (
            <SafeAreaView style={[styles.signInPage]}>
                <SignInPageLayout>
                    <View style={[styles.loginFormContainer]}>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel]}>Enter a password:</Text>
                            <TextInput
                                style={[styles.textInput]}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.password}
                                onChangeText={text => this.setState({password: text})}
                                onSubmitEditing={this.submitForm}
                                autoFocus
                            />
                        </View>
                        <ButtonWithLoader
                            text="Set Password"
                            onClick={this.submitForm}
                            isLoading={this.props.account.loading}
                        />
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
                        {this.props.isSmallScreenWidth && (
                            <View style={[styles.mt5, styles.mb5]}>
                                <Image
                                    resizeMode="contain"
                                    style={[styles.signinWelcomeScreenshot]}
                                    source={welcomeScreenshot}
                                />
                            </View>
                        )}
                    </View>
                    <WelcomeText />
                </SignInPageLayout>
            </SafeAreaView>
        );
    }
}

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default compose(
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
        account: {key: ONYXKEYS.ACCOUNT},
    }),
    withWindowDimensions,
)(SetPasswordPage);
