import React from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import {setWorkspaceInviteApproverDraft} from '@libs/actions/Policy/Member';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {SettingsNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultApprover, getMemberAccountIDsForWorkspace} from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import MemberRightIcon from './MemberRightIcon';
import withPolicyAndFullscreenLoading from './withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from './withPolicyAndFullscreenLoading';

type WorkspaceInviteMessageApproverPageProps = WithPolicyAndFullscreenLoadingProps & PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.WORKSPACE.INVITE_MESSAGE_APPROVER>;

function WorkspaceInviteMessageApproverPage({policy, personalDetails, isLoadingReportData, route}: WorkspaceInviteMessageApproverPageProps) {
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar']);

    const policyID = route.params.policyID;

    const defaultApprover = getDefaultApprover(policy);
    const [approverDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_APPROVER_DRAFT}${policyID}`);
    const selectedApprover = approverDraft ?? defaultApprover;

    const [invitedEmailsToAccountIDsDraft] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT}${policyID}`);

    const invitedEmails = Object.keys(invitedEmailsToAccountIDsDraft ?? {});

    const employeeList = policy?.employeeList;
    const policyOwner = policy?.owner;
    const preventSelfApproval = policy?.preventSelfApproval;

    const backTo = route.params.backTo;

    const goBack = () => {
        Navigation.goBack(backTo);
    };

    const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);

    const allApprovers: SelectionListApprover[] = (() => {
        if (!employeeList) {
            return [];
        }

        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;

                if (!email) {
                    return null;
                }

                if (employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return null;
                }

                if (preventSelfApproval && invitedEmails.includes(email)) {
                    return null;
                }

                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');

                if (!accountID) {
                    return null;
                }

                const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: selectedApprover === email,
                    login: email,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={employee.role}
                            owner={policyOwner}
                            login={login}
                        />
                    ),
                };
            })
            .filter((approver): approver is SelectionListApprover => !!approver);
    })();

    const handleOnSelectApprover = (approvers: SelectionListApprover[]) => {
        const approver = approvers.at(0);
        if (!approver?.login) {
            return;
        }
        setWorkspaceInviteApproverDraft(policyID, approver.login);
        Navigation.setNavigationActionToMicrotaskQueue(() => {
            Navigation.goBack(backTo);
        });
    };

    return (
        <ApproverSelectionList
            testID="WorkspaceInviteMessageApproverPage"
            headerTitle={translate('workflowsPage.approver')}
            policy={policy}
            isLoadingReportData={isLoadingReportData}
            onBackButtonPress={goBack}
            initiallyFocusedOptionKey={selectedApprover}
            allApprovers={allApprovers}
            onSelectApprover={handleOnSelectApprover}
        />
    );
}

WorkspaceInviteMessageApproverPage.displayName = 'WorkspaceInviteMessageApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceInviteMessageApproverPage);
