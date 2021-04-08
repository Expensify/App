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
import styles from '../styles/styles';
import ExpensifyCashLogo from '../../assets/images/expensify-cash.svg';
import {setPassword} from '../libs/actions/Session';
import ONYXKEYS from '../ONYXKEYS';
import variables from '../styles/variables';
import ButtonWithLoader from '../components/ButtonWithLoader';
import routePropTypes from './validateLinkPropTypes';

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

    // The accountID and validateCode are passed via the URL
    route: PropTypes.objectOf(routePropTypes),
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
        setPassword(
            this.state.password,
            lodashGet(this.props.route, 'params.validateCode', ''),
            lodashGet(this.props.route, 'params.accountID', ''),
        );
    }

    render() {
        return (
            <>
                <SafeAreaView style={[styles.signInPage]}>
                    <View style={[styles.signInPageInner]}>
                        <View style={[styles.signInPageLogo]}>
                            <ExpensifyCashLogo
                                width={variables.componentSizeLarge}
                                height={variables.componentSizeLarge}
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
                    </View>
                </SafeAreaView>
            </>
        );
    }
}

SetPasswordPage.propTypes = propTypes;
SetPasswordPage.defaultProps = defaultProps;

export default withOnyx({
    credentials: {key: ONYXKEYS.CREDENTIALS},
    account: {key: ONYXKEYS.ACCOUNT},
})(SetPasswordPage);
