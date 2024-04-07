import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';

type DisplayNamePageOnyxProps = {
    isLoadingApp: OnyxEntry<boolean>;
};

type DisplayNamePageProps = DisplayNamePageOnyxProps & WithCurrentUserPersonalDetailsProps;

/**
 * Submit form to update user's first and last name (and display name)
 */
const updateDisplayName = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>) => {
    PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim());
    Navigation.goBack();
};

function DisplayNamePage({isLoadingApp = true, currentUserPersonalDetails}: DisplayNamePageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const currentUserDetails = currentUserPersonalDetails ?? {};

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM> = {};

        // First we validate the first name field
        if (!ValidationUtils.isValidDisplayName(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.hasInvalidCharacter');
        } else if (values.firstName.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'firstName', ['common.error.characterLimitExceedCounter', {length: values.firstName.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }
        if (ValidationUtils.doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.containsReservedWord');
        }

        // Then we validate the last name field
        if (!ValidationUtils.isValidDisplayName(values.lastName)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'personalDetails.error.hasInvalidCharacter');
        } else if (values.lastName.length > CONST.TITLE_CHARACTER_LIMIT) {
            ErrorUtils.addErrorMessage(errors, 'lastName', ['common.error.characterLimitExceedCounter', {length: values.lastName.length, limit: CONST.TITLE_CHARACTER_LIMIT}]);
        }
        if (ValidationUtils.doesContainReservedWord(values.lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            ErrorUtils.addErrorMessage(errors, 'lastName', 'personalDetails.error.containsReservedWord');
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
                    onSubmit={updateDisplayName}
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
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

DisplayNamePage.displayName = 'DisplayNamePage';

export default withCurrentUserPersonalDetails(
    withOnyx<DisplayNamePageProps, DisplayNamePageOnyxProps>({
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP,
        },
    })(DisplayNamePage),
);
