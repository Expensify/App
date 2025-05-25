import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import useActiveWorkspace from '@hooks/useActiveWorkspace';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import navigateAfterOnboarding from '@libs/navigateAfterOnboarding';
import {getDefaultWorkspaceAvatar} from '@libs/ReportUtils';
import {askToJoinPolicy, joinAccessiblePolicy} from '@userActions/Policy/Member';
import {completeOnboarding} from '@userActions/Report';
import {setOnboardingAdminsChatReportID, setOnboardingPolicyID} from '@userActions/Welcome';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {JoinablePolicy} from '@src/types/onyx/JoinablePolicies';
import Button from './Button';
import * as Expensicons from './Icon/Expensicons';
import SelectionList from './SelectionList';
import UserListItem from './SelectionList/UserListItem';
import Text from './Text';

type PrivateDomainWorkspacesListProps = {
    /** Content to display in the footer of the list */
    footerContent?: React.ReactNode;
};

function PrivateDomainWorkspacesList({footerContent}: PrivateDomainWorkspacesListProps) {
    const {isOffline} = useNetwork();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth} = useResponsiveLayout();
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES, {canBeMissing: true});
    const [getAccessiblePoliciesAction] = useOnyx(ONYXKEYS.VALIDATE_USER_AND_GET_ACCESSIBLE_POLICIES, {canBeMissing: true});

    const joinablePoliciesLoading = getAccessiblePoliciesAction?.loading;

    const [onboardingPersonalDetails] = useOnyx(ONYXKEYS.FORMS.ONBOARDING_PERSONAL_DETAILS_FORM, {canBeMissing: true});

    const {canUseDefaultRooms} = usePermissions();
    const {activeWorkspaceID} = useActiveWorkspace();

    const handleJoinWorkspace = useCallback(
        (policy: JoinablePolicy) => {
            if (policy.automaticJoiningEnabled) {
                joinAccessiblePolicy(policy.policyID);
            } else {
                askToJoinPolicy(policy.policyID);
            }
            completeOnboarding({
                engagementChoice: CONST.ONBOARDING_CHOICES.LOOKING_AROUND,
                onboardingMessage: CONST.ONBOARDING_MESSAGES[CONST.ONBOARDING_CHOICES.LOOKING_AROUND],
                firstName: onboardingPersonalDetails?.firstName ?? '',
                lastName: onboardingPersonalDetails?.lastName ?? '',
            });
            setOnboardingAdminsChatReportID();
            setOnboardingPolicyID(policy.policyID);

            navigateAfterOnboarding(isSmallScreenWidth, canUseDefaultRooms, policy.automaticJoiningEnabled ? policy.policyID : undefined, activeWorkspaceID);
        },
        [onboardingPersonalDetails?.firstName, onboardingPersonalDetails?.lastName, isSmallScreenWidth, canUseDefaultRooms, activeWorkspaceID],
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
                            handleJoinWorkspace(policyInfo);
                        }}
                    />
                ),
                icons: [
                    {
                        id: policyInfo.policyID,
                        source: getDefaultWorkspaceAvatar(policyInfo.policyName),
                        fallbackIcon: Expensicons.FallbackWorkspaceAvatar,
                        name: policyInfo.policyName,
                        type: CONST.ICON_TYPE_WORKSPACE,
                    },
                ],
            };
        });
    }, [translate, isOffline, joinablePolicies, handleJoinWorkspace]);

    const wrapperPadding = onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5;

    return (
        <SelectionList
            sections={[{data: policyIDItems}]}
            onSelectRow={() => {}}
            ListItem={UserListItem}
            listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8, styles.cursorDefault] : []}
            showLoadingPlaceholder={joinablePoliciesLoading}
            shouldStopPropagation
            showScrollIndicator
            headerContent={
                <View style={[wrapperPadding, onboardingIsMediumOrLargerScreenWidth && styles.mt5, styles.mb5]}>
                    <Text style={styles.textHeadlineH1}>{translate('onboarding.joinAWorkspace')}</Text>
                    <Text style={[styles.textSupporting, styles.mt3]}>{translate('onboarding.listOfWorkspaces')}</Text>
                </View>
            }
            footerContent={footerContent}
        />
    );
}

PrivateDomainWorkspacesList.displayName = 'PrivateDomainWorkspacesList';

export default PrivateDomainWorkspacesList;
