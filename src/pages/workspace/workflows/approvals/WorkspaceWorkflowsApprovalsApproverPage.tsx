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
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
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
import type {Icon} from '@src/types/onyx/OnyxCommon';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type WorkspaceWorkflowsApprovalsApproverPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<FullScreenNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER>;

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

function WorkspaceWorkflowsApprovalsApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [searchTerm, debouncedSearchTerm, setSearchTerm] = useDebouncedState('');
    const [approvalWorkflow] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
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

    const employeeList = policy?.employeeList;
    const approversFromWorkflow = approvalWorkflow?.approvers;
    const isDefault = approvalWorkflow?.isDefault;
    const sections: ApproverSection[] = useMemo(() => {
        const approvers: SelectionListApprover[] = [];

        if (employeeList) {
            const availableApprovers = Object.values(employeeList)
                .map((employee): SelectionListApprover | null => {
                    const isAdmin = employee?.role === CONST.REPORT.ROLE.ADMIN;
                    const email = employee.email;

                    if (!email) {
                        return null;
                    }

                    // Do not allow the same email to be added twice
                    const isEmailAlreadyInApprovers = approversFromWorkflow?.some((approver, index) => approver?.email === email && index !== approverIndex);
                    if (isEmailAlreadyInApprovers && selectedApproverEmail !== email) {
                        return null;
                    }

                    // Do not allow the default approver to be added as the first approver
                    if (!isDefault && approverIndex === 0 && defaultApprover === email) {
                        return null;
                    }

                    const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(employeeList);
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

        const data = OptionsListUtils.sortAlphabetically(filteredApprovers, 'text');
        return [
            {
                title: undefined,
                data,
                shouldShow: true,
            },
        ];
    }, [approversFromWorkflow, isDefault, approverIndex, debouncedSearchTerm, defaultApprover, personalDetails, employeeList, selectedApproverEmail, translate]);

    const shouldShowListEmptyContent = !debouncedSearchTerm && approvalWorkflow && !sections[0].data.length;

    const nextStep = useCallback(() => {
        if (selectedApproverEmail) {
            const policyMemberEmailsToAccountIDs = PolicyUtils.getMemberAccountIDsForWorkspace(employeeList);
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
    }, [approvalWorkflow, approverIndex, personalDetails, employeeList, route.params.policyID, selectedApproverEmail]);

    const button = useMemo(() => {
        let buttonText = isInitialCreationFlow ? translate('common.next') : translate('common.save');

        if (shouldShowListEmptyContent) {
            buttonText = translate('common.buttonConfirm');
        }

        return (
            <FormAlertWithSubmitButton
                isDisabled={!shouldShowListEmptyContent && !selectedApproverEmail && isInitialCreationFlow}
                buttonText={buttonText}
                onSubmit={nextStep}
                containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]}
                enabledWhenOffline
            />
        );
    }, [isInitialCreationFlow, nextStep, selectedApproverEmail, shouldShowListEmptyContent, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);

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

    const listEmptyContent = useMemo(
        () => (
            <BlockingView
                icon={Illustrations.TurtleInShell}
                iconWidth={variables.emptyListIconWidth}
                iconHeight={variables.emptyListIconHeight}
                title={translate('workflowsPage.emptyContent.title')}
                subtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
                subtitleStyle={styles.textSupporting}
                containerStyle={styles.pb10}
                contentFitImage="contain"
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
                testID={WorkspaceWorkflowsApprovalsApproverPage.displayName}
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
                    {approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && !shouldShowListEmptyContent && (
                        <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApproverPage.header')}</Text>
                    )}
                    <SelectionList
                        sections={sections}
                        ListItem={InviteMemberListItem}
                        textInputLabel={shouldShowListEmptyContent ? undefined : translate('selectionList.findMember')}
                        textInputValue={searchTerm}
                        onChangeText={setSearchTerm}
                        headerMessage={headerMessage}
                        onSelectRow={toggleApprover}
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

WorkspaceWorkflowsApprovalsApproverPage.displayName = 'WorkspaceWorkflowsApprovalsApproverPage';

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApproverPage);
