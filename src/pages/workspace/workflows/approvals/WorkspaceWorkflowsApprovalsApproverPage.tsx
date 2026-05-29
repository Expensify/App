import {useNavigationState} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import type {SelectionListApprover} from '@components/ApproverSelectionList';
import ApproverSelectionList from '@components/ApproverSelectionList';
import MenuItem from '@components/MenuItem';
import Text from '@components/Text';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePersonalDetailsByEmail from '@hooks/usePersonalDetailsByEmail';
import useThemeStyles from '@hooks/useThemeStyles';
import {clearOptimisticAgentFromApprovalWorkflow} from '@libs/actions/Agent';
import {clearApprovalWorkflowApprover, clearApprovalWorkflowApprovers, setApprovalWorkflow, setApprovalWorkflowApprover} from '@libs/actions/Workflow';
import {isAnyHRReadOnlyWorkflowMode} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {WorkspaceSplitNavigatorParamList} from '@libs/Navigation/types';
import {getDefaultApprover, getMemberAccountIDsForWorkspace, isExpensifyTeam, shouldFilterExpensifyTeam} from '@libs/PolicyUtils';
import {isAgentEmail} from '@libs/SessionUtils';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import MemberRightIcon from '@pages/workspace/MemberRightIcon';
import withPolicyAndFullscreenLoading from '@pages/workspace/withPolicyAndFullscreenLoading';
import type {WithPolicyAndFullscreenLoadingProps} from '@pages/workspace/withPolicyAndFullscreenLoading';
import colors from '@styles/theme/colors';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type WorkspaceWorkflowsApprovalsApproverPageProps = WithPolicyAndFullscreenLoadingProps &
    PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER | typeof SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE>;

