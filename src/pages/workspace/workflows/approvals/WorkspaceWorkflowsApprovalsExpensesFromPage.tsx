import type {StackScreenProps} from '@react-navigation/stack';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SectionListData} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import Badge from '@components/Badge';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {FallbackAvatar} from '@components/Icon/Expensicons';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import InviteMemberListItem from '@components/SelectionList/InviteMemberListItem';
import type {Section} from '@components/SelectionList/types';
import Text from '@components/Text';
import useDebouncedState from '@hooks/useDebouncedState';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as DeviceCapabilities from '@libs/DeviceCapabilities';
import Navigation from '@libs/Navigation/Navigation';
import type {FullScreenNavigatorParamList} from '@libs/Navigation/types';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import variables from '@styles/variables';
import * as Workflow from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {Member} from '@src/types/onyx/ApprovalWorkflow';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type SelectionListMember = {
    text: string;
    alternateText: string;
    keyForList: string;
    isSelected: boolean;
    login: string;
    rightElement?: React.ReactNode;
    icons?: Icon[];
};

type MembersSection = SectionListData<SelectionListMember, Section<SelectionListMember>>;

type WorkspaceWorkflowsApprovalsExpensesFromPageProps = WithPolicyAndFullscreenLoadingProps &
    StackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_EXPENSES_FROM>;

