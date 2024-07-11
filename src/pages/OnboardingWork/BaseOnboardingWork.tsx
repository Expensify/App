import React, {useCallback} from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import KeyboardAvoidingView from '@components/KeyboardAvoidingView';
import OfflineIndicator from '@components/OfflineIndicator';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useOnboardingLayout from '@hooks/useOnboardingLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as ErrorUtils from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as Policy from '@userActions/Policy/Policy';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkForm';
import type {BaseOnboardingWorkOnyxProps, BaseOnboardingWorkProps} from './types';

const OPEN_WORK_PAGE_PURPOSES = [CONST.ONBOARDING_CHOICES.MANAGE_TEAM];

function BaseOnboardingWork({shouldUseNativeStyles, onboardingPurposeSelected, onboardingPolicyID}: BaseOnboardingWorkProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useOnboardingLayout();

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

            Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS);
        },
        [onboardingPurposeSelected, onboardingPolicyID],
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

    const WorkFooterInstance = <OfflineIndicator />;

    return (
        <View style={[styles.h100, styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}>
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={OPEN_WORK_PAGE_PURPOSES.includes(onboardingPurposeSelected ?? '') ? 50 : 75}
                onBackButtonPress={Navigation.goBack}
            />
            <KeyboardAvoidingView
                style={[styles.flex1, styles.dFlex]}
                behavior="padding"
            >
                <FormProvider
                    style={[styles.flexGrow1, shouldUseNarrowLayout && styles.mt5, styles.mb5, shouldUseNarrowLayout ? styles.mh8 : styles.mh5]}
                    formID={ONYXKEYS.FORMS.ONBOARDING_PERSONAL_WORK}
                    footerContent={isSmallScreenWidth && WorkFooterInstance}
                    validate={validate}
                    onSubmit={completeEngagement}
                    submitButtonText={translate('common.continue')}
                    enabledWhenOffline
                    submitFlexEnabled
                    shouldValidateOnBlur
                    shouldValidateOnChange
                    shouldTrimValues={false}
                >
                    <View style={[shouldUseNarrowLayout ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                        <Text style={[styles.textHeadlineH1, styles.textXXLarge]}>{translate('onboarding.whereYouWork')}</Text>
                    </View>
                    <View style={styles.mb4}>
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.WORK}
                            name="fwork"
                            label={translate('common.businessName')}
                            aria-label={translate('common.businessName')}
                            role={CONST.ROLE.PRESENTATION}
                            shouldSaveDraft
                            maxLength={CONST.TITLE_CHARACTER_LIMIT}
                            spellCheck={false}
                            autoFocus
                        />
                    </View>
                </FormProvider>
            </KeyboardAvoidingView>
        </View>
    );
}

BaseOnboardingWork.displayName = 'BaseOnboardingWork';

export default withOnyx<BaseOnboardingWorkProps, BaseOnboardingWorkOnyxProps>({
    onboardingPurposeSelected: {
        key: ONYXKEYS.ONBOARDING_PURPOSE_SELECTED,
    },
    onboardingPolicyID: {
        key: ONYXKEYS.ONBOARDING_POLICY_ID,
    },
})(BaseOnboardingWork);
