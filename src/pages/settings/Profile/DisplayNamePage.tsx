import React from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {doesContainReservedWord, isValidDisplayName} from '@libs/ValidationUtils';
import {updateDisplayName as updateDisplayNamePersonalDetails} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';

type DisplayNamePageProps = WithCurrentUserPersonalDetailsProps;

/**
 * Submit form to update user's first and last name (and display name)
 */
const updateDisplayName = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    currentUserAccountID: number,
    currentUserEmail: string,
) => {
    updateDisplayNamePersonalDetails(values.firstName.trim(), values.lastName.trim(), formatPhoneNumber, currentUserAccountID, currentUserEmail);
    Navigation.goBack();
};

function DisplayNamePage({currentUserPersonalDetails}: DisplayNamePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});

    const currentUserDetails = currentUserPersonalDetails ?? {};

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM> = {};

        // First we validate the first name field
        if (!isValidDisplayName(values.firstName)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.firstName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', values.firstName.length, CONST.DISPLAY_NAME.MAX_LENGTH));
        } else if (values.firstName.length === 0) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.requiredFirstName'));
        }
        if (doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.containsReservedWord'));
        }

        // Then we validate the last name field
        if (!isValidDisplayName(values.lastName)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.lastName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'lastName', translate('common.error.characterLimitExceedCounter', values.lastName.length, CONST.DISPLAY_NAME.MAX_LENGTH));
        }
        if (doesContainReservedWord(values.lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.containsReservedWord'));
        }
        return errors;
    };
    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="DisplayNamePage"
        >
            <HeaderWithBackButton
                title={translate('displayNamePage.headerTitle')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            {isLoadingApp ? (
                <FullScreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
            ) : (
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
                    validate={validate}
                    onSubmit={(values) => updateDisplayName(values, formatPhoneNumber, currentUserDetails?.accountID, currentUserDetails?.email ?? '')}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    <Text style={[styles.mb6]}>{translate('displayNamePage.isShownOnProfile')}</Text>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.FIRST_NAME}
                            name="fname"
                            label={translate('common.firstName')}
                            aria-label={translate('common.firstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={currentUserDetails.firstName ?? ''}
                            spellCheck={false}
                            autoCapitalize="words"
                            autoComplete="given-name"
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
                            defaultValue={currentUserDetails.lastName ?? ''}
                            spellCheck={false}
                            autoCapitalize="words"
                            autoComplete="family-name"
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(DisplayNamePage);
