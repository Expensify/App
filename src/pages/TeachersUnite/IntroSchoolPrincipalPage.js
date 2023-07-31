import React from 'react';
import {View} from 'react-native';
import Str from 'expensify-common/lib/str';
import _ from 'underscore';
import {withCurrentUserPersonalDetailsPropTypes, withCurrentUserPersonalDetailsDefaultProps} from '../../components/withCurrentUserPersonalDetails';
import ScreenWrapper from '../../components/ScreenWrapper';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
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

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

function IntroSchoolPrincipalPage(props) {
    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.email
     * @param {String} values.lastName
     */
    function onSubmit(values) {
        TeachersUnite.createExpenseChatSchoolPrincipal(values.firstName.trim(), values.email.trim(), values.lastName);
    }

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.email
     * @returns {Object} - An object containing the errors for each inputID
     */
    function validate(values) {
        const errors = {};

        if (_.isEmpty(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', props.translate('teachersUnitePage.error.enterName'));
        }
        if (_.isEmpty(values.email)) {
            ErrorUtils.addErrorMessage(errors, 'email', props.translate('teachersUnitePage.error.enterEmail'));
        }
        if (!_.isEmpty(values.email) && !Str.isValidEmail(values.email)) {
            ErrorUtils.addErrorMessage(errors, 'email', props.translate('teachersUnitePage.error.enterValidEmail'));
        }

        return errors;
    }

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('teachersUnitePage.introSchoolPrincipal')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
            />
            <Form
                enabledWhenOffline
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL}
                validate={(values) => validate(values)}
                onSubmit={(values) => onSubmit(values)}
                submitButtonText={props.translate('common.letsStart')}
            >
                <Text style={[styles.mb6]}>{props.translate('teachersUnitePage.schoolPrincipalVerfiyExpense')}</Text>
                <View>
                    <TextInput
                        inputID="firstName"
                        name="firstName"
                        label={props.translate('teachersUnitePage.principalFirstName')}
                        accessibilityLabel={props.translate('teachersUnitePage.principalFirstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <TextInput
                        inputID="lastName"
                        name="lastName"
                        label={props.translate('teachersUnitePage.principalLastName')}
                        accessibilityLabel={props.translate('teachersUnitePage.principalLastName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View>
                    <TextInput
                        label={props.translate('teachersUnitePage.principalWorkEmail')}
                        accessibilityLabel={props.translate('teachersUnitePage.principalWorkEmail')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        keyboardType={CONST.KEYBOARD_TYPE.EMAIL_ADDRESS}
                        inputID="email"
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

export default withLocalize(IntroSchoolPrincipalPage);
