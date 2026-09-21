import OnboardingHeader from '@components/OnboardingHeader';
import OnboardingMergingAccountBlockedView from '@components/OnboardingMergingAccountBlockedView';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';

import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useReturnToOriginReport from '@hooks/useReturnToOriginReport';
import useThemeStyles from '@hooks/useThemeStyles';

import AccountUtils from '@libs/AccountUtils';
import {openOldDotLink} from '@libs/actions/Link';
import {
    clearOnboardingMergeAccountBlocked,
    createJoinWorkspaceOnboardingContent,
    setOnboardingErrorMessage,
    setOnboardingMergeAccountStepValue,
    updateOnboardingValuesAndNavigation,
} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import {MergeIntoAccountAndLogin} from '@userActions/Session';
import {resendValidateCode} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';

import {useIsFocused} from '@react-navigation/native';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingWorkEmailValidationProps} from './types';

function BaseOnboardingWorkEmailValidation({shouldUseNativeStyles, route}: BaseOnboardingWorkEmailValidationProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [credentials] = useOnyx(ONYXKEYS.CREDENTIALS);
    const [onboardingEmail] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_WORK_EMAIL_FORM);
    const workEmail = onboardingEmail?.onboardingWorkEmail;

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const onboardingIntent = useOnboardingIntent();
    const isConciergeTaskFlow =
        onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE && hasCompletedGuidedSetupFlowSelector(onboardingValues) && route.params?.isJoinWorkspaceTask === 'true';
    const isCurrentPrimaryValidated = isCurrentUserValidated(loginList, session?.email) || (!!account?.validated && !loginList?.[session?.email ?? '']);
    const returnToOriginReport = useReturnToOriginReport();
    const delegateAccountID = useDelegateAccountID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const isVsb = onboardingValues && 'signupQualifier' in onboardingValues && onboardingValues.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const [onboardingErrorMessage] = useOnyx(ONYXKEYS.ONBOARDING_ERROR_MESSAGE_TRANSLATION_KEY);
    const isValidateCodeFormSubmitting = AccountUtils.isValidateCodeFormSubmitting(account);
    const isFocused = useIsFocused();

    useEffect(() => {
        if (!isConciergeTaskFlow || !isCurrentPrimaryValidated) {
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(undefined, true, true), {forceReplace: true});
    }, [isConciergeTaskFlow, isCurrentPrimaryValidated]);

    useEffect(() => {
        if (onboardingValues?.isMergeAccountStepCompleted === undefined) {
            return;
        }
        setOnboardingErrorMessage(null);
        if (onboardingValues?.shouldRedirectToClassicAfterMerge) {
            openOldDotLink(CONST.OLDDOT_URLS.INBOX, true);
            return;
        }
        // Once we verify that shouldValidate is false, we need to force replace the screen
        // so that we don't navigate back on back button press
        if (isVsb || isSmb) {
            Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(), {
                forceReplace: true,
            });
            return;
        }

        if (!onboardingValues?.isMergeAccountStepSkipped) {
            Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(undefined, isConciergeTaskFlow, isConciergeTaskFlow), {
                forceReplace: true,
            });
            return;
        }

        if (onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE) {
            Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(), {
            forceReplace: true,
        });
    }, [
        onboardingValues?.isMergeAccountStepCompleted,
        onboardingValues?.shouldRedirectToClassicAfterMerge,
        onboardingValues?.isMergeAccountStepSkipped,
        isVsb,
        isSmb,
        isFocused,
        isConciergeTaskFlow,
        onboardingIntent,
    ]);

    const sendValidateCode = () => {
        if (!credentials?.login) {
            return;
        }
        resendValidateCode({reasonCode: null}, credentials.login);
    };

    const validateAccountAndMerge = (validateCode: string) => {
        setOnboardingErrorMessage(null);
        MergeIntoAccountAndLogin(workEmail, validateCode, session?.accountID, onboardingEmail?.completedTaskReportActionID);
    };

    const handleConciergeTaskExit = useCallback(() => {
        setOnboardingErrorMessage(null);
        if (!isConciergeTaskFlow) {
            return;
        }
        if (onboardingValues?.isMergingAccountBlocked) {
            clearOnboardingMergeAccountBlocked();
            returnToOriginReport();
            return;
        }
        const taskWorkEmail = workEmail ?? '';
        const validateEmailTaskReportID = createJoinWorkspaceOnboardingContent('validateEmail', taskWorkEmail.split('@').at(1) ?? '', taskWorkEmail, conciergeChat, delegateAccountID);
        if (validateEmailTaskReportID) {
            Navigation.dismissModal({
                afterTransition: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(validateEmailTaskReportID)),
            });
            return;
        }
        returnToOriginReport();
    }, [conciergeChat, delegateAccountID, isConciergeTaskFlow, onboardingValues?.isMergingAccountBlocked, returnToOriginReport, workEmail]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingWorkEmailValidation"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <OnboardingHeader
                shouldShowBackButton={!isConciergeTaskFlow && !onboardingValues?.isMergingAccountBlocked}
                onBackButtonPress={() => {
                    updateOnboardingValuesAndNavigation(onboardingValues);
                }}
                shouldShowCloseButton={isConciergeTaskFlow}
                onCloseButtonPress={handleConciergeTaskExit}
            />
            {onboardingValues?.isMergingAccountBlocked ? (
                <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <OnboardingMergingAccountBlockedView
                        workEmail={workEmail}
                        isVsb={isVsb}
                        onConfirm={isConciergeTaskFlow ? handleConciergeTaskExit : undefined}
                    />
                </View>
            ) : (
                <View style={[styles.flex1, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5]}>
                    <Text
                        style={styles.textHeadlineH1}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('onboarding.workEmailValidation.title')}
                    </Text>
                    <Text style={[styles.textNormal, styles.colorMuted, styles.textAlignLeft, styles.mt5]}>{translate('onboarding.workEmailValidation.securityCodeSent', workEmail)}</Text>
                    <ValidateCodeForm
                        handleSubmitForm={validateAccountAndMerge}
                        sendValidateCode={sendValidateCode}
                        validateCodeActionErrorField="mergeIntoAccountAndLogIn"
                        clearError={() => setOnboardingErrorMessage(null)}
                        buttonStyles={[styles.flex2, styles.justifyContentEnd, styles.mb5]}
                        shouldShowSkipButton
                        handleSkipButtonPress={() => {
                            if (isConciergeTaskFlow) {
                                handleConciergeTaskExit();
                                return;
                            }
                            setOnboardingErrorMessage(null);
                            setOnboardingMergeAccountStepValue(true, true);
                        }}
                        isLoading={isValidateCodeFormSubmitting}
                        validateError={onboardingErrorMessage ? {invalidCodeError: translate(onboardingErrorMessage)} : undefined}
                    />
                </View>
            )}
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkEmailValidation;
