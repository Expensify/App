import React, {useCallback, useEffect, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Expensicons from '@components/Icon/Expensicons';
import OfflineIndicator from '@components/OfflineIndicator';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import * as MemberAction from '@userActions/Policy/Member';
import * as Report from '@userActions/Report';
import * as Welcome from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {BaseOnboardingWorkspacesProps} from './types';

function BaseOnboardingWorkspaces({shouldUseNativeStyles, route}: BaseOnboardingWorkspacesProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth, shouldUseNarrowLayout} = useResponsiveLayout();
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const [joinablePoliciesLoading] = useOnyx(ONYXKEYS.JOINABLE_POLICIES_LOADING);

    const [onboardingPersonalDetails] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM);

    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);

    const isValidated = UserUtils.isCurrentUserValidated(loginList);

    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const handleJoinWorkspace = useCallback(
        (policyID: string) => {
            MemberAction.joinAccessiblePolicy(policyID);
            Report.completeOnboarding(
                CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                CONST.ONBOARDING_MESSAGES[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
                onboardingPersonalDetails?.firstName ?? '',
                onboardingPersonalDetails?.lastName ?? '',
            );
            Welcome.setOnboardingAdminsChatReportID();
            Welcome.setOnboardingPolicyID(policyID);

            navigateAfterOnboarding(isSmallScreenWidth, shouldUseNarrowLayout, canUseDefaultRooms, policyID, activeWorkspaceID, route.params?.backTo);
        },
        [onboardingPersonalDetails?.firstName, onboardingPersonalDetails?.lastName, isSmallScreenWidth, shouldUseNarrowLayout, canUseDefaultRooms, activeWorkspaceID, route.params?.backTo],
    );
    const policyIDItems = useMemo(() => {
        return Object.values(joinablePolicies ?? {}).map((policyInfo) => {
            return {
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
                            handleJoinWorkspace(policyInfo.policyID);
                        }}
                    />
                ),
                icons: [
                    {
                        id: policyInfo.policyID,
                        source: ReportUtils.getDefaultWorkspaceAvatar(policyInfo.policyName),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policyInfo.policyName,
                        type: CONST.ICON_TYPE_WORKSPACE,
                    },
                ],
            };
        });
    }, [translate, isOffline, joinablePolicies, handleJoinWorkspace]);

    const wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;

    useEffect(() => {
        if (joinablePoliciesLoading === true || joinablePoliciesLoading === undefined || !joinablePolicies || Object.keys(joinablePolicies).length > 0) {
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
    }, [joinablePoliciesLoading, joinablePolicies, route.params?.backTo]);

    const handleBackButtonPress = useCallback(() => {
        if (isValidated) {
            Navigation.navigate(ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute());
            return;
        }
        Navigation.goBack();
    }, [isValidated]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={60}
                onBackButtonPress={handleBackButtonPress}
            />
            <View style={[styles.flex1, styles.mb5, styles.mt8]}>
                <View style={[wrapperPadding, styles.mb5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.joinAWorkspace')}</Text>
                    <Text style={[styles.textSupporting, styles.mt3]}>{translate('onboarding.listOfWorkspaces')}</Text>
                </View>

                <SelectionList
                    sections={[{data: policyIDItems}]}
                    onSelectRow={() => {}}
                    ListItem={UserListItem}
                    listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8, styles.cursorDefault] : []}
                    showLoadingPlaceholder={joinablePoliciesLoading}
                />

                <View style={[styles.flex1, styles.justifyContentEnd, wrapperPadding]}>
                    <Button
                        isDisabled={isOffline}
                        success={false}
                        large
                        style={[styles.mb5]}
                        text={translate('common.skip')}
                        onPress={() => {
                            Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
                        }}
                    />
                </View>
            </View>
            {isSmallScreenWidth && <OfflineIndicator />}
        </ScreenWrapper>
    );
}

BaseOnboardingWorkspaces.displayName = 'BaseOnboardingWorkspaces';

export default BaseOnboardingWorkspaces;
