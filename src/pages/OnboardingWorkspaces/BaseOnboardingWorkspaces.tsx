import React, {useEffect, useMemo, useState} from 'react';
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
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterJoinRequest from '@libs/navigateAfterJoinRequest';
import Navigation from '@libs/Navigation/Navigation';
import * as ReportUtils from '@libs/ReportUtils';
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
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, onboardingIsMediumOrLargerScreenWidth} = useResponsiveLayout();
    const [selectedPolicyID, setSelectedPolicyID] = useState<string | null | undefined>();
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const [joinablePoliciesLoading] = useOnyx(ONYXKEYS.JOINABLE_POLICIES_LOADING);

    const handleJoinWorkspace = (policyID: string, automaticJoiningEnabled: boolean) => {
        Report.completeOnboarding(CONST.ONBOARDING_CHOICES.LOOKING_AROUND, CONST.ONBOARDING_MESSAGES[CONST.ONBOARDING_CHOICES.LOOKING_AROUND], policyID);
        Welcome.setOnboardingAdminsChatReportID();
        Welcome.setOnboardingPolicyID(policyID);

        if (automaticJoiningEnabled) {
            MemberAction.addMemberToPrivateDomainWorkspace(policyID);
            navigateAfterJoinRequest();
        } else {
            Report.navigateToConciergeChat();
        }
    };

    const policyIDItems = useMemo(() => {
        return Object.values(joinablePolicies ?? {}).map((policyInfo) => {
            return {
                text: policyInfo.policyName,
                alternateText: translate('onboarding.workspaceMemberList', {employeeCount: policyInfo.employeeCount, policyOwner: policyInfo.policyOwner}),
                keyForList: policyInfo.policyID,
                isSelected: policyInfo.policyID === selectedPolicyID,
                rightElement: (
                    <Button
                        isDisabled={isOffline}
                        success
                        medium
                        text={policyInfo.automaticJoiningEnabled ? translate('workspace.workspaceList.joinNow') : translate('workspace.workspaceList.askToJoin')}
                        onPress={() => {
                            handleJoinWorkspace(policyInfo.policyID, policyInfo.automaticJoiningEnabled);
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
    }, [translate, selectedPolicyID, isOffline, joinablePolicies]);

    const wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;

    useEffect(() => {
        if (joinablePoliciesLoading === true || joinablePoliciesLoading === undefined || !joinablePolicies || Object.keys(joinablePolicies).length > 0) {
            return;
        }

        Navigation.navigate(ROUTES.ONBOARDING_PURPOSE.getRoute(route.params?.backTo));
    }, [joinablePoliciesLoading, joinablePolicies, route.params?.backTo]);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            testID="BaseOnboardingWorkspaces"
            style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]}
        >
            <HeaderWithBackButton
                shouldShowBackButton
                progressBarPercentage={80}
                onBackButtonPress={Navigation.goBack}
            />
            <View style={[styles.flex1, styles.mb5, styles.mt8]}>
                <View style={[wrapperPadding, styles.mb5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.joinAWorkspace')}</Text>
                    <Text style={[styles.textSupporting, styles.mt3]}>{translate('onboarding.listOfWorkspaces')}</Text>
                </View>

                <SelectionList
                    sections={[{data: policyIDItems}]}
                    onSelectRow={(item) => {
                        setSelectedPolicyID(item.keyForList);
                    }}
                    initiallyFocusedOptionKey={policyIDItems.find((item) => item.keyForList === selectedPolicyID)?.keyForList}
                    shouldUpdateFocusedIndex
                    ListItem={UserListItem}
                    listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []}
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
