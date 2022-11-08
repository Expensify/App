import React, {Component} from 'react';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import HeaderWithCloseButton from '../../components/HeaderWithCloseButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import * as User from '../../libs/actions/User';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import CONST from '../../CONST';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import TextInput from '../../components/TextInput';
import * as LoginUtils from '../../libs/LoginUtils';
import * as ValidationUtils from '../../libs/ValidationUtils';
import Form from '../../components/Form';

const propTypes = {

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
    route: {},
};

class AddSecondaryLoginPage extends Component {
    constructor(props) {
        super(props);

        this.formType = props.route.params.type;
        this.onSubmit = this.onSubmit.bind(this);
        this.validate = this.validate.bind(this);
    }

    componentWillUnmount() {
        User.clearSecondaryLoginFormError();
    }

    /**
     * Add a secondary login to a user's account
     * @param {Object} values - form input values passed by the Form component
     */
    onSubmit(values) {
        const login = this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtils.getPhoneNumberWithoutSpecialChars(values.emailOrPhone)
            : values.emailOrPhone;

        User.setSecondaryLoginAndNavigate(login, values.password);
    }

    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    validate(values) {
        const errors = {};

        const login = values.emailOrPhone && this.formType === CONST.LOGIN_TYPE.PHONE
            ? LoginUtils.getPhoneNumberWithoutSpecialChars(values.emailOrPhone)
            : values.emailOrPhone;

        const validationMethod = this.formType === CONST.LOGIN_TYPE.PHONE ? Str.isValidPhone : Str.isValidEmail;

        if (!validationMethod(login)) {
            errors.emailOrPhone = this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                ? 'bankAccount.error.phoneNumber'
                : 'addSecondaryLoginPage.enterValidEmail');
        }

        if (!values.password || !ValidationUtils.isValidPassword(values.password)) {
            errors.password = this.props.translate('addSecondaryLoginPage.enterValidPassword');
        }
        return errors;
    }

    render() {
        return (
            <ScreenWrapper>
                <HeaderWithCloseButton
                    title={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                        ? 'addSecondaryLoginPage.addPhoneNumber'
                        : 'addSecondaryLoginPage.addEmailAddress')}
                    shouldShowBackButton
                    onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_PROFILE)}
                    onCloseButtonPress={() => Navigation.dismissModal()}
                />
                <Form
                    formID={ONYXKEYS.FORMS.SECONDARY_LOGIN_FORM}
                    validate={this.validate}
                    onSubmit={this.onSubmit}
                    submitButtonText={this.props.translate('addSecondaryLoginPage.sendValidation')}
                    style={[styles.flexGrow1, styles.mh5]}
                >
                    <Text style={[styles.mb6]}>
                        {this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                            ? 'addSecondaryLoginPage.enterPreferredPhoneNumberToSendValidationLink'
                            : 'addSecondaryLoginPage.enterPreferredEmailToSendValidationLink')}
                    </Text>
                    <View style={styles.mb6}>
                        <TextInput
                            autoFocus
                            shouldDelayFocus
                            label={this.props.translate(this.formType === CONST.LOGIN_TYPE.PHONE
                                ? 'common.phoneNumber'
                                : 'profilePage.emailAddress')}
                            inputID="emailOrPhone"
                            keyboardType={this.formType === CONST.LOGIN_TYPE.PHONE
                                ? CONST.KEYBOARD_TYPE.PHONE_PAD : CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                            returnKeyType="done"
                        />
                    </View>
                    <View style={styles.mb6}>
                        <TextInput
                            label={this.props.translate('common.password')}
                            inputID="password"
                            secureTextEntry
                            autoCompleteType="password"
                            textContentType="password"
                            onSubmitEditing={this.onSubmit}
                        />
                    </View>
                </Form>
            </ScreenWrapper>
        );
    }
}

AddSecondaryLoginPage.propTypes = propTypes;
AddSecondaryLoginPage.defaultProps = defaultProps;

export default withLocalize(AddSecondaryLoginPage);
