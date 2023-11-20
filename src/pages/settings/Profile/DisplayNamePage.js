import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails, {withCurrentUserPersonalDetailsDefaultProps, withCurrentUserPersonalDetailsPropTypes} from '@components/withCurrentUserPersonalDetails';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import useThemeStyles from '@styles/useThemeStyles';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

const propTypes = {
    ...withLocalizePropTypes,
    ...withCurrentUserPersonalDetailsPropTypes,
    isLoadingApp: PropTypes.bool,
};

const defaultProps = {
    ...withCurrentUserPersonalDetailsDefaultProps,
    isLoadingApp: true,
};

/**
 * Submit form to update user's first and last name (and display name)
 * @param {Object} values
 * @param {String} values.firstName
 * @param {String} values.lastName
 */
const updateDisplayName = (values) => {
    PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim());
};

function DisplayNamePage(props) {
    const styles = useThemeStyles();
    const currentUserDetails = props.currentUserPersonalDetails || {};

    /**
     * @param {Object} values
     * @param {String} values.firstName
     * @param {String} values.lastName
     * @returns {Object} - An object containing the errors for each inputID
     */
    const validate = (values) => {
        const errors = {};

        // First we validate the first name field
        if (!ValidationUtils.isValidDisplayName(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.hasInvalidCharacter');
        }
        if (ValidationUtils.doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_FIRST_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.containsReservedWord');
        }

        // Then we validate the last name field
        if (!ValidationUtils.isValidDisplayName(values.lastName)) {
            errors.lastName = 'personalDetails.error.hasInvalidCharacter';
        }
        return errors;
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={DisplayNamePage.displayName}
        >
            <HeaderWithBackButton
                title={props.translate('displayNamePage.headerTitle')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_PROFILE)}
            />
            {props.isLoadingApp ? (
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
                    validate={validate}
                    onSubmit={updateDisplayName}
                    submitButtonText={props.translate('common.save')}
                    enabledWhenOffline
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    <Text style={[styles.mb6]}>{props.translate('displayNamePage.isShownOnProfile')}</Text>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="firstName"
                            name="fname"
                            label={props.translate('common.firstName')}
                            aria-label={props.translate('common.firstName')}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            defaultValue={lodashGet(currentUserDetails, 'firstName', '')}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="lastName"
                            name="lname"
                            label={props.translate('common.lastName')}
                            aria-label={props.translate('common.lastName')}
                            role={CONST.ACCESSIBILITY_ROLE.TEXT}
                            defaultValue={lodashGet(currentUserDetails, 'lastName', '')}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

DisplayNamePage.propTypes = propTypes;
DisplayNamePage.defaultProps = defaultProps;
DisplayNamePage.displayName = 'DisplayNamePage';

export default compose(
    withLocalize,
    withCurrentUserPersonalDetails,
    withOnyx({
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    }),
)(DisplayNamePage);
