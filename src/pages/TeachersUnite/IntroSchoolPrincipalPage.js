import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Form from '../../components/Form';
import ONYXKEYS from '../../ONYXKEYS';
import CONST from '../../CONST';
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

function IntroSchoolPrincipalPage(props) {
    const {translate} = useLocalize();

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.partnerUserID
     * @param {String} values.lastName
     */
    const onSubmit = (values) => {
        TeachersUnite.addSchoolPrincipal(values.firstName.trim(), values.partnerUserID.trim(), values.lastName.trim());
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
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterEmail'));
            }
            if (!_.isEmpty(values.partnerUserID) && lodashGet(props.loginList, values.partnerUserID.toLowerCase())) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', 'teachersUnitePage.error.tryDifferentEmail');
            }
            if (!_.isEmpty(values.partnerUserID) && !Str.isValidEmail(values.partnerUserID)) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.enterValidEmail'));
            }

            return errors;
        },
        [props.loginList, translate],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID={IntroSchoolPrincipalPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('teachersUnitePage.introSchoolPrincipal')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.TEACHERS_UNITE)}
            />
            <Form
                enabledWhenOffline
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM}
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText={translate('common.letsStart')}
            >
                <Text style={[styles.mb6]}>{translate('teachersUnitePage.schoolPrincipalVerfiyExpense')}</Text>
                <View>
                    <TextInput
                        inputID="firstName"
                        name="firstName"
                        label={translate('teachersUnitePage.principalFirstName')}
                        accessibilityLabel={translate('teachersUnitePage.principalFirstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <TextInput
                        inputID="lastName"
                        name="lastName"
                        label={translate('teachersUnitePage.principalLastName')}
                        accessibilityLabel={translate('teachersUnitePage.principalLastName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <TextInput
                        inputID="partnerUserID"
                        name="partnerUserID"
                        label={translate('teachersUnitePage.principalWorkEmail')}
                        accessibilityLabel={translate('teachersUnitePage.principalWorkEmail')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                        autoCapitalize="none"
                    />
                </View>
            </Form>
        </ScreenWrapper>
    );
}

IntroSchoolPrincipalPage.propTypes = propTypes;
IntroSchoolPrincipalPage.defaultProps = defaultProps;
IntroSchoolPrincipalPage.displayName = 'IntroSchoolPrincipalPage';

export default withOnyx({
    loginList: {key: ONYXKEYS.LOGIN_LIST},
})(IntroSchoolPrincipalPage);
