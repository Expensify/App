import React, {useRef} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {parsePhoneNumber} from 'awesome-phonenumber';
import compose from '../../../../libs/compose';
import HeaderWithCloseButton from '../../../../components/HeaderWithCloseButton';
import ScreenWrapper from '../../../../components/ScreenWrapper';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import withLocalize, {withLocalizePropTypes} from '../../../../components/withLocalize';
import Navigation from '../../../../libs/Navigation/Navigation';
import Permissions from '../../../../libs/Permissions';
import ONYXKEYS from '../../../../ONYXKEYS';
import ROUTES from '../../../../ROUTES';
import styles from '../../../../styles/styles';
import * as User from '../../../../libs/actions/User';
import * as LoginUtils from '../../../../libs/LoginUtils';
import * as ErrorUtils from '../../../../libs/ErrorUtils';
import Form from '../../../../components/Form';
import CONST from '../../../../CONST';

const propTypes = {
    /* Onyx Props */

    /** List of betas available to current user */
    betas: PropTypes.arrayOf(PropTypes.string),

    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** The partner creating the account. It depends on the source: website, mobile, integrations, ... */
        partnerName: PropTypes.string,

        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,

        /** The date when the login was validated, used to show the brickroad status */
        validatedDate: PropTypes.string,

        /** Field-specific server side errors keyed by microtime */
        errorFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),

        /** Field-specific pending states for offline UI status */
        pendingFields: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
    }),

    ...withLocalizePropTypes,
};
const defaultProps = {
    betas: [],
    loginList: {},
};

function NewContactMethodPage(props) {
    const loginInputRef = useRef(null);

    const getPhoneLogin = (phoneOrEmail) => {
        if (_.isEmpty(phoneOrEmail)) {
            return '';
        }

        return LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(phoneOrEmail));
    };

    const validateNumber = (values) => {
        const parsedPhoneNumber = parsePhoneNumber(values);

        if (parsedPhoneNumber.possible) {
            return parsedPhoneNumber.number.e164 + CONST.SMS.DOMAIN;
        }

        return '';
    };

    const validate = (values) => {
        const phoneLogin = getPhoneLogin(values.phoneOrEmail);
        const validateIfnumber = validateNumber(phoneLogin);

        const errors = {};

        if (_.isEmpty(values.phoneOrEmail)) {
            ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', props.translate('contacts.genericFailureMessages.contactMethodRequired'));
        }

        if (!_.isEmpty(values.phoneOrEmail) && !(parsePhoneNumber(phoneLogin).possible || Str.isValidEmail(values.phoneOrEmail))) {
            ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', props.translate('contacts.genericFailureMessages.invalidContactMethod'));
        }

        if (!_.isEmpty(values.phoneOrEmail) && lodashGet(props.loginList, validateIfnumber || values.phoneOrEmail.toLowerCase())) {
            ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', props.translate('contacts.genericFailureMessages.enteredMethodIsAlreadySubmited'));
        }

        if (!Permissions.canUsePasswordlessLogins(props.betas) && _.isEmpty(values.password)) {
            errors.password = props.translate('contacts.genericFailureMessages.passwordRequired');
        }

        return errors;
    };

    const addNewContactMethod = (values) => {
        const phoneLogin = getPhoneLogin(values.phoneOrEmail);
        const validateIfnumber = validateNumber(phoneLogin);
        const submitDetail = (validateIfnumber || values.phoneOrEmail).trim().toLowerCase();

        User.addNewContactMethodAndNavigate(submitDetail, values.password);
    };

    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => {
                if (!loginInputRef.current) {
                    return;
                }

                loginInputRef.current.focus();
            }}
            includeSafeAreaPaddingBottom={false}
        >
            <HeaderWithCloseButton
                title={props.translate('contacts.newContactMethod')}
                shouldShowBackButton
                onBackButtonPress={() => Navigation.navigate(ROUTES.SETTINGS_CONTACT_METHODS)}
                onCloseButtonPress={() => Navigation.dismissModal(true)}
            />
            <Form
                formID={ONYXKEYS.FORMS.NEW_CONTACT_METHOD_FORM}
                validate={validate}
                onSubmit={addNewContactMethod}
                submitButtonText={props.translate('common.add')}
                style={[styles.flexGrow1, styles.mh5]}
                enabledWhenOffline
            >
                <Text style={[styles.mb5]}>{props.translate('common.pleaseEnterEmailOrPhoneNumber')}</Text>
                <View style={[styles.mb6]}>
                    <TextInput
                        label={`${props.translate('common.email')}/${props.translate('common.phoneNumber')}`}
                        keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                        ref={(el) => (loginInputRef.current = el)}
                        inputID="phoneOrEmail"
                        autoCapitalize="none"
                        returnKeyType={Permissions.canUsePasswordlessLogins(props.betas) ? 'done' : 'next'}
                    />
                </View>
                {!Permissions.canUsePasswordlessLogins(props.betas) && (
                    <View style={[styles.mb6]}>
                        <TextInput
                            label={props.translate('common.password')}
                            inputID="password"
                            returnKeyType="done"
                        />
                    </View>
                )}
            </Form>
        </ScreenWrapper>
    );
}

NewContactMethodPage.propTypes = propTypes;
NewContactMethodPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        betas: {key: ONYXKEYS.BETAS},
        loginList: {key: ONYXKEYS.LOGIN_LIST},
    }),
)(NewContactMethodPage);
