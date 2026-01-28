import {useIsFocused} from '@react-navigation/native';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';
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
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {isMobileSafari} from '@libs/Browser';
import {addErrorMessage} from '@libs/ErrorUtils';
import getOperatingSystem from '@libs/getOperatingSystem';
import Navigation from '@libs/Navigation/Navigation';
import {AddWorkEmail} from '@userActions/Session';
import {setOnboardingErrorMessage, setOnboardingMergeAccountStepValue} from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import Log from '@src/libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/OnboardingWorkEmailForm';
import type IconAsset from '@src/types/utils/IconAsset';
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
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const [formValue] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {canBeMissing: true});
    const workEmail = formValue?.[INPUT_IDS.ONBOARDING_WORK_EMAIL];
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY, {canBeMissing: true});
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const {isOffline} = useNetwork();
    const ICON_SIZE = 48;
    const operatingSystem = getOperatingSystem();
    const isFocused = useIsFocused();

    useEffect(() => {
        setOnboardingErrorMessage(null);
    }, []);

    useEffect(() => {
        if (onboardingValues?.shouldValidate === undefined && onboardingValues?.isMergeAccountStepCompleted === undefined) {
            return;
        }
        setOnboardingErrorMessage(null);

        if (onboardingValues?.shouldValidate) {
            Navigation.navigate(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
            return;
        }
        // Once we verify that shouldValidate is false, we need to force replace the screen
        // so that we don't navigate back on back button press
        if (isVsb) {
            Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(), {forceReplace: true});
            return;
        }

        if (isSmb) {
            Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {forceReplace: true});
            return;
        }

        if (!onboardingValues?.isMergeAccountStepSkipped) {
            Navigation.navigate(ROUTES.ONBOARDING_PRIVATE_DOMAIN.getRoute(), {forceReplace: true});
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
    }, [onboardingValues?.shouldValidate, isVsb, isSmb, isFocused, onboardingValues?.isMergeAccountStepCompleted, onboardingValues?.isMergeAccountStepSkipped]);

    const submitWorkEmail = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>) => {
        AddWorkEmail(values[INPUT_IDS.ONBOARDING_WORK_EMAIL]);
    }, []);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>) => {
        if (!shouldValidateOnChange) {
            setShouldValidateOnChange(true);
        }
        const userEmail = values[INPUT_IDS.ONBOARDING_WORK_EMAIL];

        const errors = {};
        const emailParts = userEmail.split('@');
        const domain = emailParts.at(1) ?? '';

        if (!Str.isValidEmail(userEmail) && !isOffline) {
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
                progressBarPercentage={10}
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
                            errors={onboardingErrorMessage ? {addWorkEmailError: translate(onboardingErrorMessage)} : undefined}
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
                            />
                        </OfflineWithFeedback>
                    }
                    shouldRenderFooterAboveSubmit
                    shouldHideFixErrorsAlert
                >
                    <View>
                        <View style={[onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                            <Text style={styles.textHeadlineH1}>{translate('onboarding.workEmail.title')}</Text>
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
                        />
                    </View>
                </FormProvider>
            )}
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkEmail;
