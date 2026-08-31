import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import Icon from '@components/Icon';
import MenuItem from '@components/MenuItem';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import RenderHTML from '@components/RenderHTML';
import SearchBar from '@components/SearchBar';
import Text from '@components/Text';
import TextLink from '@components/TextLink';

import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicy from '@hooks/usePolicy';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import {clearPolicyErrorField, setWorkspaceApprovalMode} from '@libs/actions/Policy/Policy';
import {clearApprovalWorkflow, selectApprovalWorkflowForEdit, setApprovalWorkflow} from '@libs/actions/Workflow';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {getConnectedHRProvider, getHRFinalApprover, isAnyHRConnected, isAnyHRReadOnlyWorkflowMode, isHRAdvancedMode} from '@libs/HRUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import Navigation from '@libs/Navigation/Navigation';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {hasDynamicExternalWorkflow, isControlPolicy, isSubmitPolicy} from '@libs/PolicyUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {
    convertApprovalWorkflowRulesToWorkflows,
    convertPolicyEmployeesToApprovalWorkflows,
    filterRulesForPolicy,
    getApprovalWorkflowRulesForPolicy,
    INITIAL_APPROVAL_WORKFLOW,
} from '@libs/WorkflowUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type Rule from '@src/types/onyx/Rule';

import type {OnyxCollection} from 'react-native-onyx';

import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import WorkflowsSectionCard from './WorkflowsSectionCard';

type WorkflowsApprovalsTabProps = {
    policyID: string;
};

function WorkflowNoResultsView({message, shouldShow, searchValue}: {message: string; shouldShow: boolean; searchValue: string}) {
    const styles = useThemeStyles();

    useDebouncedAccessibilityAnnouncement(message, shouldShow, searchValue);

    if (!shouldShow) {
        return null;
    }

    return (
        <View style={[styles.pt3, styles.pb5]}>
            <Text
                style={[styles.textNormal, styles.colorMuted]}
                aria-hidden
            >
                {message}
            </Text>
        </View>
    );
}

// Bordered "Load more" card matching the workflow rows: the whole card is the tap target and gets the row-hover state.
function WorkflowsLoadMoreCard({count, onPress}: {count: number; onPress: () => void}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['CircularArrowBackwards']);
    const label = translate('workflowsPage.loadMoreWorkflows', {count});

    return (
        <PressableWithFeedback
            accessibilityLabel={label}
            role={CONST.ROLE.BUTTON}
            onPress={onPress}
            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.LOAD_MORE_APPROVALS}
            hoverStyle={styles.hoveredComponentBG}
            style={[styles.border, shouldUseNarrowLayout ? styles.ph3 : styles.ph4, styles.pv3, styles.mt6, styles.mbn3, styles.alignItemsCenter, styles.justifyContentCenter]}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.justifyContentCenter, styles.minHeightComponentSizeSmall]}>
                <Icon
                    src={expensifyIcons.CircularArrowBackwards}
                    fill={theme.textSupporting}
                    size={CONST.ICON_SIZE.EXTRA_SMALL}
                    additionalStyles={styles.mr1}
                />
                <Text style={[styles.buttonSmallText, styles.textSupporting]}>{label}</Text>
            </View>
        </PressableWithFeedback>
    );
}

