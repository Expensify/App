import Button from '@components/Button';
import ButtonDisabledWhenOffline from '@components/Button/composed/ButtonDisabledWhenOffline';
import LinkButton from '@components/Button/composed/LinkButton';
import OnboardingHeader from '@components/OnboardingHeader';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import BareUserListItem from '@components/SelectionList/ListItem/BareUserListItem';
import Text from '@components/Text';

import useAutoCreateSubmitWorkspace from '@hooks/useAutoCreateSubmitWorkspace';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDefaultExpensePolicy from '@hooks/useDefaultExpensePolicy';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnboardingIntent from '@hooks/useOnboardingIntent';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useReturnToOriginReport from '@hooks/useReturnToOriginReport';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {getEmailDomain} from '@libs/LoginUtils';
import {navigateAfterOnboardingWithMicrotaskQueue, navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import {askToJoinPolicy, joinAccessiblePolicy} from '@userActions/Policy/Member';
import {clearGetAccessiblePoliciesErrors, getAccessiblePolicies} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {createJoinWorkspaceOnboardingContent, setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {JoinablePolicy} from '@src/types/onyx/JoinablePolicies';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useFocusEffect} from '@react-navigation/native';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import React, {useCallback, useEffect, useEffectEvent, useRef, useState} from 'react';
import {View} from 'react-native';

import type {BaseOnboardingWorkspacesProps} from './types';

function BaseOnboardingWorkspaces({route, shouldUseNativeStyles}: BaseOnboardingWorkspacesProps) {
    const icons = useMemoizedLazyExpensifyIcons(['DownArrow']);
    const theme = useTheme();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingMessages, joinWorkspaceMessages} = useOnboardingMessages();
    const [showAll, setShowAll] = useState(false);

    const {
        onboardingIsMediumOrLargerScreenWidth,
        // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
        // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
        isSmallScreenWidth,
        shouldUseNarrowLayout,
    } = useResponsiveLayout();
    const [joinablePolicies, joinablePoliciesMetadata] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);

    const isLoadingJoinablePolicies = isLoadingOnyxValue(joinablePoliciesMetadata);
    const joinablePoliciesLoading = getAccessiblePoliciesAction?.loading;
    const joinablePoliciesErrors = getAccessiblePoliciesAction?.errors;
    const accessiblePoliciesActionRequestID = getAccessiblePoliciesAction?.requestID;
    const joinablePoliciesLength = Object.keys(joinablePolicies ?? {}).length;

    const [onboardingPersonalDetails] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const {
        taskReport: joinWorkspaceTaskReport,
        taskParentReport: joinWorkspaceTaskParentReport,
        isOnboardingTaskParentReportArchived: isJoinWorkspaceTaskParentReportArchived,
        hasOutstandingChildTask: joinWorkspaceTaskHasOutstandingChildTask,
        parentReportAction: joinWorkspaceTaskParentReportAction,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.JOIN_WORKSPACE);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {
        selector: hasSeenTourSelector,
    });
    const [reportNameValuePairs] = useOnyx(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS);

    const {accountID: currentUserAccountID, email: currentUserEmail} = useCurrentUserPersonalDetails();
    const isValidated = isCurrentUserValidated(loginList, currentUserEmail);
    const defaultPolicy = useDefaultExpensePolicy();

    const {isBetaEnabled} = usePermissions();
    const delegateAccountID = useDelegateAccountID();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isVsb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;
    const onboardingIntent = useOnboardingIntent({isJoinWorkspaceTask: route.params?.isJoinWorkspaceTask === 'true'});
    const isEmployerWithSubmit = onboardingIntent === CONST.ONBOARDING_CHOICES.EMPLOYER;
    const isJoiningCompanyWorkspace = onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE;
    const isConciergeTaskFlow = route.params?.isJoinWorkspaceTask === 'true';
    const shouldCreateJoinWorkspaceTaskOnExit = route.params?.shouldCreateJoinWorkspaceTaskOnExit === 'true';
    const createdEmptyWorkspaceContentDomains = useRef(new Set<string>());
    const createdJoinWorkspaceTask = useRef(false);
    const createdJoinWorkspaceTaskReportID = useRef<string | undefined>(undefined);
    const hasRequestedAccessiblePolicies = useRef(false);
    const accessiblePoliciesRequestID = useRef<string | undefined>(undefined);
    const autoCreateSubmitWorkspace = useAutoCreateSubmitWorkspace();

    const returnToOriginReport = useReturnToOriginReport();
    const shouldHideBackButton = onboardingValues?.shouldValidate === false && route.params?.backTo === ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

    const createAndOpenJoinWorkspaceTask = () => {
        const companyDomain = session?.email ? getEmailDomain(session.email) : '';
        const joinWorkspaceTaskReportID =
            joinWorkspaceTaskReport?.reportID ??
            introSelected?.joinWorkspace ??
            createdJoinWorkspaceTaskReportID.current ??
            createJoinWorkspaceOnboardingContent('joinWorkspace', companyDomain, session?.email ?? '', conciergeChat, delegateAccountID);
        createdJoinWorkspaceTaskReportID.current = joinWorkspaceTaskReportID;
        if (joinWorkspaceTaskReportID) {
            Navigation.dismissModalWithReport({reportID: joinWorkspaceTaskReportID});
            return;
        }
        returnToOriginReport();
    };

    const closeJoinWorkspaceTask = () => {
        if (shouldCreateJoinWorkspaceTaskOnExit) {
            createAndOpenJoinWorkspaceTask();
            return;
        }
        returnToOriginReport();
    };

    const finishOnboarding = (policy: JoinablePolicy) => {
        const isJoiningSubmitPolicy = policy.policyType === CONST.POLICY.TYPE.SUBMIT;
        const shouldUseSubmitFlow = policy.automaticJoiningEnabled && isJoiningSubmitPolicy;

        // Auto-joining finishes the join-workspace task immediately, so the welcome message drops its task list.
        const joinWorkspaceOnboardingMessage = policy.automaticJoiningEnabled ? {...joinWorkspaceMessages.joinWorkspace, tasks: []} : joinWorkspaceMessages.joinWorkspace;
        const completionIntent =
            onboardingIntent === CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE || onboardingIntent === CONST.ONBOARDING_CHOICES.EMPLOYER
                ? onboardingIntent
                : CONST.ONBOARDING_CHOICES.LOOKING_AROUND;
        const onboardingMessage = isJoiningCompanyWorkspace ? joinWorkspaceOnboardingMessage : onboardingMessages[completionIntent];

        completeOnboarding({
            engagementChoice: completionIntent,
            onboardingMessage,
            firstName: onboardingPersonalDetails?.firstName ?? '',
            lastName: onboardingPersonalDetails?.lastName ?? '',
            companySize: onboardingCompanySize,
            introSelected,
            isSelfTourViewed,
            conciergeChat,
            companyDomain: session?.email ? getEmailDomain(session.email) : '',
            workEmail: session?.email ?? '',
            currentUserAccountID,
            delegateAccountID,
        });
        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID(policy.policyID);

        if (shouldUseSubmitFlow) {
            navigateToSubmitWorkspaceAfterOnboardingWithMicrotaskQueue(policy.policyID, shouldUseNarrowLayout);
            return;
        }

        navigateAfterOnboardingWithMicrotaskQueue(
            isSmallScreenWidth,
            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            conciergeReportID,
            reportNameValuePairs,
            policy.automaticJoiningEnabled ? policy.policyID : undefined,
            undefined,
            false,
        );
    };

    const handleJoinWorkspace = (policy: JoinablePolicy) => {
        if (policy.automaticJoiningEnabled) {
            joinAccessiblePolicy(
                policy.policyID,
                joinWorkspaceTaskReport,
                joinWorkspaceTaskParentReport,
                isJoinWorkspaceTaskParentReportArchived,
                joinWorkspaceTaskHasOutstandingChildTask,
                joinWorkspaceTaskParentReportAction,
                currentUserAccountID,
            );
        } else {
            askToJoinPolicy(policy.policyID);
        }

        if (isConciergeTaskFlow) {
            returnToOriginReport();
            return;
        }

        finishOnboarding(policy);
    };

    const allPolicyIDItems = Object.values(joinablePolicies ?? {})
        .sort((a, b) => b.employeeCount - a.employeeCount)
        .map((policyInfo) => ({
            text: policyInfo.policyName,
            alternateText: translate('onboarding.workspaceMemberList', {
                count: policyInfo.employeeCount,
                policyOwner: policyInfo.policyOwner,
            }),
            // The user is not a member of these workspaces yet, so they are absent from Onyx and the avatar falls back
            // to the default one seeded from `text` - the same icon this list used to build by hand.
            policyID: policyInfo.policyID,
            keyForList: policyInfo.policyID,
            isDisabled: true,
            rightElement: (
                <ButtonDisabledWhenOffline
                    variant={CONST.BUTTON_VARIANT.SUCCESS}
                    size={CONST.BUTTON_SIZE.MEDIUM}
                    onPress={() => {
                        handleJoinWorkspace(policyInfo);
                    }}
                    sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.JOIN_WORKSPACE}
                >
                    <Button.Text>{policyInfo.automaticJoiningEnabled ? translate('workspace.workspaceList.joinNow') : translate('workspace.workspaceList.askToJoin')}</Button.Text>
                </ButtonDisabledWhenOffline>
            ),
        }));

    const hasMoreThanLimit = allPolicyIDItems.length > CONST.ONBOARDING_JOINABLE_WORKSPACES_LIMIT;
    const policyIDItems = !showAll && hasMoreThanLimit ? allPolicyIDItems.slice(0, CONST.ONBOARDING_JOINABLE_WORKSPACES_LIMIT) : allPolicyIDItems;

    const wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;

    // Empty deps keep this cleanup tied to losing focus rather than to the data below changing, so the guard only
    // clears when the screen is actually left and a later focus can retry.
    useFocusEffect(
        useCallback(
            () => () => {
                hasRequestedAccessiblePolicies.current = false;
                accessiblePoliciesRequestID.current = undefined;
            },
            [],
        ),
    );

    useFocusEffect(
        useCallback(() => {
            // Guarded by a ref instead of by omitting the loading/count dependencies: an empty response leaves the
            // count at 0, so reacting to those updates would immediately issue another request.
            if (!isValidated || isLoadingJoinablePolicies || joinablePoliciesLength > 0 || hasRequestedAccessiblePolicies.current) {
                return;
            }

            // Validation can start this lookup before navigating here. Track that request so an empty response is
            // handled by the effect below instead of leaving the list on its loading placeholder indefinitely.
            if (joinablePoliciesLoading) {
                if (accessiblePoliciesActionRequestID) {
                    hasRequestedAccessiblePolicies.current = true;
                    accessiblePoliciesRequestID.current = accessiblePoliciesActionRequestID;
                }
                return;
            }

            hasRequestedAccessiblePolicies.current = true;
            accessiblePoliciesRequestID.current = getAccessiblePolicies();
        }, [accessiblePoliciesActionRequestID, isValidated, isLoadingJoinablePolicies, joinablePoliciesLength, joinablePoliciesLoading]),
    );

    useEffect(() => {
        if (accessiblePoliciesActionRequestID !== accessiblePoliciesRequestID.current || joinablePoliciesLoading !== false || joinablePoliciesErrors || joinablePoliciesLength > 0) {
            return;
        }

        const companyDomain = session?.email ? getEmailDomain(session.email) : '';
        if (isConciergeTaskFlow && companyDomain && !createdEmptyWorkspaceContentDomains.current.has(companyDomain)) {
            createdEmptyWorkspaceContentDomains.current.add(companyDomain);
            createJoinWorkspaceOnboardingContent('empty', companyDomain, session?.email ?? '', conciergeChat, delegateAccountID);
        }
        if (isConciergeTaskFlow) {
            if (conciergeReportID) {
                Navigation.dismissModalWithReport({reportID: conciergeReportID});
                return;
            }
            returnToOriginReport();
            return;
        }
        Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute(), {forceReplace: true});
    }, [
        conciergeChat,
        conciergeReportID,
        delegateAccountID,
        accessiblePoliciesActionRequestID,
        isConciergeTaskFlow,
        joinablePoliciesErrors,
        joinablePoliciesLength,
        joinablePoliciesLoading,
        returnToOriginReport,
        session?.email,
    ]);

    const finishOnboardingFromEffect = useEffectEvent(finishOnboarding);

    useEffect(() => {
        if (!shouldCreateJoinWorkspaceTaskOnExit || joinablePoliciesLength === 0 || introSelected?.joinWorkspace || joinWorkspaceTaskReport || createdJoinWorkspaceTask.current) {
            return;
        }

        createdJoinWorkspaceTask.current = true;
        const companyDomain = session?.email ? getEmailDomain(session.email) : '';
        createdJoinWorkspaceTaskReportID.current = createJoinWorkspaceOnboardingContent('joinWorkspace', companyDomain, session?.email ?? '', conciergeChat, delegateAccountID);
    }, [conciergeChat, delegateAccountID, introSelected?.joinWorkspace, joinWorkspaceTaskReport, joinablePoliciesLength, session?.email, shouldCreateJoinWorkspaceTaskOnExit]);

    useEffect(() => {
        if (isLoadingJoinablePolicies || joinablePoliciesLoading !== false || joinablePoliciesLength > 0 || !defaultPolicy?.id) {
            return;
        }

        finishOnboardingFromEffect({
            policyID: defaultPolicy.id,
            policyName: defaultPolicy.name,
            policyOwner: defaultPolicy.owner,
            employeeCount: 0,
            hasPendingAccess: false,
            automaticJoiningEnabled: false,
            policyType: defaultPolicy.type,
        });
    }, [isLoadingJoinablePolicies, joinablePoliciesLoading, joinablePoliciesLength, defaultPolicy?.id, defaultPolicy?.name, defaultPolicy?.owner, defaultPolicy?.type]);

    const skipJoiningWorkspaces = () => {
        if (isEmployerWithSubmit) {
            autoCreateSubmitWorkspace(onboardingPersonalDetails?.firstName ?? '', onboardingPersonalDetails?.lastName ?? '');
            return;
        }

        if (isJoiningCompanyWorkspace) {
            // A marked Concierge task has no onboarding step to continue into, so just create or reopen the next
            // task instead of completing onboarding again.
            if (shouldCreateJoinWorkspaceTaskOnExit) {
                createAndOpenJoinWorkspaceTask();
                return;
            }

            if (isConciergeTaskFlow) {
                returnToOriginReport();
                return;
            }

            completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE,
                onboardingMessage: joinWorkspaceMessages.joinWorkspace,
                firstName: onboardingPersonalDetails?.firstName ?? '',
                lastName: onboardingPersonalDetails?.lastName ?? '',
                companySize: onboardingCompanySize,
                introSelected,
                isSelfTourViewed,
                conciergeChat,
                companyDomain: session?.email ? getEmailDomain(session.email) : '',
                workEmail: session?.email ?? '',
                currentUserAccountID,
                delegateAccountID,
            });
            setOnboardingAdminsChatReportID();

            navigateAfterOnboardingWithMicrotaskQueue(isSmallScreenWidth, isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS), conciergeReportID, reportNameValuePairs, undefined, undefined, false);
            return;
        }

        if (isVsb || isSmb) {
            Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(route.params?.backTo));
            return;
        }
        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
    };

    const retryAccessiblePoliciesLookup = () => {
        clearGetAccessiblePoliciesErrors();
        hasRequestedAccessiblePolicies.current = true;
        accessiblePoliciesRequestID.current = getAccessiblePolicies();
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldShowOfflineIndicator={isSmallScreenWidth}
        >
            <OnboardingHeader
                shouldShowBackButton={!isConciergeTaskFlow && !shouldHideBackButton}
                onBackButtonPress={() => Navigation.goBack()}
                shouldShowCloseButton={isConciergeTaskFlow}
                onCloseButtonPress={closeJoinWorkspaceTask}
            />
            <SelectionList
                data={policyIDItems}
                onSelectRow={() => {}}
                ListItem={BareUserListItem}
                style={{
                    listItemWrapperStyle: onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8, styles.cursorDefault] : [],
                }}
                shouldShowLoadingPlaceholder={isLoadingJoinablePolicies || !!joinablePoliciesLoading || policyIDItems.length === 0}
                shouldStopPropagation
                showScrollIndicator
                customListHeader={
                    <View style={[wrapperPadding, onboardingIsMediumOrLargerScreenWidth && styles.mt5, styles.mb5]}>
                        <Text
                            style={styles.textHeadlineH1}
                            accessibilityRole={CONST.ROLE.HEADER}
                        >
                            {translate('onboarding.joinAWorkspace')}
                        </Text>
                        <Text style={[styles.textSupporting, styles.mt3]}>{translate('onboarding.listOfWorkspaces')}</Text>
                    </View>
                }
                listFooterContent={
                    hasMoreThanLimit && !showAll ? (
                        <View style={[wrapperPadding, styles.alignItemsStart]}>
                            <LinkButton
                                onPress={() => setShowAll(true)}
                                innerStyles={styles.ph0}
                            >
                                <LinkButton.Text style={styles.fontSizeNormal}>{translate('common.showMore')}</LinkButton.Text>
                                <LinkButton.Icon
                                    src={icons.DownArrow}
                                    fill={theme.link}
                                    hoverFill={theme.linkHover}
                                />
                            </LinkButton>
                        </View>
                    ) : null
                }
                footerContent={
                    <>
                        {joinablePoliciesErrors ? (
                            <Button
                                size={CONST.BUTTON_SIZE.LARGE}
                                onPress={retryAccessiblePoliciesLookup}
                                style={[styles.mt5]}
                            >
                                <Button.Text>{translate('common.tryAgain')}</Button.Text>
                            </Button>
                        ) : null}
                        <Button
                            size={CONST.BUTTON_SIZE.LARGE}
                            testID="onboardingWorkSpaceSkipButton"
                            onPress={skipJoiningWorkspaces}
                            style={[styles.mt5]}
                            sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.SKIP}
                        >
                            <Button.Text>{translate('onboarding.skipForNow')}</Button.Text>
                        </Button>
                    </>
                }
            />
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkspaces;
