import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import TeachersUnite from '@userActions/TeachersUnite';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

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
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.partnerUserID
     * @param {String} values.lastName
     */
    const onSubmit = (values) => {
        const policyID = isProduction ? CONST.TEACHERS_UNITE.PROD_POLICY_ID : CONST.TEACHERS_UNITE.TEST_POLICY_ID;
        TeachersUnite.addSchoolPrincipal(values.firstName.trim(), values.partnerUserID.trim(), values.lastName.trim(), policyID);
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
            if (!_.isEmpty(values.partnerUserID) && LoginUtils.isEmailPublicDomain(values.partnerUserID)) {
                ErrorUtils.addErrorMessage(errors, 'partnerUserID', translate('teachersUnitePage.error.tryDifferentEmail'));
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
            <FormProvider
                enabledWhenOffline
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL_FORM}
                validate={validate}
                onSubmit={onSubmit}
                submitButtonText={translate('common.letsStart')}
            >
                <Text style={[styles.mb6]}>{translate('teachersUnitePage.schoolPrincipalVerfiyExpense')}</Text>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="firstName"
                        name="firstName"
                        label={translate('teachersUnitePage.principalFirstName')}
                        accessibilityLabel={translate('teachersUnitePage.principalFirstName')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="lastName"
                        name="lastName"
                        label={translate('teachersUnitePage.principalLastName')}
                        accessibilityLabel={translate('teachersUnitePage.principalLastName')}
                        role={CONST.ROLE.PRESENTATION}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID="partnerUserID"
                        name="partnerUserID"
                        label={translate('teachersUnitePage.principalWorkEmail')}
                        accessibilityLabel={translate('teachersUnitePage.principalWorkEmail')}
                        role={CONST.ROLE.PRESENTATION}
                        inputMode={CONST.INPUT_MODE.EMAIL}
                        autoCapitalize="none"
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

IntroSchoolPrincipalPage.propTypes = propTypes;
IntroSchoolPrincipalPage.defaultProps = defaultProps;
IntroSchoolPrincipalPage.displayName = 'IntroSchoolPrincipalPage';

export default withOnyx({
    loginList: {key: ONYXKEYS.LOGIN_LIST},
})(IntroSchoolPrincipalPage);
