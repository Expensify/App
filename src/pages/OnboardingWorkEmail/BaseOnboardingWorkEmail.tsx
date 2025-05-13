import {useIsFocused} from '@react-navigation/native';
import {PUBLIC_DOMAINS, Str} from 'expensify-common';
import React, {useCallback, useEffect, useState} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import AutoEmailLink from '@components/AutoEmailLink';
import Button from '@components/Button';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Icon from '@components/Icon';
import * as Illustrations from '@components/Icon/Illustrations';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage} from '@libs/ErrorUtils';
import getOperatingSystem from '@libs/getOperatingSystem';
import Navigation from '@libs/Navigation/Navigation';
import {AddWorkEmail} from '@userActions/Session';
import {setOnboardingErrorMessage, setOnboardingMergeAccountStepValue} from '@userActions/Welcome';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
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
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {canBeMissing: true});
    const [formValue] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM, {canBeMissing: true});
    const workEmail = formValue?.[INPUT_IDS.ONBOARDING_WORK_EMAIL];
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE, {canBeMissing: true});
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const {isOffline} = useNetwork();
    const ICON_SIZE = 48;
    const operatingSystem = getOperatingSystem();
    const isFocused = useIsFocused();

    useEffect(() => {
        setOnboardingErrorMessage('');
    }, []);

    useEffect(() => {
        if (onboardingValues?.shouldValidate === undefined && onboardingValues?.isMergeAccountStepCompleted === undefined) {
            return;
        }
        setOnboardingErrorMessage('');

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

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
    }, [onboardingValues?.shouldValidate, isVsb, isFocused, onboardingValues?.isMergeAccountStepCompleted]);

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

        if ((PUBLIC_DOMAINS.some((publicDomain) => publicDomain === domain.toLowerCase()) || !Str.isValidEmail(userEmail)) && !isOffline) {
            addErrorMessage(errors, INPUT_IDS.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.publicEmail'));
        }

        if (isOffline ?? false) {
            addErrorMessage(errors, INPUT_IDS.ONBOARDING_WORK_EMAIL, translate('onboarding.workEmailValidationError.offline'));
        }

        return errors;
    };

    const section: Item[] = [
        {
            icon: Illustrations.EnvelopeReceipt,
            titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionOne',
            shouldRenderEmail: true,
        },
        {
            icon: Illustrations.Profile,
            titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionTwo',
        },
        {
            icon: Illustrations.Gears,
            titleTranslationKey: 'onboarding.workEmail.explanationModal.descriptionThree',
        },
    ];

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom={isOffline}
            testID="BaseOnboardingWorkEmail"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                progressBarPercentage={10}
                shouldShowBackButton={false}
            />
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
                    <View style={styles.mb2}>
                        <OfflineWithFeedback
                            shouldDisplayErrorAbove
                            errors={onboardingErrorMessage ? {addWorkEmailError: onboardingErrorMessage} : undefined}
                            errorRowStyles={[styles.mt2, styles.textWrap]}
                            onClose={() => setOnboardingErrorMessage('')}
                        >
                            <Button
                                large
                                text={translate('common.skip')}
                                testID="onboardingPrivateEmailSkipButton"
                                onPress={() => {
                                    setOnboardingErrorMessage('');

                                    setOnboardingMergeAccountStepValue(true);
                                    // Once we skip the private email step, we need to force replace the screen
                                    // so that we don't navigate back on back button press
                                    if (isVsb) {
                                        Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(), {forceReplace: true});
                                        return;
                                    }
                                    Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {forceReplace: true});
                                }}
                            />
                        </OfflineWithFeedback>
                    </View>
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
                    />
                </View>
            </FormProvider>
        </ScreenWrapper>
    );
}

BaseOnboardingWorkEmail.displayName = 'BaseOnboardingWorkEmail';

export default BaseOnboardingWorkEmail;
