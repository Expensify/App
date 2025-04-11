import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import withCurrentUserPersonalDetails from '@components/withCurrentUserPersonalDetails';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {doesContainReservedWord, isValidDisplayName} from '@libs/ValidationUtils';
import {clearPersonalDetailsDraft, setPersonalDetails} from '@userActions/Onboarding';
import {setDisplayName} from '@userActions/PersonalDetails';
import {completeOnboarding as completeOnboardingReport} from '@userActions/Report';
import {isUserOnPrivateDomain} from '@userActions/Session';
import {setOnboardingAdminsChatReportID, setOnboardingErrorMessage, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/DisplayNameForm';
import type {BaseOnboardingPersonalDetailsProps} from './types';

function BaseOnboardingPersonalDetails({currentUserPersonalDetails, shouldUseNativeStyles, route}: BaseOnboardingPersonalDetailsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [onboardingPurposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingPolicyID] = useOnyx(ONYXKEYS.ONBOARDING_POLICY_ID);
    const [onboardingAdminsChatReportID] = useOnyx(ONYXKEYS.ONBOARDING_ADMINS_CHAT_REPORT_ID);
    const [onboardingPersonalDetails] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const isPrivateDomain = isUserOnPrivateDomain();
    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    useEffect(() => {
        setOnboardingErrorMessage('');
    }, []);

    const completeOnboarding = useCallback(
        (firstName: string, lastName: string) => {
            if (!onboardingPurposeSelected) {
                return;
            }

            completeOnboardingReport({
                engagementChoice: onboardingPurposeSelected,
                onboardingMessage: CONST.ONBOARDING_MESSAGES[onboardingPurposeSelected],
                firstName,
                lastName,
                adminsChatReportID: onboardingAdminsChatReportID,
                onboardingPolicyID,
            });

            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID();

            navigateAfterOnboarding(onboardingPurposeSelected, isSmallScreenWidth, canUseDefaultRooms, onboardingPolicyID, activeWorkspaceID);
        },
        [onboardingPurposeSelected, onboardingAdminsChatReportID, onboardingPolicyID, activeWorkspaceID, canUseDefaultRooms, isSmallScreenWidth],
    );

    useEffect(() => {
        /**
         * Handle onboarding flow for users on private domains:
         * 1. If on a private domain, the flow starts with personal details.
         * 2. If the user skips this step, they must select an onboarding purpose.
         * 3. If an onboarding purpose is selected and the person is on a private domain,
         * skip the personal details step as it was already filled.
         */
        const skippedPrivateDomainFlow = isPrivateDomain && onboardingPurposeSelected;

        if (!skippedPrivateDomainFlow || !onboardingPersonalDetails?.firstName || !onboardingPersonalDetails?.lastName) {
            return;
        }

        completeOnboarding(onboardingPersonalDetails.firstName, onboardingPersonalDetails.lastName);
    }, [onboardingPersonalDetails, isPrivateDomain, onboardingPurposeSelected, completeOnboarding]);

    const handleSubmit = useCallback(
        (values: FormOnyxValues<'onboardingPersonalDetailsForm'>) => {
            const firstName = values.firstName.trim();
            const lastName = values.lastName.trim();

            setDisplayName(firstName, lastName);
            clearPersonalDetailsDraft();
            setPersonalDetails(firstName, lastName);

            if (isPrivateDomain && !onboardingPurposeSelected) {
                Navigation.navigate(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(route.params?.backTo));
                return;
            }

            completeOnboarding(firstName, lastName);
        },
        [isPrivateDomain, onboardingPurposeSelected, route.params?.backTo, completeOnboarding],
    );

    const validate = (values: FormOnyxValues<'onboardingPersonalDetailsForm'>) => {
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }

        const errors = {};

        // First we validate the first name field
        if (values.firstName.replace(CONST.REGEX.ANY_SPACE, '').length === 0) {
            addErrorMessage(errors, 'firstName', translate('onboarding.error.requiredFirstName'));
        }
        if (!isValidDisplayName(values.firstName)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.firstName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'firstName', translate('common.error.characterLimitExceedCounter', {length: values.firstName.length, limit: CONST.DISPLAY_NAME.MAX_LENGTH}));
        }
        if (doesContainReservedWord(values.firstName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'firstName', translate('personalDetails.error.containsReservedWord'));
        }

        // Then we validate the last name field
        if (!isValidDisplayName(values.lastName)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.hasInvalidCharacter'));
        } else if (values.lastName.length > CONST.DISPLAY_NAME.MAX_LENGTH) {
            addErrorMessage(errors, 'lastName', translate('common.error.characterLimitExceedCounter', {length: values.lastName.length, limit: CONST.DISPLAY_NAME.MAX_LENGTH}));
        }
        if (doesContainReservedWord(values.lastName, CONST.DISPLAY_NAME.RESERVED_NAMES)) {
            addErrorMessage(errors, 'lastName', translate('personalDetails.error.containsReservedWord'));
        }

        return errors;
    };

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            shouldShowOfflineIndicator={false}
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPersonalDetails"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton={!isPrivateDomain}
                progressBarPercentage={isPrivateDomain ? 20 : 80}
                onBackButtonPress={Navigation.goBack}
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
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(currentUserPersonalDetails?.firstName && {defaultValue: currentUserPersonalDetails.firstName})}
                        shouldSaveDraft
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
                        // eslint-disable-next-line react/jsx-props-no-spreading
                        {...(currentUserPersonalDetails?.lastName && {defaultValue: currentUserPersonalDetails.lastName})}
                        shouldSaveDraft
                        spellCheck={false}
                    />
                </View>
            </FormProvider>
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingPersonalDetails.displayName = 'BaseOnboardingPersonalDetails';

export default withCurrentUserPersonalDetails(BaseOnboardingPersonalDetails);