function WorkspaceWorkflowsApprovalsApproverPage({policy, personalDetails, isLoadingReportData = true, route}: WorkspaceWorkflowsApprovalsApproverPageProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const icons = useMemoizedLazyExpensifyIcons(['FallbackAvatar', 'Bot']);
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const [approvalWorkflow, approvalWorkflowMetadata] = useOnyx(ONYXKEYS.APPROVAL_WORKFLOW);
    const [optimisticAgentAccountIDMapping] = useOnyx(ONYXKEYS.OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING);
    const [agentPrompts] = useOnyx(ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT);
    const isApprovalWorkflowLoading = isLoadingOnyxValue(approvalWorkflowMetadata);
    const personalDetailsByEmail = usePersonalDetailsByEmail();
    const currentUserPersonalDetails = useCurrentUserPersonalDetails();
    const approverIndex = Number(route.params.approverIndex) ?? 0;
    const rhpRoutes = useNavigationState((state) => state.routes);
    const defaultApprover = getDefaultApprover(policy);
    const firstApprover = approvalWorkflow?.originalApprovers?.[0]?.email ?? '';
    // Keep the removed approver visible until navigation finishes.
    // Without this temporary state, clearing the approver immediately causes the empty state to flash
    // while this screen is still mounted during the dismiss animation.
    const [removingApproverEmail, setRemovingApproverEmail] = useState<string>();

    const isChangeApproverRoute = route.name === SCREENS.WORKSPACE.WORKFLOWS_APPROVALS_APPROVER_CHANGE;
    const isInitialCreationFlow = approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && approvalWorkflow?.isInitialFlow;
    const currentApprover = approvalWorkflow?.approvers[approverIndex];
    const selectedApproverEmail = currentApprover?.email;
    const visibleSelectedApproverEmail = removingApproverEmail ?? selectedApproverEmail;

    const employeeList = policy?.employeeList;
    const approversFromWorkflow = approvalWorkflow?.approvers;
    const isDefault = approvalWorkflow?.isDefault;

    const shouldShowNotFoundView = isAnyHRReadOnlyWorkflowMode(policy);
    const shouldFilterOutExpensifyTeam = shouldFilterExpensifyTeam(policy?.owner, currentUserPersonalDetails?.login);

    const allApprovers: SelectionListApprover[] = useMemo(() => {
        if (isApprovalWorkflowLoading || !employeeList) {
            return [];
        }

        const membersEmail = approvalWorkflow?.members?.map((member) => member.email);

        return Object.values(employeeList)
            .map((employee): SelectionListApprover | null => {
                const email = employee.email;

                if (!email) {
                    return null;
                }

                if (employee.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
                    return null;
                }

                if (shouldFilterOutExpensifyTeam && isExpensifyTeam(email) && visibleSelectedApproverEmail !== email) {
                    return null;
                }

                if (!isDefault && policy?.preventSelfApproval && membersEmail?.includes(email) && visibleSelectedApproverEmail !== email) {
                    return null;
                }

                // Do not allow the same email to be added twice
                const isEmailAlreadyInApprovers = approversFromWorkflow?.some((approver, index) => approver?.email === email && index !== approverIndex);
                if (isEmailAlreadyInApprovers && visibleSelectedApproverEmail !== email) {
                    return null;
                }

                // Do not allow the default approver to be added as the first approver
                if (!isDefault && approverIndex === 0 && defaultApprover === email) {
                    return null;
                }

                const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);
                const accountID = Number(policyMemberEmailsToAccountIDs[email] ?? '');

                if (!accountID) {
                    return null;
                }

                const {avatar, displayName = email, login} = personalDetails?.[accountID] ?? {};

                return {
                    text: displayName,
                    alternateText: email,
                    keyForList: email,
                    isSelected: visibleSelectedApproverEmail === email,
                    login: email,
                    icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: accountID}],
                    rightElement: (
                        <MemberRightIcon
                            role={employee.role}
                            owner={policy?.owner}
                            login={login}
                            isAgent={isAgentEmail(employee.email)}
                        />
                    ),
                };
            })
            .filter((approver): approver is SelectionListApprover => !!approver);
    }, [
        isApprovalWorkflowLoading,
        employeeList,
        isDefault,
        policy?.preventSelfApproval,
        policy?.owner,
        approvalWorkflow?.members,
        approversFromWorkflow,
        visibleSelectedApproverEmail,
        approverIndex,
        defaultApprover,
        personalDetails,
        icons.FallbackAvatar,
        shouldFilterOutExpensifyTeam,
    ]);

    // Optimistic agent approver (seeded by AddAgentPage). The pending approver carries the
    // optimistic accountID but no email until CREATE_AGENT resolves; render it as a top row
    // with reduced opacity (via `pendingAction`) and surface CREATE_AGENT errors so the admin
    // can dismiss + retry without leaving the picker.
    const pendingOptimisticApprover =
        currentApprover?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD && !!currentApprover?.accountID && !currentApprover.email ? currentApprover : undefined;
    const pendingOptimisticAccountID = pendingOptimisticApprover?.accountID;
    const pendingOptimisticDetail = pendingOptimisticAccountID ? personalDetails?.[pendingOptimisticAccountID] : undefined;
    const pendingOptimisticPromptErrors = pendingOptimisticAccountID ? agentPrompts?.[`${ONYXKEYS.COLLECTION.SHARED_NVP_AGENT_PROMPT}${pendingOptimisticAccountID}`]?.errors : undefined;
    const addAgentPolicyErrors = policy?.errorFields?.[CONST.POLICY.COLLECTION_KEYS.ADD_AGENT];
    const pendingOptimisticErrors = addAgentPolicyErrors ?? pendingOptimisticPromptErrors;

    const pendingOptimisticDetailDisplayName = pendingOptimisticDetail?.displayName;
    const pendingOptimisticDetailAvatar = pendingOptimisticDetail?.avatar;
    const pendingOptimisticApproverRow = useMemo<SelectionListApprover | undefined>(() => {
        if (!pendingOptimisticApprover || !pendingOptimisticAccountID) {
            return undefined;
        }
        const displayName = pendingOptimisticDetailDisplayName ?? pendingOptimisticApprover.displayName ?? '';
        const avatar = pendingOptimisticDetailAvatar ?? pendingOptimisticApprover.avatar;
        return {
            text: displayName,
            keyForList: String(pendingOptimisticAccountID),
            isSelected: true,
            login: '',
            icons: [{source: avatar ?? icons.FallbackAvatar, type: CONST.ICON_TYPE_AVATAR, name: displayName, id: pendingOptimisticAccountID}],
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            errors: pendingOptimisticErrors ?? undefined,
            isInteractive: false,
        };
    }, [pendingOptimisticApprover, pendingOptimisticAccountID, pendingOptimisticDetailDisplayName, pendingOptimisticDetailAvatar, pendingOptimisticErrors, icons.FallbackAvatar]);

    // Once CREATE_AGENT resolves, the server echoes `{optimisticID: realID}` in
    // `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING` and the real agent lands in `policy.employeeList`,
    // which means `allApprovers` already contains the real row before the reconcile effect
    // rewrites `APPROVAL_WORKFLOW`. In that interim render we'd otherwise show both rows.
    // Detect the mapping early, force the real row to render as selected, and drop the
    // optimistic placeholder.
    const reconciledRealAccountID = pendingOptimisticAccountID ? optimisticAgentAccountIDMapping?.[pendingOptimisticAccountID] : undefined;
    const reconciledLogin = reconciledRealAccountID ? personalDetails?.[reconciledRealAccountID]?.login : undefined;
    const isOptimisticReconciled = !!reconciledLogin && !!policy?.employeeList?.[reconciledLogin];

    const allApproversWithOptimistic = useMemo(() => {
        if (isOptimisticReconciled && reconciledLogin) {
            return allApprovers.map((approver) => (approver.keyForList === reconciledLogin ? {...approver, isSelected: true} : approver));
        }
        if (pendingOptimisticApproverRow) {
            return [pendingOptimisticApproverRow, ...allApprovers];
        }
        return allApprovers;
    }, [pendingOptimisticApproverRow, allApprovers, isOptimisticReconciled, reconciledLogin]);

    const onDismissOptimisticApprover = useCallback(() => {
        if (!pendingOptimisticAccountID) {
            return;
        }
        clearOptimisticAgentFromApprovalWorkflow(route.params.policyID, approverIndex, approvalWorkflow, pendingOptimisticAccountID);
    }, [pendingOptimisticAccountID, route.params.policyID, approverIndex, approvalWorkflow]);

    const shouldShowListEmptyContent = !!approvalWorkflow && !isApprovalWorkflowLoading && !removingApproverEmail;

    const goBack = useCallback(() => {
        let backToRoute;
        if (isInitialCreationFlow) {
            backToRoute = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID);
            clearApprovalWorkflowApprovers();
        } else if (approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
            backToRoute = rhpRoutes.length > 1 ? undefined : ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover);
        } else {
            backToRoute = ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(route.params.policyID);
        }
        Navigation.goBack(backToRoute);
    }, [isInitialCreationFlow, approvalWorkflow?.action, route.params.policyID, rhpRoutes.length, firstApprover]);

    const toggleApprover = useCallback(
        (approvers: SelectionListApprover[]) => {
            const approver = approvers.at(0);
            const isRemovingApprover = approvers.length === 0;

            if (isRemovingApprover) {
                setRemovingApproverEmail(visibleSelectedApproverEmail);
                clearApprovalWorkflowApprover({approverIndex, currentApprovalWorkflow: approvalWorkflow});
                if (isChangeApproverRoute && approvalWorkflow?.action === CONST.APPROVAL_WORKFLOW.ACTION.EDIT) {
                    Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, firstApprover));
                    return;
                }
                goBack();
                return;
            }

            const newSelectedEmail = approver?.login ?? '';
            const policyMemberEmailsToAccountIDs = getMemberAccountIDsForWorkspace(employeeList);
            const accountID = Number(newSelectedEmail ? policyMemberEmailsToAccountIDs[newSelectedEmail] : '');
            const {avatar, displayName = newSelectedEmail} = personalDetails?.[accountID] ?? {};

            setApprovalWorkflowApprover({
                approver: {
                    email: newSelectedEmail,
                    avatar,
                    displayName,
                    approvalLimit: null,
                    overLimitForwardsTo: '',
                },
                approverIndex,
                currentApprovalWorkflow: approvalWorkflow,
                policy,
                personalDetailsByEmail,
            });

            // If this is the change approver route, go back to the Approval Limit page
            // Otherwise, navigate forward to set the approval limit
            if (isChangeApproverRoute) {
                Navigation.goBack(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(route.params.policyID, approverIndex));
            } else {
                Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT.getRoute(route.params.policyID, approverIndex));
            }
        },
        [
            approverIndex,
            approvalWorkflow,
            employeeList,
            personalDetails,
            policy,
            route.params.policyID,
            goBack,
            personalDetailsByEmail,
            isChangeApproverRoute,
            firstApprover,
            visibleSelectedApproverEmail,
        ],
    );

    const subtitle = useMemo(
        () => (
            <>
                <Text style={[styles.textHeadlineH1, styles.mh5, styles.mv3]}>{translate('workflowsApproverPage.title')}</Text>
                <Text style={[styles.mh5, styles.mb3, styles.textSupporting]}>{translate('workflowsApproverPage.description')}</Text>
            </>
        ),
        [translate, styles.textHeadlineH1, styles.mh5, styles.mv3, styles.mb3, styles.textSupporting],
    );

    const shouldShowCreateAgentRow = isCustomAgentEnabled && approverIndex === 0;

    const onCreateAgentPress = useCallback(() => {
        Navigation.navigate(
            ROUTES.SETTINGS_AGENTS_ADD.getRoute({
                policyID: route.params.policyID,
                workflowApproverEmail: firstApprover,
            }),
        );
    }, [route.params.policyID, firstApprover]);

    const headerContent = useMemo(() => {
        if (!shouldShowCreateAgentRow) {
            return null;
        }
        return (
            <MenuItem
                icon={icons.Bot}
                iconWidth={variables.avatarSizeSubscript}
                iconHeight={variables.avatarSizeSubscript}
                iconStyles={[styles.avatarAgentApprover]}
                iconFill={colors.productLight100}
                title={translate('workflowsApproverPage.createNewAgent')}
                description={translate('workflowsApproverPage.createNewAgentDescription')}
                onPress={onCreateAgentPress}
                shouldShowRightIcon
            />
        );
    }, [shouldShowCreateAgentRow, icons.Bot, translate, onCreateAgentPress, styles.avatarAgentApprover]);

    // Reconcile the optimistic agent approver once the server-side CREATE_AGENT response lands.
    // The new agent is written to `approvalWorkflow.approvers[approverIndex]` with `accountID` set
    // but `email = ''` and `pendingAction = ADD`. When the server replies, the real accountID
    // (mapped via `OPTIMISTIC_AGENT_ACCOUNT_ID_MAPPING`) shows up in `employeeList` with a login;
    // upgrade the approver to the real email so the picker can match it to a row in `allApprovers`.
    useEffect(() => {
        if (!approvalWorkflow || !policy?.employeeList || !personalDetails) {
            return;
        }
        const pendingApprover = approvalWorkflow.approvers.at(approverIndex);
        if (!pendingApprover || pendingApprover.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD || pendingApprover.email || !pendingApprover.accountID) {
            return;
        }
        const mappedRealAccountID = optimisticAgentAccountIDMapping?.[pendingApprover.accountID];
        if (!mappedRealAccountID) {
            return;
        }
        const mappedDetail = personalDetails[mappedRealAccountID];
        const mappedLogin = mappedDetail?.login;
        if (!mappedLogin || !policy.employeeList?.[mappedLogin]) {
            return;
        }
        const upgradedApprovers = approvalWorkflow.approvers.map((approver, index) =>
            index === approverIndex && approver
                ? {
                      ...approver,
                      email: mappedLogin,
                      accountID: mappedDetail.accountID,
                      avatar: mappedDetail.avatar ?? approver.avatar,
                      displayName: mappedDetail.displayName ?? approver.displayName,
                      pendingAction: undefined,
                  }
                : approver,
        );
        setApprovalWorkflow({...approvalWorkflow, approvers: upgradedApprovers});
    }, [approvalWorkflow, policy?.employeeList, personalDetails, optimisticAgentAccountIDMapping, approverIndex]);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <ApproverSelectionList
                testID="WorkspaceWorkflowsApprovalsApproverPage"
                headerTitle={translate('workflowsPage.approver')}
                subtitle={subtitle}
                headerContent={headerContent}
                isLoadingReportData={isLoadingReportData}
                policy={policy}
                initiallyFocusedOptionKey={(isOptimisticReconciled ? reconciledLogin : pendingOptimisticApproverRow?.keyForList) ?? visibleSelectedApproverEmail}
                shouldShowNotFoundView={shouldShowNotFoundView}
                shouldShowNotFoundViewLink
                allApprovers={allApproversWithOptimistic}
                onBackButtonPress={goBack}
                shouldShowListEmptyContent={shouldShowListEmptyContent}
                listEmptyContentSubtitle={translate('workflowsPage.emptyContent.approverSubtitle')}
                allowMultipleSelection={false}
                onSelectApprover={toggleApprover}
                onDismissError={onDismissOptimisticApprover}
            />
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicyAndFullscreenLoading(WorkspaceWorkflowsApprovalsApproverPage);
