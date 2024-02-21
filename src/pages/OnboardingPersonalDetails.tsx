import React, {useCallback} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import type {WithCurrentUserPersonalDetailsProps} from '@components/withCurrentUserPersonalDetails';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as Report from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/DisplayNameForm';

type OnboardingPersonalDetailsProps = WithCurrentUserPersonalDetailsProps;

function OnboardingPersonalDetails({currentUserPersonalDetails}: OnboardingPersonalDetailsProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useOnboardingLayout();
    const currentUserDetails = currentUserPersonalDetails || {};

    const closeModal = useCallback(() => {
        Report.dismissEngagementModal();
        Navigation.goBack();
    }, []);

    return (
        <View style={[styles.defaultModalContainer, !shouldUseNarrowLayout && styles.pt8]}>
            <HeaderWithBackButton
                shouldShowBackButton={false}
                shouldShowCloseButton
                onCloseButtonPress={closeModal}
                iconFill={theme.iconColorfulBackground}
                progressBarPercentage={33.3}
            />
            <View style={[styles.mv5, styles.mh8]}>
                <Text style={[styles.textHeroSmall, styles.mb5]}>{translate('onboarding.welcome')}</Text>
                <FormProvider
                    style={styles.flexGrow1}
                    formID={ONYXKEYS.FORMS.DISPLAY_NAME_FORM}
                    // validate={validate}
                    // onSubmit={updateDisplayName}
                    submitButtonText={translate('common.continue')}
                    enabledWhenOffline
                    shouldValidateOnBlur
                    shouldValidateOnChange
                >
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
            </View>
        </View>
    );
}

OnboardingPersonalDetails.displayName = 'OnboardingPersonalDetails';

export default withCurrentUserPersonalDetails(OnboardingPersonalDetails);
