import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import type {ListItem, Section} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import type SCREENS from '@src/SCREENS';
import type {PersonalDetailsList, PolicyEmployee} from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsApproverPageOnyxProps = {
    /** All of the personal details for everyone */
    personalDetails: OnyxEntry<PersonalDetailsList>;
};

type WorkspaceWorkflowsApproverPageProps = WorkspaceWorkflowsApproverPageOnyxProps &
    WithPolicyAndFullscreenLoadingProps &
    StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVER>;
type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = SectionListData<MemberOption, Section<MemberOption>>;

function WorkspaceWorkflowsApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApproverPageProps) {
    const {translate} = useLocalize();
    const policyName = policy?.name ?? '';
    const [searchTerm, setSearchTerm] = useState('');
    const {isOffline} = useNetwork();

    const isDeletedPolicyEmployee = useCallback(
        (policyEmployee: PolicyEmployee) => !isOffline && policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE && isEmptyObject(policyEmployee.errors),
        [isOffline],
    );

    const [formattedPolicyEmployeeList, formattedApprover] = useMemo(() => {
        const policyMemberDetails: MemberOption[] = [];
        const approverDetails: MemberOption[] = [];

        const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList);

        Object.entries(policy?.employeeList ?? {}).forEach(([email, policyEmployee]) => {
            if (isDeletedPolicyEmployee(policyEmployee)) {
                return;
            }

            const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');

            const details = personalDetails?.[accountID];
            if (!details) {
                Log.hmmm(`[WorkspaceMembersPage] no personal details found for policy member with accountID: ${accountID}`);
                return;
            }
            const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(searchTerm);
            if (searchValue.trim() && !OptionsListUtils.isSearchStringMatchUserDetails(details, searchValue)) {
                return;
            }

            const isOwner = policy?.owner === details.login;
            const isAdmin = policyEmployee.role === CONST.POLICY.ROLE.ADMIN;

            let roleBadge = null;
            if (isOwner || isAdmin) {
                roleBadge = <Badge text={isOwner ? translate('common.owner') : translate('common.admin')} />;
            }

            const formattedMember = {
                keyForList: String(accountID),
                accountID,
                isSelected: policy?.approver === details.login,
                isDisabled: policyEmployee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || !isEmptyObject(policyEmployee.errors),
                text: formatPhoneNumber(PersonalDetailsUtils.getDisplayNameOrDefault(details)),
                alternateText: formatPhoneNumber(details?.login ?? ''),
                rightElement: roleBadge,
                icons: [
                    {
                        source: details.avatar ?? FallbackAvatar,
                        name: formatPhoneNumber(details?.login ?? ''),
                        type: CONST.ICON_TYPE_AVATAR,
                        id: accountID,
                    },
                ],
                errors: policyEmployee.errors,
                pendingAction: policyEmployee.pendingAction,
            };

            if (policy?.approver === details.login) {
                approverDetails.push(formattedMember);
            } else {
                policyMemberDetails.push(formattedMember);
            }
        });
        return [policyMemberDetails, approverDetails];
    }, [policy?.employeeList, policy?.owner, policy?.approver, isDeletedPolicyEmployee, personalDetails, searchTerm, translate]);

    const sections: MembersSection[] = useMemo(() => {
        const sectionsArray: MembersSection[] = [];

        if (searchTerm !== '') {
            return [
                {
                    title: undefined,
                    data: [...formattedApprover, ...formattedPolicyEmployeeList],
                    shouldShow: true,
                },
            ];
        }

        sectionsArray.push({
            title: undefined,
            data: formattedApprover,
            shouldShow: formattedApprover.length > 0,
        });

        sectionsArray.push({
            title: translate('common.all'),
            data: formattedPolicyEmployeeList,
            shouldShow: true,
        });

        return sectionsArray;
    }, [formattedPolicyEmployeeList, formattedApprover, searchTerm, translate]);

    const headerMessage = useMemo(
        () => (searchTerm && !sections[0].data.length ? translate('common.noResultsFound') : ''),

        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
        [translate, sections],
    );

    const setPolicyApprover = (member: MemberOption) => {
        if (!policy?.approvalMode || !personalDetails?.[member.accountID]?.login) {
            return;
        }
        const approver: string = personalDetails?.[member.accountID]?.login ?? policy.approver ?? policy.owner;
        Policy.setWorkspaceApprovalMode(policy.id, approver, policy.approvalMode);
        Navigation.goBack();
    };

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApproverPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={(isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy)}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.approver')}
                        subtitle={policyName}
                        onBackButtonPress={Navigation.goBack}
                    />
                    <SelectionList
                        sections={sections}
                        textInputLabel={translate('selectionList.findMember')}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        ListItem={UserListItem}
                        onSelectRow={setPolicyApprover}
                        shouldDebounceRowSelect
                        showScrollIndicator
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApproverPage.displayName = 'WorkspaceWorkflowsApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApproverPage);
