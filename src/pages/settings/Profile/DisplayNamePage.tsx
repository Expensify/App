import ActivityIndicator from '@components/ActivityIndicator';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
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

import Navigation from '@libs/Navigation/Navigation';
import {getDisplayNameErrors} from '@libs/ValidationUtils';

import {updateDisplayName as updateDisplayNamePersonalDetails} from '@userActions/PersonalDetails';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';

import React from 'react';
import {View} from 'react-native';

type DisplayNamePageProps = WithCurrentUserPersonalDetailsProps;

/**
 * Submit form to update user's first and last name (and display name)
 */
const updateDisplayName = (
    values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>,
    formatPhoneNumber: LocaleContextProps['formatPhoneNumber'],
    currentUserPersonalDetails: CurrentUserPersonalDetails,
) => {
    updateDisplayNamePersonalDetails(values.firstName.trim(), values.lastName.trim(), formatPhoneNumber, currentUserPersonalDetails);
    Navigation.goBack();
};

function DisplayNamePage({currentUserPersonalDetails}: DisplayNamePageProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const currentUserDetails = currentUserPersonalDetails ?? {};

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.DISPLAY_NAME_FORM>) => getDisplayNameErrors(values.firstName, values.lastName, translate);
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
                <View style={[styles.flex1, styles.fullScreenLoading]}>
                    <ActivityIndicator size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE} />
                </View>
            ) : (
                <FormProvider
                    style={[styles.flexGrow1, styles.ph5]}
                    formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
                    validate={validate}
                    onSubmit={(values) => updateDisplayName(values, formatPhoneNumber, currentUserPersonalDetails)}
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
