import type {MutableRefObject} from 'react';
import React, {useCallback, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/DisplayNameForm';

type OnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps & {
    isModalFocused: MutableRefObject<boolean>;
};

function OnboardingPersonalDetails({isModalFocused, currentUserPersonalDetails}: OnboardingPersonalDetailsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const currentUserDetails = currentUserPersonalDetails || {};
    const [fixErrorsAlert, setFixErrorsAlert] = useState<string | undefined>();

    const saveAndNavigate = useCallback((values: FormOnyxValues<'displayNameForm'>) => {
        PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim(), {preventGoBack: true});

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE);
    }, []);

    // Decide whether to show custom error or not.
    // Custom errors are shown when user tries to dismiss
    // the modal instead of clicking Continue.
    const setCustomFixErrorsAlert = (errors) => {
        if (isModalFocused.current) {
            setFixErrorsAlert(undefined);
            return;
        }

        if (errors.firstName.length === 0 && errors.lastName.length === 0) {
            setFixErrorsAlert(translate('onboarding.errorAlert.requiredHitContinue'));
        } else {
            setFixErrorsAlert(translate('onboarding.errorAlert.requiredFirstName'));
        }
    };

    const validate = (values: FormOnyxValues<'displayNameForm'>) => {
        const errors = {};

        // First we validate the first name field
        if (values.firstName.length === 0) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'onboarding.error.requiredFirstName');
        }
        if (!ValidationUtils.isValidDisplayName(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.hasInvalidCharacter');
        }
        if (ValidationUtils.doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.containsReservedWord');
        }

        // Then we validate the last name field
        if (values.lastName.length === 0) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'onboarding.error.requiredLasttName');
        }
        if (!ValidationUtils.isValidDisplayName(values.lastName)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'personalDetails.error.hasInvalidCharacter');
        }
        if (ValidationUtils.doesContainReservedWord(values.lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'personalDetails.error.containsReservedWord');
        }

        setCustomFixErrorsAlert(errors);

        return errors;
    };

    return (
        <View style={[styles.h100, styles.defaultModalContainer, !shouldUseNarrowLayout && styles.pt8]}>
            <HeaderWithBackButton
                shouldShowBackButton={false}
                iconFill={theme.iconColorfulBackground}
                progressBarPercentage={33.3}
            />
            <KeyboardAvoidingView
                style={[styles.flex1, styles.dFlex]}
                behavior="padding"
            >
                <FormProvider
                    style={[styles.flexGrow1, styles.mt5, shouldUseNarrowLayout ? styles.mh8 : styles.mh5]}
                    formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
                    validate={validate}
                    onSubmit={saveAndNavigate}
                    submitButtonText={translate('common.continue')}
                    enabledWhenOffline
                    submitFlexEnabled
                    shouldValidateOnBlur
                    shouldValidateOnChange
                    shouldTrimValues={false}
                    fixErrorsAlert={fixErrorsAlert}
                >
                    <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={[styles.textHeroSmall]}>{translate('onboarding.welcome')} </Text>
                        <Text style={[styles.textHeroSmall]}>{translate('onboarding.whatsYourName')}</Text>
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.FIRST_NAME}
                            name="fname"
                            label={translate('common.firstName')}
                            aria-label={translate('common.firstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={currentUserDetails?.firstName}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                            autoFocus
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.LAST_NAME}
                            name="lname"
                            label={translate('common.lastName')}
                            aria-label={translate('common.lastName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={currentUserDetails?.lastName}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                </FormProvider>
            </KeyboardAvoidingView>
        </View>
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPersonalDetails';

export default withCurrentUserPersonalDetails(OnboardingPersonalDetails);