function WorkflowsApprovalsTab({policyID}: WorkflowsApprovalsTabProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['Info', 'Plus']);
    const policy = usePolicy(policyID);
    const {showConfirmModal} = useConfirmModal();
    const {isBetaEnabled} = usePermissions();

    const isSmartLimitEnabled = policy?.areApprovalsLockedByExpensifyCard ?? false;
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const accountManagerReportID = account?.accountManagerReportID;
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);
    const {accountID: currentUserAccountID, email: currentUserEmail = '', login: currentUserLogin = ''} = useCurrentUserPersonalDetails();

    const {
        canWrite: canWriteApprovals,
        showReadOnlyModal,
        withReadOnlyFallback: withApprovalsReadOnlyFallback,
    } = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS);

    const isSubmitPolicyWorkspace = isSubmitPolicy(policy);

    const isMultipleApproversBetaEnabled = isBetaEnabled(CONST.BETAS.MULTIPLE_APPROVERS);
    const policyRulesSelector = useCallback((rules: OnyxCollection<Rule>) => filterRulesForPolicy(rules, policyID), [policyID]);
    const [rulesCollection] = useOnyx(ONYXKEYS.COLLECTION.RULE, {selector: policyRulesSelector});
    const {approvalWorkflows, availableMembers, usedApproverEmails} = useMemo(() => {
        const params = {
            policy,
            personalDetails: personalDetails ?? {},
            localeCompare,
            currentUserLogin,
            rules: getApprovalWorkflowRulesForPolicy(rulesCollection, policyID),
        };
        return isMultipleApproversBetaEnabled ? convertApprovalWorkflowRulesToWorkflows(params) : convertPolicyEmployeesToApprovalWorkflows(params);
    }, [policy, personalDetails, localeCompare, currentUserLogin, rulesCollection, policyID, isMultipleApproversBetaEnabled]);

    const isAdvanceApproval = (approvalWorkflows.length > 1 || (approvalWorkflows?.at(0)?.approvers ?? []).length > 1) && isControlPolicy(policy);
    const updateApprovalMode = isAdvanceApproval ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC;

    const confirmDisableApprovals = useCallback(() => {
        setWorkspaceApprovalMode(
            policy,
            policy?.owner ?? '',
            CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            currentUserAccountID,
            currentUserEmail,
            isTrackIntentUser,
            {
                transactionViolations,
                betas,
                personalDetailsList: personalDetails,
            },
            rulesCollection,
        );
    }, [betas, policy, transactionViolations, currentUserAccountID, currentUserEmail, personalDetails, isTrackIntentUser, rulesCollection]);

    const navigateToHRSettings = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_HR.getRoute(policyID));
    }, [policyID]);

    const connectedHRProvider = getConnectedHRProvider(policy);
    const hrProviderName = connectedHRProvider?.displayName ?? '';

    const promptConfigureApprovalsInHR = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
            prompt: translate('workflowsPage.hrApprovalWorkflowLockedPrompt', {
                provider: hrProviderName,
            }),
            confirmText: translate('workflowsPage.goToHRSettings', {
                provider: hrProviderName,
            }),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        navigateToHRSettings();
    }, [navigateToHRSettings, hrProviderName, showConfirmModal, translate]);

    const navigateToSubmitWorkspaceApprovalsUpgrade = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)));
    }, [policyID]);

    // User should be allowed to add new Approval Workflow only if he's upgraded to Control Plan, otherwise redirected to the Upgrade Page
    const addApprovalAction = useCallback(() => {
        setApprovalWorkflow({
            ...INITIAL_APPROVAL_WORKFLOW,
            availableMembers,
            usedApproverEmails,
        });

        if (isSubmitPolicyWorkspace) {
            navigateToSubmitWorkspaceApprovalsUpgrade();
            return;
        }

        if (!isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias,
                    createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.path),
                ),
            );
            return;
        }

        Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.path));
    }, [policy, policyID, availableMembers, usedApproverEmails, isSubmitPolicyWorkspace, navigateToSubmitWorkspaceApprovalsUpgrade]);

    const isHRAdvancedModeEnabled = isHRAdvancedMode(policy);
    const hrFinalApproverEmail = getHRFinalApprover(policy) ?? undefined;

    const filteredApprovalWorkflows =
        isMultipleApproversBetaEnabled ||
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.ADVANCED ||
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL ||
        isHRAdvancedModeEnabled
            ? approvalWorkflows
            : approvalWorkflows.filter((workflow) => workflow.isDefault);

    const everyoneText = translate('workspace.common.everyone');

    const filterWorkflow = (workflow: ApprovalWorkflow, searchInput: string) => {
        const searchableTexts: string[] = [];

        if (workflow.isDefault) {
            searchableTexts.push(everyoneText);
        } else {
            for (const member of workflow.members) {
                searchableTexts.push(member.displayName);
                searchableTexts.push(Str.removeSMSDomain(member.displayName));
                searchableTexts.push(member.email);
                searchableTexts.push(Str.removeSMSDomain(member.email));
            }
        }

        for (const approver of workflow.approvers) {
            searchableTexts.push(approver.displayName);
            searchableTexts.push(Str.removeSMSDomain(approver.displayName));
            searchableTexts.push(approver.email);
            searchableTexts.push(Str.removeSMSDomain(approver.email));
        }

        return tokenizedSearch([workflow], searchInput, () => searchableTexts).length > 0;
    };

    const [workflowSearchInput, setWorkflowSearchInput, searchFilteredWorkflows] = useSearchResults(filteredApprovalWorkflows, filterWorkflow);
    const [isWorkflowListExpanded, setIsWorkflowListExpanded] = useState(false);

    useEffect(() => {
        if (filteredApprovalWorkflows.length > CONST.SEARCH_BAR_THRESHOLD) {
            return;
        }
        setWorkflowSearchInput('');
    }, [filteredApprovalWorkflows.length, setWorkflowSearchInput]);

    // Collapse back to the paginated view once the list shrinks to a single batch, so a later regrowth above the batch shows "Load more" again.
    // Adjusting during render (vs. an effect) is React's recommended pattern for resetting state when data changes and avoids a cascading re-render.
    if (isWorkflowListExpanded && searchFilteredWorkflows.length <= CONST.WORKFLOW_APPROVALS_INITIAL_BATCH) {
        setIsWorkflowListExpanded(false);
    }

    // Searching reveals every match, so pagination is bypassed while a query is active. Pressing "Load more" reveals all remaining workflows at once.
    // Trim before deciding so a whitespace-only input doesn't drop pagination while searchFilteredWorkflows is still unfiltered.
    const isSearchingWorkflows = workflowSearchInput.trim().length > 0;
    // Memoize so a stable reference reaches the render below; otherwise the slice() allocates a new array each render.
    const displayedWorkflows = useMemo(
        () => (isWorkflowListExpanded || isSearchingWorkflows ? searchFilteredWorkflows : searchFilteredWorkflows.slice(0, CONST.WORKFLOW_APPROVALS_INITIAL_BATCH)),
        [isWorkflowListExpanded, isSearchingWorkflows, searchFilteredWorkflows],
    );
    const hiddenWorkflowsCount = searchFilteredWorkflows.length - displayedWorkflows.length;

    const isDEWEnabled = hasDynamicExternalWorkflow(policy);
    const isHRConnected = isAnyHRConnected(policy);
    const shouldBlockApprovalWorkflowEditing = isAnyHRReadOnlyWorkflowMode(policy);
    const approvalSubtitle = useMemo(() => {
        if (!isHRConnected) {
            return translate('workflowsPage.addApprovalsDescription');
        }

        return (
            <Text style={[styles.textLabelSupportingEmptyValue, styles.lh20, styles.mt1, styles.mr5]}>
                {translate('workflowsPage.addApprovalsDescription')}{' '}
                <TextLink onPress={navigateToHRSettings}>
                    {translate('workflowsPage.configureViaHR', {
                        provider: hrProviderName,
                    })}
                </TextLink>
            </Text>
        );
    }, [isHRConnected, hrProviderName, navigateToHRSettings, styles.lh20, styles.mr5, styles.mt1, styles.textLabelSupportingEmptyValue, translate]);

    const approvalOptionSubtitle = isHRConnected || !isSmartLimitEnabled ? approvalSubtitle : translate('workspace.moreFeatures.workflows.disableApprovalPrompt');
    const hasApprovalError = !!policy?.errorFields?.approvalMode;

    const getAddApprovalsToggleDisabledAction = () => {
        if (isHRConnected) {
            return promptConfigureApprovalsInHR;
        }
        return undefined;
    };

    return (
        <WorkflowsSectionCard
            title={translate('workflowsPage.addApprovalsTitle')}
            subtitle={approvalOptionSubtitle}
            switchAccessibilityLabel={isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription')}
            onToggle={(isEnabled: boolean) => {
                if (!canWriteApprovals) {
                    showReadOnlyModal();
                    return;
                }
                if (isEnabled && isSubmitPolicyWorkspace) {
                    navigateToSubmitWorkspaceApprovalsUpgrade();
                    return;
                }
                if (isHRConnected) {
                    return;
                }
                if (!isEnabled) {
                    showConfirmModal({
                        title: translate('workspace.bankAccount.areYouSure'),
                        prompt: translate('workflowsPage.disableApprovalPromptDescription'),
                        confirmText: translate('common.disable'),
                        cancelText: translate('common.cancel'),
                        buttonVariant: CONST.BUTTON_VARIANT.DANGER,
                    }).then((result) => {
                        if (result.action !== ModalActions.CONFIRM) {
                            return;
                        }
                        confirmDisableApprovals();
                    });
                    return;
                }
                setWorkspaceApprovalMode(
                    policy,
                    policy?.owner ?? '',
                    isEnabled ? updateApprovalMode : CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                    currentUserAccountID,
                    currentUserEmail,
                    isTrackIntentUser,
                    {
                        transactionViolations,
                        betas,
                        personalDetailsList: personalDetails,
                    },
                    rulesCollection,
                );
            }}
            subMenuItems={
                <>
                    {isDEWEnabled && (
                        <View style={[styles.border, shouldUseNarrowLayout ? styles.p3 : styles.p4, styles.mt6, styles.mbn3, styles.flexRow, styles.alignItemsCenter]}>
                            <Icon
                                src={expensifyIcons.Info}
                                fill={theme.textSupporting}
                                additionalStyles={styles.popoverMenuIcon}
                            />
                            <View style={[styles.flex1, styles.ml3]}>
                                <RenderHTML
                                    html={
                                        accountManagerReportID
                                            ? translate('workflowsPage.customApprovalWorkflowEnabled')
                                            : translate('workflowsPage.customApprovalWorkflowEnabledConciergeOnly')
                                    }
                                />
                            </View>
                        </View>
                    )}
                    {filteredApprovalWorkflows.length > CONST.SEARCH_BAR_THRESHOLD && (
                        <SearchBar
                            label={translate('workflowsPage.findWorkflow')}
                            inputValue={workflowSearchInput}
                            onChangeText={setWorkflowSearchInput}
                            style={[styles.mt6, {marginHorizontal: 0}]}
                        />
                    )}
                    <WorkflowNoResultsView
                        message={translate('common.noResultsFoundMatching', workflowSearchInput)}
                        shouldShow={searchFilteredWorkflows.length === 0 && workflowSearchInput.length > 0}
                        searchValue={workflowSearchInput}
                    />
                    {displayedWorkflows.map((workflow) => {
                        const firstApproverEmail = workflow.approvers.at(0)?.email ?? '';
                        // The first approver isn't unique once rule-based chains diverge, so anchor the key/edit route
                        // on a member too (each member belongs to exactly one workflow).
                        const firstMemberEmail = workflow.members.at(0)?.email ?? '';

                        return (
                            <OfflineWithFeedback
                                key={`${firstApproverEmail}-${firstMemberEmail}`}
                                pendingAction={workflow.pendingAction}
                            >
                                <ApprovalWorkflowSection
                                    approvalWorkflow={workflow}
                                    onPress={
                                        shouldBlockApprovalWorkflowEditing || !canWriteApprovals
                                            ? undefined
                                            : () => {
                                                  // Discard stale onyx edits or the Edit page's resume check would surface a prior abandoned session.
                                                  clearApprovalWorkflow();
                                                  Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyID, firstApproverEmail, firstMemberEmail));
                                              }
                                    }
                                    onShowAllMembersPress={
                                        shouldBlockApprovalWorkflowEditing
                                            ? undefined
                                            : () => {
                                                  selectApprovalWorkflowForEdit({
                                                      workflow,
                                                      defaultWorkflowMembers: availableMembers,
                                                      usedApproverEmails,
                                                  });
                                                  Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.path));
                                              }
                                    }
                                    currency={policy?.outputCurrency}
                                    isDisabled={shouldBlockApprovalWorkflowEditing || !canWriteApprovals}
                                    hrProviderName={isHRConnected ? hrProviderName : undefined}
                                    isHRAdvancedMode={isHRAdvancedModeEnabled}
                                    hrFinalApproverEmail={isHRAdvancedModeEnabled ? hrFinalApproverEmail : undefined}
                                />
                            </OfflineWithFeedback>
                        );
                    })}
                    {hiddenWorkflowsCount > 0 && (
                        <WorkflowsLoadMoreCard
                            count={hiddenWorkflowsCount}
                            onPress={() => setIsWorkflowListExpanded(true)}
                        />
                    )}
                    {!shouldBlockApprovalWorkflowEditing && canWriteApprovals && (
                        <MenuItem
                            title={translate('workflowsPage.addApprovalButton')}
                            titleStyle={styles.textStrong}
                            icon={expensifyIcons.Plus}
                            iconHeight={20}
                            iconWidth={20}
                            style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                            onPress={addApprovalAction}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.ADD_APPROVAL}
                        />
                    )}
                </>
            }
            disabled={!canWriteApprovals || isSmartLimitEnabled || isDEWEnabled || isHRConnected}
            disabledAction={withApprovalsReadOnlyFallback(getAddApprovalsToggleDisabledAction())}
            showLockIcon={!canWriteApprovals}
            // Submit2026 workspaces have approval mode set to Advanced, but we want to show it here as off because configuring the advanced approvals is a paid feature.
            isActive={
                !isSubmitPolicyWorkspace &&
                (isHRConnected ||
                    isDEWEnabled ||
                    (([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policy?.approvalMode) && !hasApprovalError) ?? false))
            }
            pendingAction={policy?.pendingFields?.approvalMode}
            errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE)}
            onCloseError={() => clearPolicyErrorField(policyID, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE)}
        />
    );
}

export default WorkflowsApprovalsTab;
