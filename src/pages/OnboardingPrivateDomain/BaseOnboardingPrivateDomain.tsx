import OnboardingHeader from '@components/OnboardingHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import ValidateCodeForm from '@components/ValidateCodeActionModal/ValidateCodeForm';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useReturnToOriginReport from '@hooks/useReturnToOriginReport';
import useThemeStyles from '@hooks/useThemeStyles';

import {createJoinWorkspaceOnboardingContent, updateOnboardingValuesAndNavigation} from '@libs/actions/Welcome';
import Navigation from '@libs/Navigation/Navigation';
import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {resendValidateCode} from '@userActions/User';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import {isUserValidatedSelector} from '@selectors/Account';
import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import {CONST as COMMON_CONST, PUBLIC_DOMAINS_SET} from 'expensify-common';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingPrivateDomainProps} from './types';

function BaseOnboardingPrivateDomain({shouldUseNativeStyles, route}: BaseOnboardingPrivateDomainProps) {
    const [hasValidateCodeBeenSent, setHasValidateCodeBeenSent] = useState(false);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {
        selector: expensifyLoginsSelector,
    });
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [isAccountValidated] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: isUserValidatedSelector,
    });
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const joinablePoliciesLength = Object.keys(joinablePolicies ?? {}).length;

    const {onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();

    const email = session?.email ?? '';
    const domain = email.split('@').at(1) ?? '';

    const isValidated = isCurrentUserValidated(loginList, session?.email);

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isVsb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboardingValues);
    const onboardingIntent = useOnboardingIntent();
    const isJoiningCompanyWorkspace = onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE;
    const isConciergeTaskFlow = isJoiningCompanyWorkspace && hasCompletedGuidedSetupFlow && route.params?.isJoinWorkspaceTask === 'true';

    const {
        taskReport: validateEmailTaskReport,
        taskParentReport: validateEmailTaskParentReport,
        isOnboardingTaskParentReportArchived: isValidateEmailTaskParentReportArchived,
        hasOutstandingChildTask: validateEmailTaskHasOutstandingChildTask,
        parentReportAction: validateEmailTaskParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VALIDATE_EMAIL);
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const returnToOriginReport = useReturnToOriginReport();
    const createdValidateEmailTaskReportID = useRef<string | undefined>(undefined);
    const delegateAccountID = useDelegateAccountID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    const sendValidateCode = useCallback(() => {
        if (!email) {
            return;
        }
        resendValidateCode({reasonCode: COMMON_CONST.VALIDATE_CODE_REASONS.VALIDATE_ACCOUNT}, email);
    }, [email]);

    const handleBackButtonPress = useCallback(() => {
        if (onboardingValues?.shouldValidate === false) {
            updateOnboardingValuesAndNavigation(onboardingValues);
            return;
        }

        const routeToNavigate = (route.params?.backTo as Route) ?? ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();
        Navigation.goBack(routeToNavigate);
    }, [route.params?.backTo, onboardingValues]);

    const navigateToNextOnboardingStep = useCallback(
        (backTo: string | undefined, options?: {forceReplace?: boolean}) => {
            if (isVsb || isSmb) {
                Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(backTo), options);
                return;
            }
            Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(backTo), options);
        },
        [isVsb, isSmb],
    );

    // Reaching this screen from the join-workspace intent means there is no further onboarding step to route
    // back into: skipping or finding no joinable workspaces should complete onboarding (collecting a name first
    // if needed), or simply close when this screen was reopened from a Concierge task after onboarding finished.
    const continueAfterPrivateDomain = useCallback(
        (backTo: string | undefined, options?: {forceReplace?: boolean}) => {
            if (isJoiningCompanyWorkspace) {
                if (isConciergeTaskFlow) {
                    returnToOriginReport();
                    return;
                }
                Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), options);
                return;
            }
            navigateToNextOnboardingStep(backTo, options);
        },
        [isJoiningCompanyWorkspace, isConciergeTaskFlow, navigateToNextOnboardingStep, returnToOriginReport],
    );

    const handleConciergeTaskExit = useCallback(() => {
        if (!isConciergeTaskFlow) {
            return;
        }
        const validateEmailTaskReportID =
            validateEmailTaskReport?.reportID ??
            createdValidateEmailTaskReportID.current ??
            createJoinWorkspaceOnboardingContent('validateEmail', domain, email, conciergeChat, delegateAccountID);
        createdValidateEmailTaskReportID.current = validateEmailTaskReportID;
        if (validateEmailTaskReportID) {
            Navigation.dismissModal({
                afterTransition: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(validateEmailTaskReportID)),
            });
            return;
        }
        returnToOriginReport();
    }, [conciergeChat, delegateAccountID, domain, email, isConciergeTaskFlow, returnToOriginReport, validateEmailTaskReport?.reportID]);

    const handleSkipButtonPress = useCallback(() => {
        if (isConciergeTaskFlow) {
            handleConciergeTaskExit();
            return;
        }
        continueAfterPrivateDomain(route.params?.backTo);
    }, [continueAfterPrivateDomain, handleConciergeTaskExit, isConciergeTaskFlow, route.params?.backTo]);

    // Only users whose current primary login is both validated and public-domain are blocked from this screen, since
    // the "people on YOUR domain" copy would otherwise reference gmail.com. The account flag can lag a primary-login
    // change, so only use it until the login itself is available in Onyx.
    const isCurrentPrimaryPublicDomain = PUBLIC_DOMAINS_SET.has(domain.toLowerCase());
    const shouldBlockPublicDomain = isCurrentPrimaryPublicDomain && (isValidated || (!!isAccountValidated && !loginList?.[session?.email ?? '']));

    useEffect(() => {
        if (shouldBlockPublicDomain) {
            return;
        }
        if (isValidated) {
            return;
        }
        sendValidateCode();
    }, [sendValidateCode, isValidated, shouldBlockPublicDomain]);

    useEffect(() => {
        if (shouldBlockPublicDomain) {
            navigateToNextOnboardingStep(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
            return;
        }

        if (!isValidated) {
            return;
        }

        if (joinablePoliciesLength > 0) {
            Navigation.navigate(ROUTES.ONBOARDING_WORKSPACES.getRoute(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), isConciergeTaskFlow, isConciergeTaskFlow), {forceReplace: true});
            return;
        }

        // When validation succeeded but there are no joinable workspaces and the API call has completed,
        // navigate to the next onboarding step (same as the skip button behavior).
        if (getAccessiblePoliciesAction?.loading === false) {
            continueAfterPrivateDomain(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
        }
    }, [isValidated, joinablePoliciesLength, getAccessiblePoliciesAction?.loading, shouldBlockPublicDomain, navigateToNextOnboardingStep, continueAfterPrivateDomain, isConciergeTaskFlow]);

    const willNavigateAway = shouldBlockPublicDomain || (isValidated && (joinablePoliciesLength > 0 || getAccessiblePoliciesAction?.loading === false));
    if (willNavigateAway) {
        return null;
    }

    return (
        <ScreenWrapper
            shouldEnableMaxHeight
            includeSafeAreaPaddingBottom
            testID="BaseOnboardingPrivateDomain"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <OnboardingHeader
                shouldShowBackButton={!isConciergeTaskFlow}
                onBackButtonPress={handleBackButtonPress}
                shouldShowCloseButton={isConciergeTaskFlow}
                onCloseButtonPress={handleConciergeTaskExit}
            />
            <ScrollView
                style={[styles.w100, styles.h100, styles.flex1]}
                contentContainerStyle={styles.flexGrow1}
                keyboardShouldPersistTaps="handled"
            >
                <View style={[styles.mb5, onboardingIsMediumOrLargerScreenWidth && styles.mt5, onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, styles.flex1]}>
                    <Text
                        style={styles.textHeadlineH1}
                        accessibilityRole={CONST.ROLE.HEADER}
                    >
                        {translate('onboarding.peopleYouMayKnow')}
                    </Text>
                    <Text style={[styles.textAlignLeft, styles.mv5]}>{translate('onboarding.workspaceYouMayJoin', domain, email)}</Text>
                    <ValidateCodeForm
                        validateCodeActionErrorField="getAccessiblePolicies"
                        handleSubmitForm={(code) => {
                            getAccessiblePolicies(
                                code,
                                validateEmailTaskReport,
                                validateEmailTaskParentReport,
                                isValidateEmailTaskParentReportArchived,
                                validateEmailTaskHasOutstandingChildTask,
                                validateEmailTaskParentReportAction,
                                currentUserPersonalDetails.accountID,
                            );
                            setHasValidateCodeBeenSent(false);
                        }}
                        sendValidateCode={() => {
                            sendValidateCode();
                            setHasValidateCodeBeenSent(true);
                        }}
                        clearError={() => clearGetAccessiblePoliciesErrors()}
                        validateError={getAccessiblePoliciesAction?.errors}
                        hasValidateCodeBeenSent={hasValidateCodeBeenSent}
                        shouldShowSkipButton
                        handleSkipButtonPress={handleSkipButtonPress}
                        buttonStyles={[styles.flex2, styles.justifyContentEnd]}
                        isLoading={getAccessiblePoliciesAction?.loading}
                    />
                </View>
            </ScrollView>
        </ScreenWrapper>
    );
}

export default BaseOnboardingPrivateDomain;
