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

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
};

/**
 * @param {Object} values
 * @param {String} values.principalFirstName
 * @param {String} values.principalEmail
 */
const updateDisplayName = () => {
    // PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim());
};

function IntroSchoolPrincipalPage(props) {
    /**
     * @param {Object} values
     * @param {String} values.principalFirstName
     * @param {String} values.principalEmail
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = (values) => {
        const errors = {};

        if (_.isEmpty(values.principalFirstName)) {
            ErrorUtils.addErrorMessage(errors, 'principalFirstName', props.translate('teachersUnitePage.error.enterName'));
        }
        if (_.isEmpty(values.principalEmail)) {
            ErrorUtils.addErrorMessage(errors, 'principalEmail', props.translate('teachersUnitePage.error.enterEmail'));
        }
        if (!_.isEmpty(values.principalEmail) && !Str.isValidEmail(values.principalEmail)) {
            ErrorUtils.addErrorMessage(errors, 'principalEmail', props.translate('teachersUnitePage.error.enterValidEmail'));
        }

        return errors;
    };

    return (
        <ScreenWrapper includeSafeAreaPaddingBottom={false}>
            <HeaderWithBackButton
                title={props.translate('teachersUnitePage.introSchoolPrincipal')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SAVE_THE_WORLD)}
            />
            <Form
                style={[styles.flexGrow1, styles.ph5]}
                formID={ONYXKEYS.FORMS.INTRO_SCHOOL_PRINCIPAL}
                validate={validate}
                onSubmit={updateDisplayName}
                submitButtonText={props.translate('common.letsStart')}
                enabledWhenOffline
            >
                <Text style={[styles.mb6]}>{props.translate('teachersUnitePage.schoolPrincipalVerfiyExpense')}</Text>
                <View>
                    <TextInput
                        inputID="principalFirstName"
                        name="fname"
                        label={props.translate('teachersUnitePage.principalFirstName')}
                        accessibilityLabel={props.translate('teachersUnitePage.principalFirstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                        autoCapitalize="words"
                    />
                </View>
                <View style={styles.mv4}>
                    <TextInput
                        inputID="principalLastName"
                        name="lname"
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
                        inputID="principalEmail"
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
