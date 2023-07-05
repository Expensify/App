import React, {useState, useEffect, useRef} from 'react';
import {View, ScrollView} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import PropTypes from 'prop-types';
import _ from 'underscore';
import HeaderWithBackButton from '../../components/HeaderWithBackButton';
import Navigation from '../../libs/Navigation/Navigation';
import ScreenWrapper from '../../components/ScreenWrapper';
import Text from '../../components/Text';
import styles from '../../styles/styles';
import ONYXKEYS from '../../ONYXKEYS';
import Button from '../../components/Button';
import * as ValidationUtils from '../../libs/ValidationUtils';
import * as User from '../../libs/actions/User';
import withLocalize, {withLocalizePropTypes} from '../../components/withLocalize';
import compose from '../../libs/compose';
import FixedFooter from '../../components/FixedFooter';
import TextInput from '../../components/TextInput';
import * as Session from '../../libs/actions/Session';
import * as ErrorUtils from '../../libs/ErrorUtils';
import ConfirmationPage from '../../components/ConfirmationPage';
import ROUTES from '../../ROUTES';
import FormHelpMessage from '../../components/FormHelpMessage';

const propTypes = {
    /* Onyx Props */

    /** Holds information about the users account that is logging in */
    account: PropTypes.shape({
        /** An error message to display to the user */
        errors: PropTypes.objectOf(PropTypes.string),

        /** Success message to display when necessary */
        success: PropTypes.string,

        /** Whether a sign on form is loading (being submitted) */
        isLoading: PropTypes.bool,
    }),

    ...withLocalizePropTypes,
};

const defaultProps = {
    account: {},
};

const errorKeysMap = {
    currentPassword: 'passwordPage.errors.currentPassword',
    newPasswordSameAsOld: 'passwordPage.errors.newPasswordSameAsOld',
    newPassword: 'passwordPage.errors.newPassword',
};

function PasswordPage(props) {
    const [passwordFields, setPasswordFields] = useState({
        currentPassword: '',
        newPassword: '',
    });
    const [errors, setErrors] = useState({
        currentPassword: false,
        newPassword: false,
        newPasswordSameAsOld: false,
    });

    const currentPasswordInputRef = useRef(null);

    useEffect(() => () => Session.clearAccountMessages(), []);

    /**
     * @param {String} field
     * @returns {String}
     */
    const getErrorText = (field) => (errors[field] ? errorKeysMap[field] : '');

    /**
     * @param {String} field
     * @param {String} value
     * @param {String[]} additionalErrorsToClear
     */
    const clearErrorAndSetValue = (field, value, additionalErrorsToClear) => {
        const errorsToReset = {
            [field]: false,
        };
        if (additionalErrorsToClear) {
            _.each(additionalErrorsToClear, (errorFlag) => {
                errorsToReset[errorFlag] = false;
            });
        }
        setPasswordFields((prev) => ({...prev, [field]: value}));
        setErrors((prev) => ({...prev, ...errorsToReset}));
    };

    /**
     * @returns {Boolean}
     */
    const validate = () => {
        const error = {};

        if (!passwordFields.currentPassword) {
            error.currentPassword = true;
        }

        if (!passwordFields.newPassword || !ValidationUtils.isValidPassword(passwordFields.newPassword)) {
            error.newPassword = true;
        }

        if (passwordFields.currentPassword && passwordFields.newPassword && _.isEqual(passwordFields.currentPassword, passwordFields.newPassword)) {
            error.newPasswordSameAsOld = true;
        }

        setErrors(error);
        return _.size(error) === 0;
    };

    /**
     * Submit the form
     */
    const submit = () => {
        if (!validate()) {
            return;
        }
        User.updatePassword(passwordFields.currentPassword, passwordFields.newPassword);
    };

    const shouldShowNewPasswordPrompt = !errors.newPassword && !errors.newPasswordSameAsOld;
    return (
        <ScreenWrapper
            onEntryTransitionEnd={() => {
                if (!currentPasswordInputRef.current) {
                    return;
                }

                currentPasswordInputRef.current.focus();
            }}
        >
            <HeaderWithBackButton
                title={props.translate('passwordPage.changePassword')}
                onBackButtonPress={() => Navigation.goBack(ROUTES.SETTINGS_SECURITY)}
            />
            {!_.isEmpty(props.account.success) ? (
                <ConfirmationPage
                    heading={props.translate('passwordConfirmationScreen.passwordUpdated')}
                    shouldShowButton
                    onButtonPress={Navigation.goBack}
                    buttonText={props.translate('common.buttonConfirm')}
                    description={props.translate('passwordConfirmationScreen.allSet')}
                />
            ) : (
                <>
                    <ScrollView
                        style={styles.flex1}
                        contentContainerStyle={styles.p5}
                        // Allow the user to click show password while password input is focused.
                        // eslint-disable-next-line react/jsx-props-no-multi-spaces
                        keyboardShouldPersistTaps="always"
                    >
                        <Text style={[styles.mb6]}>{props.translate('passwordPage.changingYourPasswordPrompt')}</Text>
                        <View style={styles.mb6}>
                            <TextInput
                                label={`${props.translate('passwordPage.currentPassword')}*`}
                                ref={currentPasswordInputRef}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={passwordFields.currentPassword}
                                onChangeText={(text) => clearErrorAndSetValue('currentPassword', text)}
                                returnKeyType="done"
                                hasError={errors.currentPassword}
                                errorText={getErrorText('currentPassword')}
                                onSubmitEditing={submit}
                            />
                        </View>
                        <View style={styles.mb6}>
                            <TextInput
                                label={`${props.translate('passwordPage.newPassword')}*`}
                                secureTextEntry
                                autoCompleteType="password"
                                textContentType="password"
                                value={passwordFields.newPassword}
                                hasError={errors.newPassword || errors.newPasswordSameAsOld}
                                errorText={errors.newPasswordSameAsOld ? getErrorText('newPasswordSameAsOld') : getErrorText('newPassword')}
                                onChangeText={(text) => clearErrorAndSetValue('newPassword', text, ['newPasswordSameAsOld'])}
                                onSubmitEditing={submit}
                            />
                            {shouldShowNewPasswordPrompt && <Text style={[styles.textLabelSupporting, styles.mt1]}>{props.translate('passwordPage.newPasswordPrompt')}</Text>}
                        </View>
                        {_.every(errors, (error) => !error) && !_.isEmpty(props.account.errors) && (
                            <FormHelpMessage
                                isError
                                message={ErrorUtils.getLatestErrorMessage(props.account)}
                            />
                        )}
                    </ScrollView>
                    <FixedFooter style={[styles.flexGrow0]}>
                        <Button
                            success
                            isLoading={props.account.isLoading}
                            text={props.translate('common.save')}
                            onPress={submit}
                        />
                    </FixedFooter>
                </>
            )}
        </ScreenWrapper>
    );
}

PasswordPage.propTypes = propTypes;
PasswordPage.defaultProps = defaultProps;

export default compose(
    withLocalize,
    withOnyx({
        account: {
            key: ONYXKEYS.ACCOUNT,
        },
    }),
)(PasswordPage);
