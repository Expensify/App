import React from 'react';
import {View} from 'react-native';
import {parsePhoneNumber} from 'awesome-phonenumber';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
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

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

/**
 * Submit form to pass firstName, lastName and phoneOrEmail
 * @param {Object} values
 * @param {String} values.firstName
 * @param {String} values.lastName
 * @param {String} values.phoneOrEmail
 */
const submit = () => {
    Navigation.navigate(ROUTES.getReportRoute(CONST.TEACHER_UNITE.PUBLIC_ROOM_ID));
};

const getPhoneLogin = (phoneOrEmail) => {
    if (_.isEmpty(phoneOrEmail)) {
        return '';
    }

    return LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(phoneOrEmail));
};

function KnowATeacherPage(props) {
    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.phoneOrEmail
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = (values) => {
        const errors = {};
        const phoneLogin = getPhoneLogin(values.phoneOrEmail);

        if (_.isEmpty(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', props.translate('teachersUnitePage.error.enterName'));
        }
        if (_.isEmpty(values.phoneOrEmail)) {
            ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', props.translate('teachersUnitePage.error.enterPhoneEmail'));
        }
        if (!_.isEmpty(values.phoneOrEmail) && !((parsePhoneNumber(phoneLogin).possible && Str.isValidPhone(phoneLogin.slice(0))) || Str.isValidEmail(values.phoneOrEmail))) {
            ErrorUtils.addErrorMessage(errors, 'phoneOrEmail', 'contacts.genericFailureMessages.invalidContactMethod');
        }

        return errors;
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('teachersUnitePage.iKnowATeacher')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.I_KNOW_A_TEACHER}
                validate={validate}
                onSubmit={submit}
                submitButtonText={props.translate('common.letsDoThis')}
                enabledWhenOffline
            >
                <Text style={[styles.mb6]}>{props.translate('teachersUnitePage.getInTouch')}</Text>
                <View>
                    <TextInput
                        inputID="firstName"
                        name="fname"
                        label={props.translate('common.firstName')}
                        accessibilityLabel={props.translate('common.firstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <TextInput
                        inputID="lastName"
                        name="lname"
                        label={props.translate('common.lastName')}
                        accessibilityLabel={props.translate('common.lastName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <TextInput
                        label={`${props.translate('common.email')}/${props.translate('common.phoneNumber')}`}
                        accessibilityLabel={`${props.translate('common.email')}/${props.translate('common.phoneNumber')}`}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                        inputID="phoneOrEmail"
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

export default withLocalize(KnowATeacherPage);
