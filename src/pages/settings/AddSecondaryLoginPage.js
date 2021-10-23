import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import {clearUserErrorMessage, setSecondaryLogin} from '../../libs/actions/User';
import ONYXKEYS from '../../ONYXKEYS';
import Button from '../../components/Button';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import KeyboardAvoidingView from '../../components/KeyboardAvoidingView';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import FixedFooter from '../../components/FixedFooter';
import ExpensiTextInput from '../../components/ExpensiTextInput';
import userPropTypes from './userPropTypes';

const propTypes = {
    /* Onyx Props */
    user: userPropTypes,

    // Route object from navigation
    route: PropTypes.shape({
        // Params that are passed into the route
        params: PropTypes.shape({
            // The type of secondary login to be added (email|phone)
            type: PropTypes.string,
        }),
    }),

    ...withLocalizePropTypes,
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
        this.onSecondaryLoginChange = this.onSecondaryLoginChange.bind(this);
        this.validateForm = this.validateForm.bind(this);

        this.phoneNumberInputRef = null;
    }

    componentWillUnmount() {
        clearUserErrorMessage();
    }

    onSecondaryLoginChange(login) {
        if (this.formType === CONST.LOGIN_TYPE.EMAIL) {
            this.setState({login});
        } else if (this.formType === CONST.LOGIN_TYPE.PHONE
            && (CONST.REGEX.DIGITS_AND_PLUS.test(login) || login === '')) {
            this.setState({login});
        }
    }

    /**
     * Add a secondary login to a user's account
     */
    submitForm() {
        setSecondaryLogin(this.state.login, this.state.password)
            .then((response) => {
                if (response.jsonCode === 200) {
                    Navigation.navigate(ROUTES.SETTINGS_PROFILE);
                }
            });
    }

    /**
     * Determine whether the form is valid
     *
     * @returns {Boolean}
     */
    validateForm() {
        const validationMethod = this.formType === CONST.LOGIN_TYPE.PHONE ? Str.isValidPhone : Str.isValidEmail;
        return !this.state.password || !validationMethod(this.state.login);
    }

    render() {
        return (
            <ScreenWrapper onTransitionEnd={() => {
                if (this.phoneNumberInputRef) {
                    this.phoneNumberInputRef.focus();
                }
            }}
            >
                <KeyboardAvoidingView>
                    <HeaderWithCloseButton
                        title={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                            ? 'addSecondaryLoginPage.addPhoneNumber'
                            : 'addSecondaryLoginPage.addEmailAddress')}
                        shouldShowBackButton
                        onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                        onCloseButtonPress={() => Navigation.dismissModal()}
                    />
                    <ScrollView style={styles.flex1} contentContainerStyle={styles.p5}>
                        <Text style={[styles.mb6]}>
                            {this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                ? 'addSecondaryLoginPage.enterPreferredPhoneNumberToSendValidationLink'
                                : 'addSecondaryLoginPage.enterPreferredEmailToSendValidationLink')}
                        </Text>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? 'common.phoneNumber'
                                    : 'profilePage.emailAddress')}
                                ref={el => this.phoneNumberInputRef = el}
                                value={this.state.login}
                                onChangeText={this.onSecondaryLoginChange}
                                keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                                    ? CONST.KEYBOARD_TYPE.PHONE_PAD : undefined}
                                returnKeyType="done"
                            />
                        </View>
                        <View style={styles.mb6}>
                            <ExpensiTextInput
                                label={this.props.translate('common.password')}
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
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            style={[styles.mb2]}
                            isDisabled={this.validateForm()}
                            isLoading={this.props.user.loading}
                            text={this.props.translate('addSecondaryLoginPage.sendValidation')}
                            onPress={this.submitForm}
                        />
                    </FixedFooter>
                </KeyboardAvoidingView>
            </ScreenWrapper>
        );
    }
}

AddSecondaryLoginPage.propTypes = propTypes;
AddSecondaryLoginPage.defaultProps = defaultProps;
AddSecondaryLoginPage.displayName = 'AddSecondaryLoginPage';

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
    }),
)(AddSecondaryLoginPage);
