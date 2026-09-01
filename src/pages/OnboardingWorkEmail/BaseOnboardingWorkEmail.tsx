import AutoEmailLink from '@components/AutoEmailLink';
import Button from '@components/ButtonComposed';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import Icon from '@components/Icon';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import OnboardingHeader from '@components/OnboardingHeader';
import OnboardingMergingAccountBlockedView from '@components/OnboardingMergingAccountBlockedView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';

import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import {isMobileSafari} from '@libs/Browser';
import {addErrorMessage} from '@libs/ErrorUtils';
import getOperatingSystem from '@libs/getOperatingSystem';
import {dismissOnboardingModalBeforeExit} from '@libs/Navigation/helpers/OnboardingNavigationUtils';
import Navigation from '@libs/Navigation/Navigation';

import {AddWorkEmail} from '@userActions/Session';
import {addWorkEmailFormError, clearWorkEmailFormErrors, setOnboardingErrorMessage, setOnboardingMergeAccountStepValue} from '@userActions/Welcome';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import Log from '@src/libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/OnboardingWorkEmailForm';
import type IconAsset from '@src/types/utils/IconAsset';

import {useIsFocused} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
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
    const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboardingValues);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: (acc) => ({
            validated: acc?.validated,
            isFromPublicDomain: acc?.isFromPublicDomain,
        }),
    });
    const onboardingIntent = useOnboardingIntent();
    const isJoiningCompanyWorkspace = onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE;
    const {
        taskReport: addWorkEmailTaskReport,
        taskParentReport: addWorkEmailTaskParentReport,
        isOnboardingTaskParentReportArchived: isAddWorkEmailTaskParentReportArchived,
        hasOutstandingChildTask: addWorkEmailTaskHasOutstandingChildTask,
        parentReportAction: addWorkEmailTaskParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.ADD_WORK_EMAIL);
    const isAddWorkEmailTaskCompleted = addWorkEmailTaskReport?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED;
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    // This screen can be opened from the Concierge chat or from the task thread, and it is pushed over whichever one
    // the user was reading. Capture that report on mount so closing returns them exactly where they started rather
    // than to a fixed destination.
    const [originReportID] = useState(() => Navigation.getTopmostReportId());
    const [formValue] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM);
    const workEmail = formValue?.[INPUT_IDS.ONBOARDING_WORK_EMAIL];
    const [onboardingErrorMessageTranslationKey] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY);
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const {inputCallbackRef} = useAutoFocusInput();
    const [shouldValidateOnChange, setShouldValidateOnChange] = useState(false);
    const [hasSubmittedWorkEmail, setHasSubmittedWorkEmail] = useState(false);
    const {isOffline} = useNetwork();
    const ICON_SIZE = 48;
    const operatingSystem = getOperatingSystem();
    const isFocused = useIsFocused();

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

        // Opened from a Concierge task after onboarding is done: this screen is a standalone destination, not a step
        // in the guided flow, so go straight to the workspace list once validated instead of resuming onboarding.
        if (isJoiningCompanyWorkspace && hasCompletedGuidedSetupFlow) {
            // This screen was reached from a task link rather than pushed on top of the chat, so there is no reliable
            // entry to go back to - goBack() falls through to Home. Navigate back explicitly, using the same
            // dismiss-then-navigate pair that navigateAfterOnboarding uses when onboarding finishes.
            const returnToOriginReport = () => {
                dismissOnboardingModalBeforeExit();
                Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(originReportID ?? conciergeReportID));
            };

            // The task is done, so this screen has nothing left to offer. This also closes the screen right after a
            // successful submission, since that optimistically completes the task.
            if (isAddWorkEmailTaskCompleted) {
                returnToOriginReport();
                return;
            }

            // A validated account cannot add a work email at all (AddWorkEmail rejects it), so send those users to the
            // workspace list instead of a form they cannot submit.
            if (account?.validated) {
                Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute());
                return;
            }

            // The task is still open, so show the form. Any shouldValidate left over from an earlier attempt is ignored
            // until this visit submits something, otherwise a stale value would skip straight past the form.
            if (!hasSubmittedWorkEmail) {
                return;
            }

            // A code is needed to confirm the work email just submitted (an account already exists under that domain).
            if (onboardingValues?.shouldValidate) {
                Navigation.navigate(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute());
            }
            return;
        }

        // A validated account has no reason to be on the onboarding "add work email" screen. For a public-domain primary the
        // PRIVATE_DOMAIN screen would reference gmail.com (etc.) so skip it.
        // During incomplete guided setup (e.g. required-2FA handoff), stay on work-email even if the account is validated.
        if (account?.validated && hasCompletedGuidedSetupFlow) {
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

        // The "Join my company workspace" intent navigates here on purpose, so this screen is the destination rather than
        // a step to pass through. Submitting and skipping both navigate on their own from here.
        if (isJoiningCompanyWorkspace) {
            return;
        }

        navigateToNextStep();
    }, [
        account?.validated,
        account?.isFromPublicDomain,
        hasCompletedGuidedSetupFlow,
        onboardingValues?.shouldValidate,
        isVsb,
        isSmb,
        isFocused,
        isJoiningCompanyWorkspace,
        isAddWorkEmailTaskCompleted,
        hasSubmittedWorkEmail,
        conciergeReportID,
        originReportID,
        onboardingValues?.isMergeAccountStepCompleted,
        onboardingValues?.isMergeAccountStepSkipped,
    ]);

    const submitWorkEmail = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM>) => {
            setHasSubmittedWorkEmail(true);
            AddWorkEmail(
                values[INPUT_IDS.ONBOARDING_WORK_EMAIL].trim(),
                addWorkEmailTaskReport,
                addWorkEmailTaskParentReport,
                isAddWorkEmailTaskParentReportArchived,
                addWorkEmailTaskHasOutstandingChildTask,
                addWorkEmailTaskParentReportAction,
                currentUserPersonalDetails.accountID,
            );
        },
        [
            addWorkEmailTaskReport,
            addWorkEmailTaskParentReport,
            isAddWorkEmailTaskParentReportArchived,
            addWorkEmailTaskHasOutstandingChildTask,
            addWorkEmailTaskParentReportAction,
            currentUserPersonalDetails.accountID,
        ],
    );

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
            {/* This screen normally opens onboarding, so there is nothing to go back to unless the intent list sent us here. */}
            <OnboardingHeader
                shouldShowBackButton={isJoiningCompanyWorkspace}
                onBackButtonPress={() => Navigation.goBack()}
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
                                size={CONST.BUTTON_SIZE.LARGE}
                                testID="onboardingPrivateEmailSkipButton"
                                onPress={() => {
                                    setOnboardingErrorMessage(null);

                                    setOnboardingMergeAccountStepValue(true, true);

                                    // Reached from a task link, so skipping returns to wherever it was opened from
                                    // rather than continuing onboarding. goBack() falls through to Home here.
                                    if (isJoiningCompanyWorkspace && hasCompletedGuidedSetupFlow) {
                                        dismissOnboardingModalBeforeExit();
                                        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(originReportID ?? conciergeReportID));
                                        return;
                                    }

                                    // The user already picked an intent, so skipping continues to the last onboarding
                                    // step rather than returning them to the intent list they came from.
                                    if (isJoiningCompanyWorkspace) {
                                        Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute());
                                    }
                                }}
                                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.SKIP}
                            >
                                <Button.Text>{translate('common.skip')}</Button.Text>
                            </Button>
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
