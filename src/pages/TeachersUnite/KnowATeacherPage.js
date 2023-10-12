import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
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
import * as ValidationUtils from '../../libs/ValidationUtils';

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
     * Submit form to pass firstName, partnerUserID and lastName
     * @param {Object} values
     * @param {String} values.partnerUserID
     * @param {String} values.firstName
     * @param {String} values.lastName
     */
    const onSubmit = (values) => {
        const phoneLogin = LoginUtils.getPhoneLogin(values.partnerUserID);
        const validateIfnumber = LoginUtils.validateNumber(phoneLogin);
        const contactMethod = (validateIfnumber || values.partnerUserID).trim().toLowerCase();
        const firstName = values.firstName.trim();
        const lastName = values.lastName.trim();

        TeachersUnite.referTeachersUniteVolunteer(contactMethod, firstName, lastName);
    };

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.partnerUserID
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values) => {
            const errors = {};
            const phoneLogin = LoginUtils.getPhoneLogin(values.partnerUserID);
            const validateIfnumber = LoginUtils.validateNumber(phoneLogin);

            if (!ValidationUtils.isValidLegalName(values.firstName)) {
                ErrorUtils.addErrorMessage(errors, 'firstName', translate('privatePersonalDetails.error.hasInvalidCharacter'));
            } else if (_.isEmpty(values.firstName)) {
                ErrorUtils.addErrorMessage(errors, 'firstName', translate('bankAccount.error.firstName'));
            }
            if (!ValidationUtils.isValidLegalName(values.lastName)) {
                ErrorUtils.addErrorMessage(errors, 'lastName', translate('privatePersonalDetails.error.hasInvalidCharacter'));
            } else if (_.isEmpty(values.lastName)) {
                ErrorUtils.addErrorMessage(errors, 'lastName', translate('bankAccount.error.lastName'));
            }
            if (_.isEmpty(values.partnerUserID)) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterPhoneEmail'));
            }
            if (!_.isEmpty(values.partnerUserID) && lodashGet(props.loginList, validateIfnumber || values.partnerUserID.toLowerCase())) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', 'teachersUnitePage.error.tryDifferentEmail');
            }
            if (!_.isEmpty(values.partnerUserID) && !(validateIfnumber || Str.isValidEmail(values.partnerUserID))) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', 'contacts.genericFailureMessages.invalidContactMethod');
            }

            return errors;
        },
        [props.loginList, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={KnowATeacherPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('teachersUnitePage.iKnowATeacher')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.TEACHERS_UNITE)}
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
                        inputID="partnerUserID"
                        name="partnerUserID"
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
