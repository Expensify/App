import React, {Component} from 'react';
import Onyx, {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, TextInput} from 'react-native';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import {setSecondaryLogin} from '../../libs/actions/User';
import ONYXKEYS from '../../ONYXKEYS';
import ButtonWithLoader from '../../components/ButtonWithLoader';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';

const propTypes = {
    /* Onyx Props */
    // The details about the user that is signed in
    user: PropTypes.shape({
        // error associated with adding a secondary login
        error: PropTypes.string,

        // Whether the form is being submitted
        loading: PropTypes.bool,

        // Whether or not the user is subscribed to news updates
        loginList: PropTypes.arrayOf(PropTypes.shape({

            // Value of partner name
            partnerName: PropTypes.string,

            // Phone/Email associated with user
            partnerUserID: PropTypes.string,

            // Date of when login was validated
            validatedDate: PropTypes.string,
        })),
    }),

    // Route object from navigation
    route: PropTypes.shape({
        params: PropTypes.shape({
            type: PropTypes.string,
        }),
    }),
};

const defaultProps = {
    user: {},
    route: {},
};

class AddSecondaryLoginPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            login: '',
            password: '',
        };
        this.formType = props.route.params.type;
        this.submitForm = this.submitForm.bind(this);
        this.validateForm = this.validateForm.bind(this);
    }

    componentWillUnmount() {
        Onyx.merge(ONYXKEYS.USER, {error: ''});
    }

    submitForm() {
        setSecondaryLogin(this.state.login, this.state.password)
            .then((response) => {
                if (response.jsonCode === 200) {
                    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
                }
            });
    }

    // Determines whether form is valid
    validateForm() {
        const validationMethod = this.formType === CONST.LOGIN_TYPE.PHONE ? Str.isValidPhone : Str.isValidEmail;
        return !this.state.password || !validationMethod(this.state.login);
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.formType === CONST.LOGIN_TYPE.PHONE ? 'Add Phone Number' : 'Add Email Address'}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={Navigation.dismissModal}
                />
                <View style={[styles.p5, styles.flex1, styles.overflowScroll]}>
                    <View style={styles.flexGrow1}>
                        <Text style={[styles.mb6, styles.textP]}>
                            {this.formType === CONST.LOGIN_TYPE.PHONE
                                ? 'Enter your preferred phone number and password to send a validation link.'
                                : 'Enter your preferred email address and password to send a validation link.'}
                        </Text>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>
                                {this.formType === CONST.LOGIN_TYPE.PHONE ? 'Phone Number' : 'Email Address'}
                            </Text>
                            <TextInput
                                style={styles.textInput}
                                value={this.state.login}
                                onChangeText={login => this.setState({login})}
                                autoFocus
                                keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                                returnKeyType="done"
                            />
                        </View>
                        <View style={styles.mb6}>
                            <Text style={[styles.mb1, styles.formLabel]}>Password</Text>
                            <TextInput
                                style={styles.textInput}
                                value={this.state.password}
                                onChangeText={password => this.setState({password})}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                        {!_.isEmpty(this.props.user.error) && (
                            <Text style={styles.formError}>
                                {this.props.user.error}
                            </Text>
                        )}
                    </View>
                    <View style={[styles.flexGrow0]}>
                        <ButtonWithLoader
                            isDisabled={this.validateForm()}
                            isLoading={this.props.user.loading}
                            text="Send Validation"
                            onClick={this.submitForm}
                        />
                    </View>
                </View>
            </ScreenWrapper>
        );
    }
}

AddSecondaryLoginPage.propTypes = propTypes;
AddSecondaryLoginPage.defaultProps = defaultProps;
AddSecondaryLoginPage.displayName = 'AddSecondaryLoginPage';

export default withOnyx({
    user: {
        key: ONYXKEYS.USER,
    },
})(AddSecondaryLoginPage);
