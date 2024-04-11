import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useDisableModalDismissOnEscape from '@hooks/useDisableModalDismissOnEscape';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/DisplayNameForm';

type BaseOnboardingPersonalDetailsProps = {
    /* Whether to use native styles tailored for native devices */
    shouldUseNativeStyles: boolean;
};

function BaseOnboardingPersonalDetails({currentUserPersonalDetails, shouldUseNativeStyles}: WithCurrentUserPersonalDetailsProps & BaseOnboardingPersonalDetailsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

    useDisableModalDismissOnEscape();

    const saveAndNavigate = useCallback((values: FormOnyxValues<'onboardingPersonalDetailsForm'>) => {
        PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim());

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE);
    }, []);

    const validate = (values: FormOnyxValues<'onboardingPersonalDetailsForm'>) => {
        const errors = {};

        // First we validate the first name field
        if (values.firstName.length === 0) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'onboarding.error.requiredFirstName');
        }
        if (!ValidationUtils.isValidDisplayName(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.hasInvalidCharacter');
        } else if (values.firstName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            ErrorUtils.addErrorMessage(errors, 'firstName', ['common.error.characterLimitExceedCounter', {length: values.firstName.length, limit: CONST.DISPLAY_NAME.MAX_LENGTH}]);
        }
        if (ValidationUtils.doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.containsReservedWord');
        }

        // Then we validate the last name field
        if (values.lastName.length === 0) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'onboarding.error.requiredLastName');
        }
        if (!ValidationUtils.isValidDisplayName(values.lastName)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'personalDetails.error.hasInvalidCharacter');
        } else if (values.lastName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            ErrorUtils.addErrorMessage(errors, 'lastName', ['common.error.characterLimitExceedCounter', {length: values.lastName.length, limit: CONST.DISPLAY_NAME.MAX_LENGTH}]);
        }
        if (ValidationUtils.doesContainReservedWord(values.lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'personalDetails.error.containsReservedWord');
        }

        return errors;
    };

    const PersonalDetailsFooterInstance = <OfflineIndicator />;

    return (
        <View style={[styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
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
                    style={[styles.flexGrow1, shouldUseNarrowLayout && styles.mt5, shouldUseNarrowLayout ? styles.mh8 : styles.mh5]}
                    formID={ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM}
                    footerContent={isSmallScreenWidth && PersonalDetailsFooterInstance}
                    validate={validate}
                    onSubmit={saveAndNavigate}
                    submitButtonText={translate('common.continue')}
                    enabledWhenOffline
                    submitFlexEnabled
                    shouldValidateOnBlur
                    shouldValidateOnChange
                    shouldTrimValues={false}
                >
                    <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.welcome')} </Text>
                        <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.whatsYourName')}</Text>
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.FIRST_NAME}
                            name="fname"
                            label={translate('common.firstName')}
                            aria-label={translate('common.firstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={currentUserPersonalDetails?.firstName}
                            shouldSaveDraft
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
                            defaultValue={currentUserPersonalDetails?.lastName}
                            shouldSaveDraft
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                </FormProvider>
            </KeyboardAvoidingView>
        </View>
    );
}

BaseOnboardingPersonalDetails.displayName = 'BaseOnboardingPersonalDetails';

export default withCurrentUserPersonalDetails(BaseOnboardingPersonalDetails);

export type {BaseOnboardingPersonalDetailsProps};
