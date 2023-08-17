import React, {useCallback} from 'react';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
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

const propTypes = {};

const defaultProps = {};

function IntroSchoolPrincipalPage() {
    const {translate} = useLocalize();
    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.email
     * @param {String} values.lastName
     */
    const onSubmit = (values) => {
        TeachersUnite.addSchoolPrincipal(values.firstName.trim(), values.email.trim(), values.lastName);
    };

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.email
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = useCallback(
        (values) => {
            const errors = {};

            if (_.isEmpty(values.firstName)) {
                ErrorUtils.addErrorMessage(errors, 'firstName', translate('teachersUnitePage.error.enterName'));
            }
            if (_.isEmpty(values.email)) {
                ErrorUtils.addErrorMessage(errors, 'email', translate('teachersUnitePage.error.enterEmail'));
            }
            if (!_.isEmpty(values.email) && !Str.isValidEmail(values.email)) {
                ErrorUtils.addErrorMessage(errors, 'email', translate('teachersUnitePage.error.enterValidEmail'));
            }

            return errors;
        },
        [translate],
    );

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={translate('teachersUnitePage.introSchoolPrincipal')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
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
                        inputID="email"
                        name="email"
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

export default IntroSchoolPrincipalPage;
