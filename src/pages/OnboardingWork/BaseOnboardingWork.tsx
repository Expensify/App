import {useRoute} from '@react-navigation/native';
import type {RouteProp} from '@react-navigation/native';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {OnboardingModalNavigatorParamList} from '@libs/Navigation/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Policy from '@userActions/Policy/Policy';
import * as Welcome from '@userActions/Welcome';
import * as OnboardingFlow from '@userActions/Welcome/OnboardingFlow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/WorkForm';
import type {BaseOnboardingWorkProps} from './types';

function BaseOnboardingWork({shouldUseNativeStyles}: BaseOnboardingWorkProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();

    const route = useRoute<RouteProp<OnboardingModalNavigatorParamList, typeof SCREENS.ONBOARDING.WORK>>();

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);

    const vsbOnboarding = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;

    const completeEngagement = useCallback(
        (values: FormOnyxValues<'onboardingWorkForm'>) => {
            if (!onboardingPurposeSelected) {
                return;
            }
            const work = values.work.trim();
            if (!onboardingPolicyID) {
                const {adminsChatReportID, policyID} = Policy.createWorkspace(undefined, true, work);
                Welcome.setOnboardingAdminsChatReportID(adminsChatReportID);
                Welcome.setOnboardingPolicyID(policyID);
            } else {
                Policy.updateGeneralSettings(onboardingPolicyID, work);
            }

            Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(route.params?.backTo));
        },
        [onboardingPurposeSelected, onboardingPolicyID, route.params?.backTo],
    );

    const validate = (values: FormOnyxValues<'onboardingWorkForm'>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.ONBOARDING_PERSONAL_WORK> = {};
        const work = values.work.trim();

        if (!ValidationUtils.isRequiredFulfilled(work)) {
            errors.work = translate('workspace.editor.nameIsRequiredError');
        } else if ([...work].length > CONST.TITLE_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            ErrorUtils.addErrorMessage(errors, 'work', translate('common.error.characterLimitExceedCounter', {length: [...work].length, limit: CONST.TITLE_CHARACTER_LIMIT}));
        }

        return errors;
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            shouldEnableKeyboardAvoidingView
            testID="BaseOnboardingWork"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton={!vsbOnboarding}
                progressBarPercentage={onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.MANAGE_TEAM ? 50 : 75}
                onBackButtonPress={OnboardingFlow.goBack}
            />
            <FormProvider
                style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                formID={ONYXKEYS.FORMS.ONBOARDING_PERSONAL_WORK}
                validate={validate}
                onSubmit={completeEngagement}
                submitButtonText={translate('common.continue')}
                enabledWhenOffline
                submitFlexEnabled
                shouldValidateOnBlur
                shouldValidateOnChange
                shouldTrimValues={false}
            >
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                    <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.whereYouWork')}</Text>
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.WORK}
                        name="fwork"
                        label={translate('common.businessName')}
                        aria-label={translate('common.businessName')}
                        role={CONST.ROLE.PRESENTATION}
                        shouldSaveDraft
                        maxLength={CONST.TITLE_CHARACTER_LIMIT}
                        spellCheck={false}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

BaseOnboardingWork.displayName = 'BaseOnboardingWork';

export default BaseOnboardingWork;