function WorkspaceWorkflowsApprovalsExpensesFromPage({policy, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsExpensesFromPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [selectedMembers, setSelectedMembers] = useState<SelectionListMember[]>([]);

    // eslint-disable-next-line rulesdir/no-negated-variables
    const shouldShowNotFoundView = (isEmptyObject(policy) && !isLoadingReportData) || !PolicyUtils.isPolicyAdmin(policy) || PolicyUtils.isPendingDeletePolicy(policy);
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !route.params.backTo;
    const shouldShowListEmptyContent = approvalWorkflow && approvalWorkflow.availableMembers.length === 0;

    useEffect(() => {
        if (!approvalWorkflow?.members) {
            return;
        }

        setSelectedMembers(
            approvalWorkflow.members.map((member) => {
                const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');
                const isAdmin = policy?.employeeList?.[member.email]?.role === CONST.REPORT.ROLE.ADMIN;

                return {
                    text: member.displayName,
                    alternateText: member.email,
                    keyForList: member.email,
                    isSelected: true,
                    login: member.email,
                    icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: member.displayName, id: accountID}],
                    rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                };
            }),
        );
    }, [approvalWorkflow?.members, policy?.employeeList, translate]);

    const sections: MembersSection[] = useMemo(() => {
        const members: SelectionListMember[] = [...selectedMembers];

        if (approvalWorkflow?.availableMembers) {
            const availableMembers = approvalWorkflow.availableMembers
                .map((member) => {
                    const isAdmin = policy?.employeeList?.[member.email]?.role === CONST.REPORT.ROLE.ADMIN;
                    const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(policy?.employeeList);
                    const accountID = Number(policyMemberEmailsToAccountIDs[member.email] ?? '');

                    return {
                        text: member.displayName,
                        alternateText: member.email,
                        keyForList: member.email,
                        isSelected: false,
                        login: member.email,
                        icons: [{source: member.avatar ?? FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: member.displayName, id: accountID}],
                        rightElement: isAdmin ? <Badge text={translate('common.admin')} /> : undefined,
                    };
                })
                .filter((member) => !selectedMembers.some((selectedOption) => selectedOption.login === member.login));

            members.push(...availableMembers);
        }

        const filteredMembers =
            debouncedSearchTerm !== ''
                ? members.filter((option) => {
                      const searchValue = OptionsListUtils.getSearchValueForPhoneOrEmail(debouncedSearchTerm);
                      const isPartOfSearchTerm = !!option.text?.toLowerCase().includes(searchValue) || !!option.login?.toLowerCase().includes(searchValue);
                      return isPartOfSearchTerm;
                  })
                : members;

        return [
            {
                title: undefined,
                data: OptionsListUtils.sortAlphabetically(filteredMembers, 'text'),
                shouldShow: true,
            },
        ];
    }, [approvalWorkflow?.availableMembers, debouncedSearchTerm, policy?.employeeList, selectedMembers, translate]);

    const nextStep = useCallback(() => {
        const members: Member[] = selectedMembers.map((member) => ({displayName: member.text, avatar: member.icons?.[0]?.source, email: member.login}));
        Workflow.setApprovalWorkflowMembers(members);

        if (route.params.backTo) {
            Navigation.navigate(route.params.backTo);
            return;
        }

        if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE) {
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(route.params.policyID, 0));
        } else {
            const firstApprover = approvalWorkflow?.approvers?.[0]?.email ?? '';
            Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover));
        }
    }, [approvalWorkflow, route.params.backTo, route.params.policyID, selectedMembers]);

    const goBack = useCallback(() => {
        if (isInitialCreationFlow) {
            Workflow.clearApprovalWorkflow();
        }
        Navigation.goBack();
    }, [isInitialCreationFlow]);

    const button = useMemo(() => {
        let buttonText = isInitialCreationFlow ? translate('common.next') : translate('common.save');

        if (shouldShowListEmptyContent) {
            buttonText = translate('common.buttonConfirm');
        }

        return (
            <FormAlertWithSubmitButton
                isDisabled={!shouldShowListEmptyContent && !selectedMembers.length}
                buttonText={buttonText}
                onSubmit={shouldShowListEmptyContent ? () => Navigation.goBack() : nextStep}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        );
    }, [isInitialCreationFlow, nextStep, selectedMembers.length, shouldShowListEmptyContent, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);

    const toggleMember = (member: SelectionListMember) => {
        const isAlreadySelected = selectedMembers.some((selectedOption) => selectedOption.login === member.login);
        setSelectedMembers(isAlreadySelected ? selectedMembers.filter((selectedOption) => selectedOption.login !== member.login) : [...selectedMembers, {...member, isSelected: true}]);
    };

    const headerMessage = useMemo(() => (searchTerm && !sections[0].data.length ? translate('common.noResultsFound') : ''), [searchTerm, sections, translate]);

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TurtleInShell}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workflowsPage.emptyContent.title')}
                subtitle={translate('workflowsPage.emptyContent.expensesFromSubtitle')}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
            />
        ),
        [translate, styles.textSupporting, styles.pb10],
    );

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ScreenWrapper
                includeSafeAreaPaddingBottom={false}
                testID={WorkspaceWorkflowsApprovalsExpensesFromPage.displayName}
            >
                <FullPageNotFoundView
                    shouldShow={shouldShowNotFoundView}
                    subtitleKey={isEmptyObject(policy) ? undefined : 'workspace.common.notAuthorized'}
                    onBackButtonPress={PolicyUtils.goBackFromInvalidPolicy}
                    onLinkPress={PolicyUtils.goBackFromInvalidPolicy}
                >
                    <HeaderWithBackButton
                        title={translate('workflowsExpensesFromPage.title')}
                        onBackButtonPress={goBack}
                    />

                    {approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !shouldShowListEmptyContent && (
                        <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsExpensesFromPage.header')}</Text>
                    )}
                    <SelectionList
                        canSelectMultiple
                        sections={sections}
                        ListItem={InviteMemberListItem}
                        textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        onSelectRow={toggleMember}
                        showScrollIndicator
                        shouldPreventDefaultFocusOnSelectRow={!DeviceCapabilities.canUseTouchScreen()}
                        footerContent={button}
                        listEmptyContent={listEmptyContent}
                        shouldShowListEmptyContent={shouldShowListEmptyContent}
                    />
                </FullPageNotFoundView>
            </ScreenWrapper>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsApprovalsExpensesFromPage.displayName = 'WorkspaceWorkflowsApprovalsExpensesFromPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsExpensesFromPage);
