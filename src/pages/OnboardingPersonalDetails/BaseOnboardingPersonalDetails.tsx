import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {hasURL} from '@libs/Url';
import {isCurrentUserValidated} from '@libs/UserUtils';
import {doesContainReservedWord, isValidDisplayName} from '@libs/ValidationUtils';
import {clearPersonalDetailsDraft, setPersonalDetails} from '@userActions/Onboarding';
import {setDisplayName, updateDisplayName} from '@userActions/PersonalDetails';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingErrorMessage, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/DisplayNameForm';
import type {BaseOnboardingPersonalDetailsProps} from './types';

function BaseOnboardingPersonalDetails({currentUserPersonalDetails, shouldUseNativeStyles, route}: BaseOnboardingPersonalDetailsProps) {
    const styles = useThemeStyles();
    const {translate, formatPhoneNumber} = useLocalize();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED, {canBeMissing: true});
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID, {canBeMissing: true});
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID, {canBeMissing: true});
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {canBeMissing: true});
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST, {canBeMissing: true});
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const [conciergeChatReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID, {canBeMissing: true});
    const {onboardingMessages} = useOnboardingMessages();
    const [session] = useOnyx(ONYXKEYS.SESSION, {canBeMissing: true});
    const [onboardingPersonalDetailsForm] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {canBeMissing: true});

    // When we merge public email with work email, we now want to navigate to the
    // concierge chat report of the new work email and not the last accessed report.
    const mergedAccountConciergeReportID = !onboardingValues?.shouldRedirectToClassicAfterMerge && onboardingValues?.shouldValidate ? conciergeChatReportID : undefined;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const {isBetaEnabled} = usePermissions();

    const isPrivateDomainAndHasAccessiblePolicies = !account?.isFromPublicDomain && !!account?.hasAccessibleDomainPolicies;
    const isValidated = isCurrentUserValidated(loginList, session?.email);

    const isVsb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;

    useEffect(() => {
        setOnboardingErrorMessage(null);
    }, []);

    const completeOnboarding = useCallback(
        (firstName: string, lastName: string) => {
            if (!onboardingPurposeSelected) {
                return;
            }
            completeOnboardingReport({
                engagementChoice: onboardingPurposeSelected,
                onboardingMessage: onboardingMessages[onboardingPurposeSelected],
                firstName,
                lastName,
                adminsChatReportID: onboardingAdminsChatReportID,
                onboardingPolicyID,
                shouldSkipTestDriveModal: !!onboardingPolicyID && !mergedAccountConciergeReportID,
            });

            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();

            navigateAfterOnboardingWithMicrotaskQueue(isSmallScreenWidth, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), onboardingPolicyID, mergedAccountConciergeReportID);
        },
        [onboardingPurposeSelected, onboardingAdminsChatReportID, onboardingMessages, onboardingPolicyID, isBetaEnabled, isSmallScreenWidth, mergedAccountConciergeReportID],
    );

    const handleSubmit = useCallback(
        (values: FormOnyxValues<'onboardingPersonalDetailsForm'>) => {
            const firstName = values.firstName.trim();
            const lastName = values.lastName.trim();

            setDisplayName(firstName, lastName, formatPhoneNumber, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
            clearPersonalDetailsDraft();
            setPersonalDetails(firstName, lastName);

            if (isPrivateDomainAndHasAccessiblePolicies && (!onboardingPurposeSelected || isVsb || isSmb)) {
                const nextRoute = isValidated ? ROUTES.ONBOARDING_WORKSPACES : ROUTES.ONBOARDING_PRIVATE_DOMAIN;
                Navigation.navigate(nextRoute.getRoute(route.params?.backTo));
                return;
            }

            if (onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.PERSONAL_SPEND || onboardingPurposeSelected === CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE) {
                updateDisplayName(firstName, lastName, formatPhoneNumber, session?.accountID ?? CONST.DEFAULT_NUMBER_ID, session?.email ?? '');
                Navigation.navigate(ROUTES.ONBOARDING_WORKSPACE.getRoute(route.params?.backTo));
                return;
            }

            completeOnboarding(firstName, lastName);
        },
        [
            formatPhoneNumber,
            session?.accountID,
            session?.email,
            isPrivateDomainAndHasAccessiblePolicies,
            onboardingPurposeSelected,
            isVsb,
            isSmb,
            completeOnboarding,
            isValidated,
            route.params?.backTo,
        ],
    );

    const validate = (values: FormOnyxValues<'onboardingPersonalDetailsForm'>) => {
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }

        const errors = {};

        // First we validate the first name field
        if (values.firstName.replaceAll(CONST.REGEX.ANY_SPACE, '').length === 0) {
            addErrorMessage(errors, 'firstName', translate('onboarding.error.requiredFirstName'));
        }
        if (hasURL(values.firstName)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.cannotContainSpecialCharacters'));
        } else if (!isValidDisplayName(values.firstName)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.firstName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', values.firstName.length, CONST.DISPLAY_NAME.MAX_LENGTH));
        }
        if (doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.containsReservedWord'));
        }

        // Then we validate the last name field
        if (hasURL(values.lastName)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.cannotContainSpecialCharacters'));
        } else if (!isValidDisplayName(values.lastName)) {
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
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPersonalDetails"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton={!isPrivateDomainAndHasAccessiblePolicies}
                progressBarPercentage={isPrivateDomainAndHasAccessiblePolicies ? 20 : 80}
                onBackButtonPress={() => {
                    // Based on the `handleSubmit` function to reverse where to return
                    if (isPrivateDomainAndHasAccessiblePolicies) {
                        Navigation.goBack();
                        return;
                    }

                    Navigation.goBack(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
                }}
                shouldDisplayHelpButton={false}
            />
            <FormProvider
                style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                formID={ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM}
                validate={validate}
                onSubmit={handleSubmit}
                submitButtonText={translate('common.continue')}
                enabledWhenOffline
                submitFlexEnabled
                shouldValidateOnBlur={false}
                shouldValidateOnChange={shouldValidateOnChange}
                shouldTrimValues={false}
            >
                <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.whatsYourName')}</Text>
                </View>
                <View style={styles.mb4}>
                    <InputWrapper
                        InputComponent={TextInput}
                        ref={inputCallbackRef}
                        inputID={INPUT_IDS.FIRST_NAME}
                        name="fname"
                        label={translate('common.firstName')}
                        aria-label={translate('common.firstName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={onboardingPersonalDetailsForm?.firstName ?? currentUserPersonalDetails?.firstName ?? ''}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(currentUserPersonalDetails?.firstName && {defaultValue: currentUserPersonalDetails.firstName})}
                        shouldSaveDraft
                        spellCheck={false}
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
                        defaultValue={onboardingPersonalDetailsForm?.lastName ?? currentUserPersonalDetails?.lastName ?? ''}
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(currentUserPersonalDetails?.lastName && {defaultValue: currentUserPersonalDetails.lastName})}
                        shouldSaveDraft
                        spellCheck={false}
                        autoComplete="family-name"
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

export default withCurrentUserPersonalDetails(BaseOnboardingPersonalDetails);
