import {useFocusEffect} from '@react-navigation/native';
import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/ListItem/UserListItem';
import Text from '@components/Text';
import useArchivedReportsIdSet from '@hooks/useArchivedReportsIdSet';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnboardingMessages from '@hooks/useOnboardingMessages';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {navigateAfterOnboardingWithMicrotaskQueue} from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {isCurrentUserValidated} from '@libs/UserUtils';
import {askToJoinPolicy, joinAccessiblePolicy} from '@userActions/Policy/Member';
import {getAccessiblePolicies} from '@userActions/Policy/Policy';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {JoinablePolicy} from '@src/types/onyx/JoinablePolicies';
import type {BaseOnboardingWorkspacesProps} from './types';

function BaseOnboardingWorkspaces({route, shouldUseNativeStyles}: BaseOnboardingWorkspacesProps) {
    const icons = useMemoizedLazyExpensifyIcons(['FallbackWorkspaceAvatar']);
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {onboardingMessages} = useOnboardingMessages();

    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES);

    const joinablePoliciesLoading = getAccessiblePoliciesAction?.loading;
    const joinablePoliciesLength = Object.keys(joinablePolicies ?? {}).length;

    const [onboardingPersonalDetails] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);
    const [onboardingCompanySize] = useOnyx(ONYXKEYS.ONBOARDING_COMPANY_SIZE);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [session] = useOnyx(ONYXKEYS.SESSION);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const archivedReportsIdSet = useArchivedReportsIdSet();

    const isValidated = isCurrentUserValidated(loginList, session?.email);

    const {isBetaEnabled} = usePermissions();
    const [conciergeReportID = ''] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);

    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const isVsb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.VSB;
    const isSmb = onboardingValues?.signupQualifier === CONST.ONBOARDING_SIGNUP_QUALIFIERS.SMB;

    const handleJoinWorkspace = (policy: JoinablePolicy) => {
        if (policy.automaticJoiningEnabled) {
            joinAccessiblePolicy(policy.policyID);
        } else {
            askToJoinPolicy(policy.policyID);
        }
        completeOnboarding({
            engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
            onboardingMessage: onboardingMessages[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
            firstName: onboardingPersonalDetails?.firstName ?? '',
            lastName: onboardingPersonalDetails?.lastName ?? '',
            shouldSkipTestDriveModal: !!(policy.automaticJoiningEnabled ? policy.policyID : undefined),
            companySize: onboardingCompanySize,
            introSelected,
        });
        setOnboardingAdminsChatReportID();
        setOnboardingPolicyID(policy.policyID);

        navigateAfterOnboardingWithMicrotaskQueue(
            isSmallScreenWidth,
            isBetaEnabled(CONST.BETAS.DEFAULT_ROOMS),
            conciergeReportID,
            archivedReportsIdSet,
            policy.automaticJoiningEnabled ? policy.policyID : undefined,
            undefined,
            false,
        );
    };

    const policyIDItems = Object.values(joinablePolicies ?? {}).map((policyInfo) => ({
        text: policyInfo.policyName,
        alternateText: translate('onboarding.workspaceMemberList', {employeeCount: policyInfo.employeeCount, policyOwner: policyInfo.policyOwner}),
        keyForList: policyInfo.policyID,
        isDisabled: true,
        rightElement: (
            <Button
                isDisabled={isOffline}
                success
                medium
                text={policyInfo.automaticJoiningEnabled ? translate('workspace.workspaceList.joinNow') : translate('workspace.workspaceList.askToJoin')}
                onPress={() => {
                    handleJoinWorkspace(policyInfo);
                }}
                sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.JOIN_WORKSPACE}
            />
        ),
        icons: [
            {
                id: policyInfo.policyID,
                source: getDefaultWorkspaceAvatar(policyInfo.policyName),
                fallbackIcon: icons.FallbackWorkspaceAvatar,
                name: policyInfo.policyName,
                type: CONST.ICON_TYPE_WORKSPACE,
            },
        ],
    }));

    const wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;

    useFocusEffect(() => {
        if (!isValidated || joinablePoliciesLength > 0 || joinablePoliciesLoading) {
            return;
        }

        getAccessiblePolicies();
    });

    const skipJoiningWorkspaces = () => {
        if (isVsb) {
            Navigation.navigate(ROUTES.ONBOARDING_ACCOUNTING.getRoute(route.params?.backTo));
            return;
        }

        if (isSmb) {
            Navigation.navigate(ROUTES.ONBOARDING_EMPLOYEES.getRoute(route.params?.backTo));
            return;
        }
        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
            shouldShowOfflineIndicator={isSmallScreenWidth}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={60}
                onBackButtonPress={() => Navigation.goBack()}
                shouldDisplayHelpButton={false}
            />
            <SelectionList
                data={policyIDItems}
                onSelectRow={() => {}}
                ListItem={UserListItem}
                style={{listItemWrapperStyle: onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8, styles.cursorDefault] : []}}
                showLoadingPlaceholder={joinablePoliciesLoading}
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
                footerContent={
                    <Button
                        success={false}
                        large
                        text={translate('common.skip')}
                        testID="onboardingWorkSpaceSkipButton"
                        onPress={skipJoiningWorkspaces}
                        style={[styles.mt5]}
                        sentryLabel={CONST.SENTRY_LABEL.ONBOARDING.SKIP}
                    />
                }
            />
        </ScreenWrapper>
    );
}

export default BaseOnboardingWorkspaces;
