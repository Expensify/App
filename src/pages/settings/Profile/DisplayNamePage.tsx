/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {OnyxFormValuesFields} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import compose from '@libs/compose';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Errors} from '@src/types/onyx/OnyxCommon';

const updateDisplayName = (values: any) => {
    PersonalDetails.updateDisplayName(values.firstName.trim(), values.lastName.trim());
};

function DisplayNamePage(props: any) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const currentUserDetails = props.currentUserPersonalDetails || {};

    /**
     * @param values
     * @param values.firstName
     * @param values.lastName
     * @returns - An object containing the errors for each inputID
     */
    const validate = (values: OnyxFormValuesFields<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>) => {
        const errors: Errors = {};
        // First we validate the first name field
        if (!ValidationUtils.isValidDisplayName(values.firstName)) {
            ErrorUtils.addErrorMessage(errors, 'firstName', 'personalDetails.error.hasInvalidCharacter');
        }
        if (ValidationUtils.doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_FIRST_NAMES as unknown as string[])) {
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
                title={translate('displayNamePage.headerTitle')}
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
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
                    <Text style={[styles.mb6]}>{translate('displayNamePage.isShownOnProfile')}</Text>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="firstName"
                            name="fname"
                            label={translate('common.firstName')}
                            aria-label={translate('common.firstName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={currentUserDetails?.firstName ?? ''}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                    <View>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID="lastName"
                            name="lname"
                            label={translate('common.lastName')}
                            aria-label={translate('common.lastName')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={currentUserDetails?.lastName ?? ''}
                            maxLength={CONST.DISPLAY_NAME.MAX_LENGTH}
                            spellCheck={false}
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

DisplayNamePage.displayName = 'DisplayNamePage';

export default compose(
    withCurrentUserPersonalDetails,
    withOnyx({
        isLoadingApp: {
            key: ONYXKEYS.IS_LOADING_APP as any,
        },
    }),
)(DisplayNamePage);
