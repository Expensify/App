import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isPaidGroupPolicy, isPolicyAdmin} from '@libs/PolicyUtils';
import {isRequiredFulfilled} from '@libs/ValidationUtils';
import {clearWorkspaceDetailsDraft} from '@userActions/Onboarding';
import {createWorkspace, generateDefaultWorkspaceName, generatePolicyID} from '@userActions/Policy/Policy';
import {setOnboardingAdminsChatReportID, setOnboardingErrorMessage, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/WorkspaceConfirmationForm';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import OnboardingCurrencyPicker from './OnboardingCurrencyPicker';
import type {BaseOnboardingWorkspaceConfirmationProps} from './types';

function BaseOnboardingWorkspaceConfirmation({shouldUseNativeStyles}: BaseOnboardingWorkspaceConfirmationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [allPolicies] = useOnyx(ONYXKEYS.COLLECTION.POLICY, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {canBeMissing: true});
    const [activePolicyID] = useOnyx(ONYXKEYS.NVP_ACTIVE_POLICY_ID, {canBeMissing: true});
    const {inputCallbackRef} = useAutoFocusInput();

    const [draftValues, draftValuesMetadata] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM_DRAFT, {canBeMissing: true});
    const [session, sessionMetadata] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: false});
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();

    const paidGroupPolicy = Object.values(allPolicies ?? {}).find((policy) => isPaidGroupPolicy(policy) && isPolicyAdmin(policy, session?.email));

    const defaultWorkspaceName = draftValues?.name ?? generateDefaultWorkspaceName(session?.email);
    const defaultCurrency = draftValues?.currency ?? currentUserPersonalDetails?.localCurrencyCode ?? CONST.CURRENCY.USD;

    useEffect(() => {
        setOnboardingErrorMessage(null);
    }, []);

    const handleSubmit = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM>) => {
            if (!onboardingPurposeSelected) {
                return;
            }
            const shouldCreateWorkspace = !onboardingPolicyID && !paidGroupPolicy;
            const name = values.name.trim();
            const currency = values[INPUT_IDS.CURRENCY];
            // We need `adminsChatReportID` for `completeOnboarding`, but at the same time, we don't want to call `createWorkspace` more than once.
            // If we have already created a workspace, we want to reuse the `onboardingAdminsChatReportID` and `onboardingPolicyID`.
            const {adminsChatReportID, policyID} = shouldCreateWorkspace
                ? createWorkspace({
                      policyOwnerEmail: undefined,
                      makeMeAdmin: true,
                      policyName: name,
                      policyID: generatePolicyID(),
                      engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
                      currency,
                      file: undefined,
                      shouldAddOnboardingTasks: false,
                      introSelected,
                      activePolicyID,
                      currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                      currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                      shouldAddGuideWelcomeMessage: false,
                      onboardingPurposeSelected,
                  })
                : {adminsChatReportID: onboardingAdminsChatReportID, policyID: onboardingPolicyID};

            if (shouldCreateWorkspace) {
                setOnboardingAdminsChatReportID(adminsChatReportID);
                setOnboardingPolicyID(policyID);
            }
            clearWorkspaceDetailsDraft();
            Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE_INVITE.getRoute());
        },
        [
            onboardingPurposeSelected,
            onboardingPolicyID,
            paidGroupPolicy,
            onboardingAdminsChatReportID,
            activePolicyID,
            currentUserPersonalDetails.accountID,
            currentUserPersonalDetails.email,
            introSelected,
        ],
    );

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM>) => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.WORKSPACE_CONFIRMATION_FORM> = {};
        const name = values.name.trim();

        if (!isRequiredFulfilled(name)) {
            errors.name = translate('workspace.editor.nameIsRequiredError');
        } else if ([...name].length > CONST.TITLE_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            addErrorMessage(errors, 'name', translate('common.error.characterLimitExceedCounter', [...name].length, CONST.TITLE_CHARACTER_LIMIT));
        }

        if (!isRequiredFulfilled(values[INPUT_IDS.CURRENCY])) {
            errors[INPUT_IDS.CURRENCY] = translate('common.error.fieldRequired');
        }

        return errors;
    };

    if (isLoadingOnyxValue(draftValuesMetadata, sessionMetadata)) {
        return <FullScreenLoadingIndicator />;
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingWorkspaceConfirmation"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                progressBarPercentage={100}
                shouldDisplayHelpButton={false}
            />
            <FormProvider
                style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                formID={ONYXKEYS.FORMS.ONBOARDING_WORKSPACE_DETAILS_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.continue')}
                enabledWhenOffline
                submitFlexEnabled
                shouldValidateOnBlur={false}
            >
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                    <Text style={styles.textHeadlineH1} accessibilityRole="header">{translate('onboarding.confirmWorkspace.title')}</Text>
                </View>
                <View style={styles.mb5}>
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.confirmWorkspace.subtitle')}</Text>
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.NAME}
                        label={translate('workspace.common.workspaceName')}
                        accessibilityLabel={translate('workspace.common.workspaceName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={defaultWorkspaceName}
                        shouldSaveDraft
                        spellCheck={false}
                    />
                </View>
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mhn8 : styles.mhn5]}>
                    <InputWrapper
                        InputComponent={OnboardingCurrencyPicker}
                        inputID={INPUT_IDS.CURRENCY}
                        label={translate('workspace.editor.currencyInputLabel')}
                        defaultValue={defaultCurrency}
                        style={onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5}
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkspaceConfirmation;
