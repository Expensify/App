import React, {Component} from 'react';
import {
    SafeAreaView,
    Text,
    TextInput,
    Image,
    View,
    Button,
} from 'react-native';
import PropTypes from 'prop-types';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash.get';
import lodashHas from 'lodash.has';
import compose from '../libs/compose';
import {Redirect, withRouter} from '../libs/Router';
import styles from '../styles/styles';
import logo from '../../assets/images/expensify-logo-round.png';
import CustomStatusBar from '../components/CustomStatusBar';
import {setPassword} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import ROUTES from '../ROUTES';

const propTypes = {
    // These are from withRouter
    // eslint-disable-next-line react/forbid-prop-types
    match: PropTypes.object.isRequired,

    /* Onyx Props */

    // The credentials of the logged in person
    credentials: PropTypes.shape({
        // The email the user logged in with
        login: PropTypes.string,

        // The password used to log in the user
        password: PropTypes.string,
    }),
};

const defaultProps = {
    credentials: null,
};

class SetPasswordPage extends Component {
    constructor(props) {
        super(props);

        this.submitForm = this.submitForm.bind(this);

        this.state = {
            password: '',
            isLoading: false,
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
            isLoading: true,
            formError: null,
        });
        setPassword(this.state.password, lodashGet(this.props.match.params, 'validateCode', ''));
    }

    render() {
        // If someone manually navigates to this page, and there is already a password set in the credentials
        // then they can't set a new password and should be taken to the root of the application
        if (lodashHas(this.props.credentials, 'password')) {
            return <Redirect to={ROUTES.ROOT} />;
        }

        return (
            <>
                <CustomStatusBar />
                <SafeAreaView style={[styles.signInPage]}>
                    <View style={[styles.signInPageInner]}>
                        <View style={[styles.signInPageLogo]}>
                            <Image
                                resizeMode="contain"
                                style={[styles.signinLogo]}
                                source={logo}
                            />
                        </View>
                        <View style={[styles.mb4]}>
                            <Text style={[styles.formLabel]}>Enter a password</Text>
                            <TextInput
                                style={[styles.textInput]}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={this.state.password}
                                onChangeText={text => this.setState({password: text})}
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                        <View>
                            <Button
                                containerStyles={[styles.mb4]}
                                onPress={this.submitForm}
                                isLoading={this.state.isLoading}
                                text="Set Password"
                            />
                        </View>
                        {this.state.formError && (
                            <Text style={[styles.formError]}>
                                {this.state.formError}
                            </Text>
                        )}
                    </View>
                </SafeAreaView>
            </>
        );
    }
}

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default compose(
    withRouter,
    withOnyx({
        credentials: {key: ONYXKEYS.CREDENTIALS},
    }),
)(SetPasswordPage);
