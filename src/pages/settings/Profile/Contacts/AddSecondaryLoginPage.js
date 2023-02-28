import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View, ScrollView} from 'react-native';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import Navigation from '../../../../libs/Navigation/Navigation';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Text from '../../../../components/Text';
import styles from '../../../../styles/styles';
import * as User from '../../../../libs/actions/User';
import ONYXKEYS from '../../../../ONYXKEYS';
import Button from '../../../../components/Button';
import ROUTES from '../../../../ROUTES';
import CONST from '../../../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import compose from '../../../../libs/compose';
import FixedFooter from '../../../../components/FixedFooter';
import TextInput from '../../../../components/TextInput';
import userPropTypes from '../../userPropTypes';
import * as LoginUtils from '../../../../libs/LoginUtils';
import Permissions from '../../../../libs/Permissions';

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

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    ...withLocalizePropTypes,
};

const defaultProps = {
    user: {},
    route: {},
    betas: [],
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
    }

    componentWillUnmount() {
        User.clearUserErrorMessage();
    }

    onSecondaryLoginChange(login) {
        this.setState({login});
    }

    /**
     * Add a secondary login to a user's account
     */
    submitForm() {
        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtils.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;
        User.setSecondaryLoginAndNavigate(login, this.state.password);
    }

    /**
     * Determine whether the form is valid
     *
     * @returns {Boolean}
     */
    validateForm() {
        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtils.getPhoneNumberWithoutSpecialChars(this.state.login)
            : this.state.login;

        const validationMethod = this.formType === CONST.LOGIN_TYPE.PHONE ? Str.isValidPhone : Str.isValidEmail;
        if (!validationMethod(login)) {
            return false;
        }

        return !Permissions.canUsePasswordlessLogins(this.props.betas) && !this.state.password;
    }

    render() {
        return (
            <ScreenWrapper
                onEntryTransitionEnd={() => {
                    if (!this.phoneNumberInputRef) {
                        return;
                    }

                    this.phoneNumberInputRef.focus();
                }}
            >
                <HeaderWithCloseButton
                    title={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                        ? 'addSecondaryLoginPage.addPhoneNumber'
                        : 'addSecondaryLoginPage.addEmailAddress')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                {/* We use keyboardShouldPersistTaps="handled" to prevent the keyboard from being hidden when switching focus on input fields  */}
                <ScrollView style={styles.flex1} contentContainerStyle={styles.p5} keyboardShouldPersistTaps="handled">
                    <Text style={[styles.mb6]}>
                        {this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                            ? 'addSecondaryLoginPage.enterPreferredPhoneNumberToSendValidationLink'
                            : 'addSecondaryLoginPage.enterPreferredEmailToSendValidationLink')}
                    </Text>
                    <View style={styles.mb6}>
                        <TextInput
                            label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                ? 'common.phoneNumber'
                                : 'profilePage.emailAddress')}
                            ref={el => this.phoneNumberInputRef = el}
                            value={this.state.login}
                            onChangeText={this.onSecondaryLoginChange}
                            keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                                ? CONST.KEYBOARD_TYPE.PHONE_PAD : CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                            returnKeyType="done"
                        />
                    </View>
                    {!Permissions.canUsePasswordlessLogins(this.props.betas) && (
                        <View style={styles.mb6}>
                            <TextInput
                                label={this.props.translate('common.password')}
                                value={this.state.password}
                                onChangeText={password => this.setState({password})}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                onSubmitEditing={this.submitForm}
                            />
                        </View>
                    )}
                    {!_.isEmpty(this.props.user.error) && (
                        <Text style={styles.formError}>
                            {this.props.user.error}
                        </Text>
                    )}
                </ScrollView>
                <FixedFooter style={[styles.flexGrow0]}>
                    <Button
                        success
                        isDisabled={this.validateForm()}
                        isLoading={this.props.user.loading}
                        text={this.props.translate('addSecondaryLoginPage.sendValidation')}
                        onPress={this.submitForm}
                        pressOnEnter
                    />
                </FixedFooter>
            </ScreenWrapper>
        );
    }
}

AddSecondaryLoginPage.propTypes = propTypes;
AddSecondaryLoginPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        user: {
            key: ONYXKEYS.USER,
        },
        betas: {
            key: ONYXKEYS.BETAS,
        },
    }),
)(AddSecondaryLoginPage);
