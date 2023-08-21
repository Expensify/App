import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import {parsePhoneNumber} from 'awesome-phonenumber';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
import * as LoginUtils from '../../libs/LoginUtils';
import TextInput from '../../components/TextInput';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import * as ErrorUtils from '../../libs/ErrorUtils';
import ROUTES from '../../ROUTES';
import Navigation from '../../libs/Navigation/Navigation';
import TeachersUnite from '../../libs/actions/TeachersUnite';
import useLocalize from '../../hooks/useLocalize';

const propTypes = {
    /** Login list for the user that is signed in */
    loginList: PropTypes.shape({
        /** Phone/Email associated with user */
        partnerUserID: PropTypes.string,
    }),
};

const defaultProps = {
    loginList: {},
};

function KnowATeacherPage(props) {
    const {translate} = useLocalize();

    /**
     * Check if number is valid
     * @param {String} values
     * @returns {String} - Returns valid phone number formatted
     */
    const validateNumber = (values) => {
        const parsedPhoneNumber = parsePhoneNumber(values);

        if (parsedPhoneNumber.possible && Str.isValidPhone(values.slice(0))) {
            return parsedPhoneNumber.number.e164;
        }

        return '';
    };

    /**
     * Check number is valid and attach country code
     * @param {String} phoneOrEmail
     * @returns {String} - Returns valid phone number with country code
     */
    const getPhoneLogin = (phoneOrEmail) => {
        if (_.isEmpty(phoneOrEmail)) {
            return '';
        }

        return LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(phoneOrEmail));
    };

    /**
     * Submit form to pass firstName, phoneOrEmail and lastName
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.phoneOrEmail
     * @param {String} values.lastName
     */
    const onSubmit = (values) => {
        const phoneLogin = getPhoneLogin(values.phoneOrEmail);
        const validateIfnumber = validateNumber(phoneLogin);
        const contactMethod = (validateIfnumber || values.phoneOrEmail).trim().toLowerCase();
        const firstName = values.firstName.trim();
        const lastName = values.lastName.trim();

        TeachersUnite.referTeachersUniteVolunteer(firstName, contactMethod, lastName);
    };

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.phoneOrEmail
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values) => {
            const errors = {};
            const phoneLogin = getPhoneLogin(values.phoneOrEmail);
            const validateIfnumber = validateNumber(phoneLogin);

            if (_.isEmpty(values.firstName)) {
                ErrorUtils.addErrorMessage(errors, 'firstName', translate('teachersUnitePage.error.enterName'));
            }
            if (_.isEmpty(values.phoneOrEmail)) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', translate('teachersUnitePage.error.enterPhoneEmail'));
            }
            if (!_.isEmpty(values.phoneOrEmail) && lodashGet(props.loginList, validateIfnumber || values.phoneOrEmail.toLowerCase())) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'teachersUnitePage.error.tryDifferentEmail');
            }
            if (!_.isEmpty(values.phoneOrEmail) && !(validateIfnumber || Str.isValidEmail(values.phoneOrEmail))) {
                ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.invalidContactMethod');
            }

            return errors;
        },
        [props.loginList, translate],
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iKnowATeacher')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
            />
            <Form
                enabledWhenOffline
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.I_KNOW_A_TEACHER_FORM}
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText={translate('common.letsDoThis')}
            >
                <Text style={[styles.mb6]}>{translate('teachersUnitePage.getInTouch')}</Text>
                <View>
                    <TextInput
                        inputID="firstName"
                        name="fname"
                        label={translate('common.firstName')}
                        accessibilityLabel={translate('common.firstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <TextInput
                        inputID="lastName"
                        name="lname"
                        label={translate('common.lastName')}
                        accessibilityLabel={translate('common.lastName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <TextInput
                        inputID="phoneOrEmail"
                        name="phoneOrEmail"
                        label={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        accessibilityLabel={`${translate('common.email')}/${translate('common.phoneNumber')}`}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                        autoCapitalize="none"
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

KnowATeacherPage.propTypes = propTypes;
KnowATeacherPage.defaultProps = defaultProps;
KnowATeacherPage.displayName = 'KnowATeacherPage';

export default withOnyx({
    loginList: {key: ONYXKEYS.LOGIN_LIST},
})(KnowATeacherPage);
