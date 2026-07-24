import AutoEmailLink from '@components/AutoEmailLink';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnboardingMergingAccountBlockedView from '@components/OnboardingMergingAccountBlockedView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingStepCounter from '@hooks/useOnboardingStepCounter';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobileSafari} from '@libs/Browser';
import {addErrorMessage} from '@libs/ErrorUtils';
import getOperatingSystem from '@libs/getOperatingSystem';
import Navigation from '@libs/Navigation/Navigation';

import {AddWorkEmail} from '@userActions/Session';
import {addWorkEmailFormError, clearWorkEmailFormErrors, setOnboardingErrorMessage, setOnboardingMergeAccountStepValue} from '@userActions/Welcome';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import Log from '@src/libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/OnboardingWorkEmailForm';
import type IconAsset from '@src/types/utils/IconAsset';

import {useIsFocused} from '@react-navigation/native';
import {PUBLIC_DOMAINS_SET, Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingWorkEmailProps} from './types';

type Item = {
    icon: IconAsset;
    titleTranslationKey: TranslationPaths;
    shouldRenderEmail?: boolean;
};

function BaseOnboardingWorkEmail({shouldUseNativeStyles}: BaseOnboardingWorkEmailProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const illustrations = useMemoizedLazyIllustrations(['EnvelopeReceipt', 'Gears', 'Profile']);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: (acc) => ({
            validated: acc?.validated,
            isFromPublicDomain: acc?.isFromPublicDomain,
        }),
    });
    const [formValue] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM);
    const workEmail = formValue?.[INPUT_IDS.ONBOARDING_WORK_EMAIL];
    const [onboardingErrorMessageTranslationKey] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY);
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const {isOffline} = useNetwork();
    const ICON_SIZE = 48;
    const operatingSystem = getOperatingSystem();
    const isFocused = useIsFocused();
    const onboardingStep = useOnboardingStepCounter(SCREENS.ONBOARDING.WORK_EMAIL);

    useEffect(() => {
        setOnboardingErrorMessage(null);
    }, []);

    useEffect(() => {
        const navigateToNextStep = (shouldSkipPrivateDomain = false) => {
            if (isVsb || isSmb) {
                Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
                return;
            }
            if (!shouldSkipPrivateDomain && !onboardingValues?.isMergeAccountStepSkipped) {
                Navigation.navigate(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(), {forceReplace: true});
                return;
            }
            Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
        };

        // A validated account has no reason to be on the onboarding "add work email" screen. For a public-domain primary the
        // PRIVATE_DOMAIN screen would reference gmail.com (etc.) so skip it.
        if (account?.validated) {
            navigateToNextStep(account?.isFromPublicDomain);
            return;
        }

        if (onboardingValues?.shouldValidate === undefined && onboardingValues?.isMergeAccountStepCompleted === undefined) {
            return;
        }
        setOnboardingErrorMessage(null);

        if (onboardingValues?.shouldValidate) {
            Navigation.navigate(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
            return;
        }

        navigateToNextStep();
    }, [
        account?.validated,
        account?.isFromPublicDomain,
        onboardingValues?.shouldValidate,
        isVsb,
        isSmb,
        isFocused,
        onboardingValues?.isMergeAccountStepCompleted,
        onboardingValues?.isMergeAccountStepSkipped,
    ]);

    const submitWorkEmail = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>) => {
        AddWorkEmail(values[INPUT_IDS.ONBOARDING_WORK_EMAIL].trim());
    }, []);

    useEffect(() => {
        if (!onboardingErrorMessageTranslationKey) {
            clearWorkEmailFormErrors();
            return;
        }

        addWorkEmailFormError(translate(onboardingErrorMessageTranslationKey));
    }, [onboardingErrorMessageTranslationKey, translate]);

    const clearOnboardingErrorMessage = useCallback(() => {
        if (!onboardingErrorMessageTranslationKey) {
            return;
        }
        setOnboardingErrorMessage(null);
    }, [onboardingErrorMessageTranslationKey]);

    const shouldRenderOfflineFeedback = useCallback((errorTranslation: string) => {
        if (
            errorTranslation !== 'onboarding.workEmail2FAError' &&
            errorTranslation !== 'onboarding.mergeBlockScreen.workAccountClosedSubtitle' &&
            errorTranslation !== 'onboarding.singleSignOnError'
        ) {
            return true;
        }
        return false;
    }, []);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>) => {
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }
        const userEmail = values[INPUT_IDS.ONBOARDING_WORK_EMAIL].trim();

        const errors = {};
        const emailParts = userEmail.split('@');
        const domain = emailParts.at(1) ?? '';

        if (session?.email && userEmail.toLowerCase() === session.email.toLowerCase() && !isOffline) {
            addErrorMessage(errors, INPUT_IDS.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.sameAsSignupEmail'));
        } else if ((!Str.isValidEmail(userEmail) || PUBLIC_DOMAINS_SET.has(domain.toLowerCase())) && !isOffline) {
            Log.hmmm('User is trying to add an invalid work email', {userEmail, domain});
            addErrorMessage(errors, INPUT_IDS.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.publicEmail'));
        }

        if (isOffline ?? false) {
            addErrorMessage(errors, INPUT_IDS.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.offline'));
        }

        return errors;
    };

    const section: Item[] = useMemo(
        () => [
            {
                icon: illustrations.EnvelopeReceipt,
                titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionOne',
                shouldRenderEmail: true,
            },
            {
                icon: illustrations.Profile,
                titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionTwo',
            },
            {
                icon: illustrations.Gears,
                titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionThree',
            },
        ],
        [illustrations.EnvelopeReceipt, illustrations.Profile, illustrations.Gears],
    );

    return (
        <ScreenWrapper
            shouldEnableMaxHeight={!isMobileSafari()}
            shouldAvoidScrollOnVirtualViewport={!isMobileSafari()}
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingWorkEmail"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                stepCounter={onboardingStep?.stepCounter}
                progressBarPercentage={onboardingStep?.progressBarPercentage}
                shouldShowBackButton={false}
                shouldDisplayHelpButton={false}
            />
            {onboardingValues?.isMergingAccountBlocked ? (
                <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <OnboardingMergingAccountBlockedView
                        workEmail={workEmail}
                        isVsb={isVsb}
                    />
                </View>
            ) : (
                <FormProvider
                    style={[styles.flexGrow1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}
                    formID={ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM}
                    validate={validate}
                    onSubmit={submitWorkEmail}
                    submitButtonText={translate('onboarding.workEmail.addWorkEmail')}
                    enabledWhenOffline
                    submitFlexEnabled
                    shouldValidateOnBlur={false}
                    shouldValidateOnChange={shouldValidateOnChange}
                    shouldTrimValues={false}
                    footerContent={
                        <OfflineWithFeedback
                            shouldDisplayErrorAbove
                            style={styles.mb3}
                            errors={
                                onboardingErrorMessageTranslationKey && shouldRenderOfflineFeedback(onboardingErrorMessageTranslationKey)
                                    ? {addWorkEmailError: translate(onboardingErrorMessageTranslationKey)}
                                    : undefined
                            }
                            errorRowStyles={[styles.mt2, styles.textWrap]}
                            onClose={() => setOnboardingErrorMessage(null)}
                        >
                            <Button
                                large
                                text={translate('common.skip')}
                                testID="onboardingPrivateEmailSkipButton"
                                onPress={() => {
                                    setOnboardingErrorMessage(null);

                                    setOnboardingMergeAccountStepValue(true, true);
                                }}
                                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.SKIP}
                            />
                        </OfflineWithFeedback>
                    }
                    shouldRenderFooterAboveSubmit
                    shouldHideFixErrorsAlert
                >
                    <View>
                        <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                            <Text
                                style={styles.textHeadlineH1}
                                accessibilityRole={CONST.ROLE.HEADER}
                            >
                                {translate('onboarding.workEmail.title')}
                            </Text>
                        </View>
                        <View style={styles.mb2}>
                            <Text style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.workEmail.subtitle')}</Text>
                        </View>
                        <View>
                            {section.map((item) => {
                                return (
                                    <View
                                        key={item.titleTranslationKey}
                                        style={[styles.mt2, styles.mb3]}
                                    >
                                        <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1]}>
                                            <Icon
                                                src={item.icon}
                                                height={ICON_SIZE}
                                                width={ICON_SIZE}
                                                additionalStyles={[styles.mr3]}
                                            />
                                            <View style={[styles.flexColumn, styles.flex1]}>
                                                {item.shouldRenderEmail ? (
                                                    <AutoEmailLink
                                                        style={[styles.textStrong, styles.lh20]}
                                                        text={translate(item.titleTranslationKey)}
                                                    />
                                                ) : (
                                                    <Text style={[styles.textStrong, styles.lh20]}>{translate(item.titleTranslationKey)}</Text>
                                                )}
                                            </View>
                                        </View>
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    <View style={[styles.mb4, styles.pt3]}>
                        <InputWrapper
                            InputComponent={TextInput}
                            // We do not want to auto-focus for mobile platforms
                            ref={operatingSystem !== CONST.OS.ANDROID && operatingSystem !== CONST.OS.IOS ? inputCallbackRef : undefined}
                            name="fname"
                            inputID={INPUT_IDS.ONBOARDING_WORK_EMAIL}
                            label={translate('common.workEmail')}
                            aria-label={translate('common.workEmail')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={workEmail ?? ''}
                            shouldSaveDraft
                            maxLength={CONST.LOGIN_CHARACTER_LIMIT}
                            spellCheck={false}
                            autoComplete="email"
                            onValueChange={clearOnboardingErrorMessage}
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkEmail;
