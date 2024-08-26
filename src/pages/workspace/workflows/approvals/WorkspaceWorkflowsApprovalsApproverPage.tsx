import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx, withOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {ListItem, Section} from '@components/SelectionList/types';
import UserListItem from '@components/SelectionList/UserListItem';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import Permissions from '@libs/Permissions';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import * as Policy from '@userActions/Policy/Policy';
import * as Workflow from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Beta, PolicyEmployee} from '@src/types/onyx';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsApprovalsApproverPageOnyxProps = {
    /** Beta features list */
    // eslint-disable-next-line react/no-unused-prop-types -- This prop is used in the component
    betas: OnyxEntry<Beta[]>;
};

type WorkspaceWorkflowsApprovalsApproverPageProps = WorkspaceWorkflowsApprovalsApproverPageOnyxProps &
    WithPolicyAndFullscreenLoadingProps &
    StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER>;

type SelectionListApprover = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    login: string;
    rightElement?: React.ReactNode;
    icons: Icon[];
};
type ApproverSection = SectionListData<SelectionListApprover, Section<SelectionListApprover>>;

function WorkspaceWorkflowsApprovalsApproverPageWrapper(props: WorkspaceWorkflowsApprovalsApproverPageProps) {
    if (Permissions.canUseWorkflowsAdvancedApproval(props.betas) && props.route.params.approverIndex !== undefined) {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <WorkspaceWorkflowsApprovalsApproverPageBeta {...props} />;
    }

    // eslint-disable-next-line react/jsx-props-no-spreading
    return <WorkspaceWorkflowsApprovalsApproverPage {...props} />;
}

function WorkspaceWorkflowsApprovalsApproverPageBeta({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [didScreenTransitionEnd, setDidScreenTransitionEnd] = useState(false);
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [selectedApproverEmail, setSelectedApproverEmail] = useState<string | undefined>(undefined);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);
    const approverIndex = Number(route.params.approverIndex) ?? 0;
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const defaultApprover = policy?.approver ?? policy?.owner;

    useEffect(() => {
        const currentApprover = approvalWorkflow?.approvers[approverIndex];
        if (!currentApprover) {
            return;
        }

        setSelectedApproverEmail(currentApprover.email);
    }, [approvalWorkflow?.approvers, approverIndex]);

    const sections: ApproverSection[] = useMemo(() => {
        const approvers: SelectionListApprover[] = [];

        if (policy?.employeeList) {
            const availableApprovers = Object.values(policy.employeeList)
                .map((employee): SelectionListApprover | null => {
                    const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                    const email = employee.email;

                    if (!email) {
                        return null;
                    }

                    // Do not allow the same email to be added twice
                    const isEmailAlreadyInApprovers = approvalWorkflow?.approvers.some((approver, index) => approver?.email === email && index !== approverIndex);
                    if (isEmailAlreadyInApprovers && selectedApproverEmail !== email) {
                        return null;
                    }

                    // Do not allow the default approver to be added as the first approver
                    if (!approvalWorkflow?.isDefault && approverIndex === 0 && defaultApprover === email) {
                        return null;
                    }

                    const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList);
                    const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');
                    const {avatar, displayName = email} = personalDetails?.[accountID] ?? {};

                    return {
                        text: displayName,
                        alternateText: email,
                        keyForList: email,
                        isSelected: selectedApproverEmail === email,
                        login: email,
                        icons: [{source: avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                        rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                    };
                })
                .filter((approver): approver is SelectionListApprover => !!approver);

            approvers.push(...availableApprovers);
        }

        const filteredApprovers =
            debouncedSearchTerm !== ''
                ? approvers.filter((option) => {
                      const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(debouncedSearchTerm);
                      const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                      return isPartOfSearchTerm;
                  })
                : approvers;

        return [
            {
                title: undefined,
                data: OptionsListUtils.sortAlphabetically(filteredApprovers, 'text'),
                shouldShow: true,
            },
        ];
    }, [
        approvalWorkflow?.approvers,
        approvalWorkflow?.isDefault,
        approverIndex,
        debouncedSearchTerm,
        defaultApprover,
        personalDetails,
        policy?.employeeList,
        selectedApproverEmail,
        translate,
    ]);

    const nextStep = useCallback(() => {
        if (selectedApproverEmail) {
            const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList);
            const accountID = Number(policyMemberEmailsToAccountIDs[selectedApproverEmail] ?? '');
            const {avatar, displayName = selectedApproverEmail} = personalDetails?.[accountID] ?? {};
            Workflow.setApprovalWorkflowApprover(
                {
                    email: selectedApproverEmail,
                    avatar,
                    displayName,
                },
                approverIndex,
                route.params.policyID,
            );
        } else {
            Workflow.clearApprovalWorkflowApprover(approverIndex);
        }

        if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID));
        } else {
            const firstApprover = approvalWorkflow?.approvers?.[0]?.email ?? '';
            Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover));
        }
    }, [approvalWorkflow, approverIndex, personalDetails, policy?.employeeList, route.params.policyID, selectedApproverEmail]);

    const nextButton = useMemo(
        () => (
            <FormAlertWithSubmitButton
                isDisabled={!selectedApproverEmail && isInitialCreationFlow}
                buttonText={isInitialCreationFlow ? translate('common.next') : translate('common.save')}
                onSubmit={nextStep}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        ),
        [isInitialCreationFlow, nextStep, selectedApproverEmail, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate],
    );

    const goBack = useCallback(() => {
        if (isInitialCreationFlow) {
            Workflow.clearApprovalWorkflowApprovers();
        }
        Navigation.goBack();
    }, [isInitialCreationFlow]);

    const toggleApprover = (approver: SelectionListApprover) => {
        if (selectedApproverEmail === approver.login) {
            setSelectedApproverEmail(undefined);
            return;
        }
        setSelectedApproverEmail(approver.login);
    };

    const headerMessage = useMemo(() => (searchTerm && !sections[0].data.length ? translate('common.noResultsFound') : ''), [searchTerm, sections, translate]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApprovalsApproverPageWrapper.displayName}
                onEntryTransitionEnd={() => setDidScreenTransitionEnd(true)}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsPage.approver')}
                        onBackButtonPress={goBack}
                    />
                    {approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && (
                        <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApproverPage.header')}</Text>
                    )}
                    <SelectionList
                        sections={sections}
                        ListItem={InviteMemberListItem}
                        textInputLabel={translate('selectionList.findMember')}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        onSelectRow={toggleApprover}
                        showScrollIndicator
                        showLoadingPlaceholder={!didScreenTransitionEnd || approvalWorkflowMetadata.status === 'loading'}
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        footerContent={nextButton}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

type MemberOption = Omit<ListItem, 'accountID'> & {accountID: number};
type MembersSection = SectionListData<MemberOption, Section<MemberOption>>;

// TODO: Remove this component when workflowsAdvancedApproval beta is removed
function WorkspaceWorkflowsApprovalsApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApproverPageProps) {
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

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApprovalsApproverPageWrapper.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
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
                        shouldSingleExecuteRowSelect
                        showScrollIndicator
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsApproverPageWrapper.displayName = 'WorkspaceWorkflowsApprovalsApproverPage';

export default withPolicyAndFullscreenLoading(
    withOnyx<WorkspaceWorkflowsApprovalsApproverPageProps, WorkspaceWorkflowsApprovalsApproverPageOnyxProps>({
        betas: {
            key: ONYXKEYS.BETAS,
        },
    })(WorkspaceWorkflowsApprovalsApproverPageWrapper),
);
