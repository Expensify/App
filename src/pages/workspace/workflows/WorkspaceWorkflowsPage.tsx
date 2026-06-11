import {hasSeenTourSelector} from '@selectors/Onboarding';
import {Str} from 'expensify-common';
import React, {useCallback, useEffect, useMemo} from 'react';
// eslint-disable-next-line no-restricted-imports
import {InteractionManager, View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {BankName} from '@components/Icon/BankIconsUtils';
import {useLockedAccountActions, useLockedAccountState} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import {ModalActions} from '@components/Modal/Global/ModalContext';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import SearchBar from '@components/SearchBar';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useCardFeeds from '@hooks/useCardFeeds';
import useConfirmModal from '@hooks/useConfirmModal';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useDebouncedAccessibilityAnnouncement from '@hooks/useDebouncedAccessibilityAnnouncement';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import usePolicyFeatureWriteAccess from '@hooks/usePolicyFeatureWriteAccess';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSearchResults from '@hooks/useSearchResults';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWorkspaceDocumentTitle from '@hooks/useWorkspaceDocumentTitle';
import {
    clearPolicyErrorField,
    isCurrencySupportedForDirectReimbursement,
    isCurrencySupportedForGlobalReimbursement,
    openPolicyWorkflowsPage,
    setWorkspaceApprovalMode,
    setWorkspaceAutoHarvesting,
    setWorkspaceReimbursement,
} from '@libs/actions/Policy/Policy';
import {clearApprovalWorkflow, selectApprovalWorkflowForEdit, setApprovalWorkflow} from '@libs/actions/Workflow';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import {getAllCardsForWorkspace, isSmartLimitEnabled as isSmartLimitEnabledUtil} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import {getConnectedHRProvider, getHRFinalApprover, isAnyHRConnected, isAnyHRReadOnlyWorkflowMode, isHRAdvancedMode} from '@libs/HRUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import {getDisplayNameOrDefault, getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {
    canAccessSubmitWorkspaceFeatures,
    canMemberRead,
    getCorrectedAutoReportingFrequency,
    hasDynamicExternalWorkflow,
    isControlPolicy,
    isGroupPolicy as isGroupPolicyUtil,
    isPolicyAdmin as isPolicyAdminUtil,
} from '@libs/PolicyUtils';
import {hasInProgressVBBA} from '@libs/ReimbursementAccountUtils';
import tokenizedSearch from '@libs/tokenizedSearch';
import {convertPolicyEmployeesToApprovalWorkflows, getEligibleExistingBusinessBankAccounts, INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ExpenseReportRulesSection from '@pages/workspace/rules/ExpenseReportRulesSection';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {pressLockedBankAccount} from '@userActions/BankAccounts';
import {getPaymentMethods} from '@userActions/PaymentMethods';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import {navigateToConciergeChat} from '@userActions/Report';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import {getAutoReportingFrequencyDisplayNames} from './WorkspaceAutoReportingFrequencyPage';

type WorkspaceWorkflowsPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

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

function WorkspaceWorkflowsPage({policy, route}: WorkspaceWorkflowsPageProps) {
    useWorkspaceDocumentTitle(policy?.name, 'workspace.common.workflows');
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const illustrations = useMemoizedLazyIllustrations(['Workflows']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Info', 'Plus']);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply a correct padding style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = policy?.policyAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds] = useCardFeeds(policy?.id);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`);
    const [allReportNextSteps] = useOnyx(ONYXKEYS.COLLECTION.NEXT_STEP);
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const {isBetaEnabled} = usePermissions();
    const isSubmit2026BetaEnabled = isBetaEnabled(CONST.BETAS.SUBMIT_2026);
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const workspaceCards = getAllCardsForWorkspace(workspaceAccountID, cardList, cardFeeds);
    const {showConfirmModal} = useConfirmModal();
    const isSmartLimitEnabled = isSmartLimitEnabledUtil(workspaceCards);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const accountManagerReportID = account?.accountManagerReportID;
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [isSelfTourViewed] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const delegateAccountID = useDelegateAccountID();
    const {accountID: currentUserAccountID, email: currentUserEmail = '', login: currentUserLogin = ''} = useCurrentUserPersonalDetails();
    const isUserReimburser = policy?.achAccount?.reimburser !== undefined && account?.primaryLogin !== undefined && policy?.achAccount?.reimburser === account?.primaryLogin;
    const {
        approvalWorkflows,
        availableMembers,
        usedApproverEmails,
    } = convertPolicyEmployeesToApprovalWorkflows({
        policy,
        personalDetails: personalDetails ?? {},
        localeCompare,
        currentUserLogin,
    });

    const canAccessSubmit2026Features = canAccessSubmitWorkspaceFeatures(policy, isSubmit2026BetaEnabled);
    const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency, true).length > 0;

    const isAdvanceApproval = (approvalWorkflows.length > 1 || (approvalWorkflows?.at(0)?.approvers ?? []).length > 1) && isControlPolicy(policy);
    const updateApprovalMode = isAdvanceApproval ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC;
    const displayNameForAuthorizedPayer = useMemo(
        () => getDisplayNameOrDefault(getPersonalDetailByEmail(policy?.achAccount?.reimburser ?? ''), policy?.achAccount?.reimburser),
        [policy?.achAccount?.reimburser],
    );

    const isNonUSDWorkspace = policy?.outputCurrency !== CONST.CURRENCY.USD;
    const achData = reimbursementAccount?.achData;

    const shouldShowContinueModal = useMemo(() => {
        return hasInProgressVBBA(achData, isNonUSDWorkspace, policy?.id);
    }, [achData, isNonUSDWorkspace, policy?.id]);

    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(route.params.policyID)), [route.params.policyID]);

    const fetchData = useCallback(() => {
        openPolicyWorkflowsPage(route.params.policyID, true);
        getPaymentMethods();
    }, [route.params.policyID]);

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id, true));
    }, [policy]);

    const {isOffline} = useNetwork({onReconnect: fetchData});
    const isPolicyAdmin = isPolicyAdminUtil(policy);
    const canReadWorkflows = canMemberRead(policy, currentUserLogin, CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const {canWrite: canWriteWorkflows, showReadOnlyModal, withReadOnlyFallback: withWorkflowsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS);
    const {canWrite: canWriteApprovals, withReadOnlyFallback: withApprovalsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_APPROVALS);
    const {canWrite: canWritePayments, withReadOnlyFallback: withPaymentsReadOnlyFallback} = usePolicyFeatureWriteAccess(policy, CONST.POLICY.POLICY_FEATURE.WORKFLOWS_PAYMENTS);

    const {isAccountLocked} = useLockedAccountState();
    const {showLockedAccountModal} = useLockedAccountActions();

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            fetchData();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmDisableApprovals = useCallback(() => {
        setWorkspaceApprovalMode(policy, policy?.owner ?? '', CONST.POLICY.APPROVAL_MODE.OPTIONAL, currentUserAccountID, currentUserEmail, {
            reportNextSteps: allReportNextSteps,
            transactionViolations,
            betas,
        });
    }, [allReportNextSteps, betas, policy, transactionViolations, currentUserAccountID, currentUserEmail]);

    const navigateToHRSettings = useCallback(() => {
        Navigation.navigate(ROUTES.WORKSPACE_HR.getRoute(route.params.policyID));
    }, [route.params.policyID]);

    const connectedHRProvider = getConnectedHRProvider(policy);
    const hrProviderName = connectedHRProvider?.displayName ?? '';

    const promptConfigureApprovalsInHR = useCallback(async () => {
        const {action} = await showConfirmModal({
            title: translate('workspace.moreFeatures.connectionsWarningModal.featureEnabledTitle'),
            prompt: translate('workflowsPage.hrApprovalWorkflowLockedPrompt', {provider: hrProviderName}),
            confirmText: translate('workflowsPage.goToHRSettings', {provider: hrProviderName}),
            cancelText: translate('common.cancel'),
        });
        if (action !== ModalActions.CONFIRM) {
            return;
        }
        navigateToHRSettings();
    }, [navigateToHRSettings, hrProviderName, showConfirmModal, translate]);

    const navigateToSubmitWorkspaceApprovalsUpgrade = useCallback(() => {
        Navigation.navigate(
            ROUTES.WORKSPACE_UPGRADE.getRoute(route.params.policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID)),
        );
    }, [route.params.policyID]);

    // User should be allowed to add new Approval Workflow only if he's upgraded to Control Plan, otherwise redirected to the Upgrade Page
    const addApprovalAction = useCallback(() => {
        setApprovalWorkflow({
            ...INITIAL_APPROVAL_WORKFLOW,
            availableMembers,
            usedApproverEmails,
        });

        if (canAccessSubmit2026Features) {
            navigateToSubmitWorkspaceApprovalsUpgrade();
            return;
        }

        if (!isControlPolicy(policy)) {
            Navigation.navigate(
                ROUTES.WORKSPACE_UPGRADE.getRoute(
                    route.params.policyID,
                    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias,
                    ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID),
                ),
            );
            return;
        }

        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(route.params.policyID));
    }, [policy, route.params.policyID, availableMembers, usedApproverEmails, canAccessSubmit2026Features, navigateToSubmitWorkspaceApprovalsUpgrade]);

    const isHRAdvancedModeEnabled = isHRAdvancedMode(policy);
    const hrFinalApproverEmail = getHRFinalApprover(policy) ?? undefined;

    const filteredApprovalWorkflows =
        policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.ADVANCED || policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL || isHRAdvancedModeEnabled
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

    useEffect(() => {
        if (filteredApprovalWorkflows.length > CONST.SEARCH_BAR_THRESHOLD) {
            return;
        }
        setWorkflowSearchInput('');
    }, [filteredApprovalWorkflows.length, setWorkflowSearchInput]);

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
                <TextLink onPress={navigateToHRSettings}>{translate('workflowsPage.configureViaHR', {provider: hrProviderName})}</TextLink>
            </Text>
        );
    }, [isHRConnected, hrProviderName, navigateToHRSettings, styles.lh20, styles.mr5, styles.mt1, styles.textLabelSupportingEmptyValue, translate]);

    const optionItems: ToggleSettingOptionRowProps[] = useMemo(() => {
        const isBankAccountFullySetup = policy?.achAccount && (policy?.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN || policy?.achAccount.state === CONST.BANK_ACCOUNT.STATE.LOCKED);
        const bankAccountConnectedToWorkspace = Object.values(bankAccountList ?? {}).find((bankAccount) => bankAccount?.accountData?.additionalData?.policyID === policy?.id);
        const bankName = isBankAccountFullySetup ? (policy?.achAccount?.bankName ?? '') : (bankAccountConnectedToWorkspace?.accountData?.additionalData?.bankName ?? '');
        const addressName = isBankAccountFullySetup ? (policy?.achAccount?.addressName ?? '') : (bankAccountConnectedToWorkspace?.accountData?.addressName ?? '');
        const accountData = isBankAccountFullySetup ? policy?.achAccount : bankAccountConnectedToWorkspace?.accountData;
        const bankTitle = addressName.includes(CONST.MASKED_PAN_PREFIX) ? bankName : addressName;
        const bankAccountID = isBankAccountFullySetup ? policy?.achAccount?.bankAccountID : bankAccountConnectedToWorkspace?.methodID;
        const state = isBankAccountFullySetup ? (policy?.achAccount?.state ?? '') : (bankAccountConnectedToWorkspace?.accountData?.state ?? '');
        const isAccountInSetupState = isBankAccountPartiallySetup(state);
        const isBusinessBankAccountLocked = state === CONST.BANK_ACCOUNT.STATE.LOCKED;

        const shouldShowBankAccount = (!!isBankAccountFullySetup || !!bankAccountConnectedToWorkspace) && policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
        const bankAccountPendingAction = bankAccountConnectedToWorkspace?.pendingAction;
        const isBankAccountPendingDelete = bankAccountPendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

        const bankIcon = getBankIcon({bankName: bankName as BankName, isCard: false, styles});

        const hasReimburserError = !!policy?.errorFields?.reimburser;
        const hasApprovalError = !!policy?.errorFields?.approvalMode;
        const hasDelayedSubmissionError = !!(policy?.errorFields?.autoReporting ?? policy?.errorFields?.autoReportingFrequency);

        const getBadgeText = (accountState: string | undefined) => {
            switch (accountState) {
                case CONST.BANK_ACCOUNT.STATE.SETUP:
                    return translate('common.actionRequired');
                case CONST.BANK_ACCOUNT.STATE.LOCKED:
                    return translate('common.locked');
                default:
                    return undefined;
            }
        };

        const updateWorkspaceCurrencyPrompt = (
            <View style={[styles.renderHTML, styles.flexRow]}>
                <RenderHTML html={translate('workspace.bankAccount.yourWorkspace')} />
            </View>
        );
        const approvalOptionSubtitle = isHRConnected || !isSmartLimitEnabled ? approvalSubtitle : translate('workspace.moreFeatures.workflows.disableApprovalPrompt');

        const getAddApprovalsToggleDisabledAction = () => {
            if (isHRConnected) {
                return promptConfigureApprovalsInHR;
            }
            return undefined;
        };

        return [
            {
                title: translate('workflowsPage.submissionFrequency'),
                subtitle: translate('workflowsPage.submissionFrequencyDescription'),
                switchAccessibilityLabel: translate('workflowsPage.submissionFrequencyDescription'),
                onToggle: (isEnabled: boolean) => {
                    if (!canWriteWorkflows) {
                        showReadOnlyModal();
                        return;
                    }
                    if (!policy) {
                        return;
                    }
                    setWorkspaceAutoHarvesting(policy, isEnabled);
                },
                subMenuItems: (
                    <MenuItemWithTopDescription
                        title={getAutoReportingFrequencyDisplayNames(translate)[getCorrectedAutoReportingFrequency(policy) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]}
                        titleStyle={styles.textNormalThemeText}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        onPress={onPressAutoReportingFrequency}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTO_REPORTING_FREQUENCY}
                        // Instant submit is the equivalent of delayed submissions being turned off, so we show the feature as disabled if the frequency is instant
                        description={translate('common.frequency')}
                        shouldShowRightIcon={canWriteWorkflows}
                        interactive={canWriteWorkflows}
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                        brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                ),
                isActive: (policy?.autoReporting && !hasDelayedSubmissionError) ?? false,
                pendingAction: policy?.pendingFields?.autoReporting ?? policy?.pendingFields?.autoReportingFrequency,
                errors: getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
                onCloseError: () => clearPolicyErrorField(route.params.policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
                disabled: !canWriteWorkflows,
                disabledAction: withWorkflowsReadOnlyFallback(),
                showLockIcon: !canWriteWorkflows,
            },
            {
                title: translate('workflowsPage.addApprovalsTitle'),
                subtitle: approvalOptionSubtitle,
                switchAccessibilityLabel: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                onToggle: (isEnabled: boolean) => {
                    if (!canWriteApprovals) {
                        showReadOnlyModal();
                        return;
                    }
                    if (isEnabled && canAccessSubmit2026Features) {
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
                            danger: true,
                        }).then((result) => {
                            if (result.action !== ModalActions.CONFIRM) {
                                return;
                            }
                            confirmDisableApprovals();
                        });
                        return;
                    }
                    setWorkspaceApprovalMode(policy, policy?.owner ?? '', isEnabled ? updateApprovalMode : CONST.POLICY.APPROVAL_MODE.OPTIONAL, currentUserAccountID, currentUserEmail, {
                        reportNextSteps: allReportNextSteps,
                        transactionViolations,
                        betas,
                    });
                },
                subMenuItems: (
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
                        {searchFilteredWorkflows.map((workflow) => (
                            <OfflineWithFeedback
                                key={workflow.approvers.at(0)?.email ?? ''}
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
                                                  Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, workflow.approvers.at(0)?.email ?? ''));
                                              }
                                    }
                                    onShowAllMembersPress={
                                        shouldBlockApprovalWorkflowEditing
                                            ? undefined
                                            : () => {
                                                  selectApprovalWorkflowForEdit({workflow, defaultWorkflowMembers: availableMembers, usedApproverEmails});
                                                  Navigation.navigate(
                                                      ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(
                                                          route.params.policyID,
                                                          ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID),
                                                      ),
                                                  );
                                              }
                                    }
                                    currency={policy?.outputCurrency}
                                    isDisabled={shouldBlockApprovalWorkflowEditing || !canWriteApprovals}
                                    hrProviderName={isHRConnected ? hrProviderName : undefined}
                                    isHRAdvancedMode={isHRAdvancedModeEnabled}
                                    hrFinalApproverEmail={isHRAdvancedModeEnabled ? hrFinalApproverEmail : undefined}
                                />
                            </OfflineWithFeedback>
                        ))}
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
                ),
                disabled: !canWriteApprovals || isSmartLimitEnabled || isDEWEnabled || isHRConnected,
                disabledAction: withApprovalsReadOnlyFallback(getAddApprovalsToggleDisabledAction()),
                showLockIcon: !canWriteApprovals,
                // Submit2026 workspaces have approval mode set to Advanced, but we want to show it here as off because configuring the advanced approvals is a paid feature.
                isActive:
                    !canAccessSubmit2026Features &&
                    (isHRConnected ||
                        isDEWEnabled ||
                        (([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policy?.approvalMode) && !hasApprovalError) ??
                            false)),
                pendingAction: policy?.pendingFields?.approvalMode,
                errors: getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
                onCloseError: () => clearPolicyErrorField(route.params.policyID, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
            },
            {
                title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                switchAccessibilityLabel: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                onToggle: (isEnabled: boolean) => {
                    if (!canWritePayments) {
                        showReadOnlyModal();
                        return;
                    }
                    if (isEnabled && canAccessSubmit2026Features) {
                        Navigation.navigate(
                            ROUTES.WORKSPACE_UPGRADE.getRoute(
                                route.params.policyID,
                                CONST.UPGRADE_FEATURE_INTRO_MAPPING.payments.alias,
                                ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID),
                            ),
                        );
                        return;
                    }
                    let newReimbursementChoice;
                    if (!isEnabled) {
                        newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
                    } else if (!!policy?.achAccount && !isCurrencySupportedForDirectReimbursement((policy?.outputCurrency ?? '') as CurrencyType)) {
                        newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL;
                    } else {
                        newReimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
                    }

                    const newReimburserEmail = policy?.achAccount?.reimburser ?? policy?.owner;
                    setWorkspaceReimbursement({
                        policyID: route.params.policyID,
                        currentAchAccount: policy?.achAccount,
                        currentReimbursementChoice: policy?.reimbursementChoice,
                        reimbursementChoice: newReimbursementChoice,
                        reimburserEmail: newReimburserEmail ?? '',
                        bankAccountID: policy?.achAccount?.bankAccountID,
                        accountNumber: policy?.achAccount?.accountNumber,
                        addressName: policy?.achAccount?.addressName,
                        bankName: policy?.achAccount?.bankName,
                        state: policy?.achAccount?.state,
                    });
                },
                subMenuItems: (
                    <>
                        {shouldShowBankAccount ? (
                            <OfflineWithFeedback pendingAction={bankAccountPendingAction}>
                                <View style={[styles.sectionMenuItemTopDescription, styles.mt5, styles.pb1, styles.pt1]}>
                                    <Text style={[styles.textLabelSupportingNormal, styles.colorMuted]}>{translate('workflowsPayerPage.paymentAccount')}</Text>
                                </View>
                                <MenuItem
                                    title={bankTitle}
                                    description={getPaymentMethodDescription(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, accountData, translate)}
                                    onPress={
                                        canWritePayments
                                            ? () => {
                                                  if (isAccountLocked) {
                                                      showLockedAccountModal();
                                                      return;
                                                  }
                                                  // User who is reimburser can initiate unlocking process
                                                  if (state === CONST.BANK_ACCOUNT.STATE.LOCKED && bankAccountID && isUserReimburser) {
                                                      pressLockedBankAccount(bankAccountID, translate, conciergeReportID ?? undefined, delegateAccountID);
                                                      navigateToConciergeChat(conciergeReportID ?? undefined, introSelected, currentUserAccountID, isSelfTourViewed, betas);
                                                      return;
                                                  }

                                                  // User who is not reimburser can't initiate unlocking process but can connect new account
                                                  if (state === CONST.BANK_ACCOUNT.STATE.LOCKED && bankAccountID && !isUserReimburser) {
                                                      // If user has existing accounts and no bank account setup in progress we should show screen to choose an existing account
                                                      if (hasValidExistingAccounts && !shouldShowContinueModal) {
                                                          Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(route.params.policyID));
                                                          return;
                                                      }
                                                  }

                                                  navigateToBankAccountRoute({policyID: route.params.policyID, backTo: ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID)});
                                              }
                                            : undefined
                                    }
                                    displayInDefaultIconColor
                                    icon={bankIcon.icon}
                                    iconHeight={bankIcon.iconHeight ?? bankIcon.iconSize}
                                    iconWidth={bankIcon.iconWidth ?? bankIcon.iconSize}
                                    iconStyles={bankIcon.iconStyles}
                                    titleStyle={isBankAccountPendingDelete ? styles.offlineFeedbackDeleted : undefined}
                                    descriptionTextStyle={isBankAccountPendingDelete ? styles.offlineFeedbackDeleted : undefined}
                                    disabled={isOffline || !isPolicyAdmin}
                                    badgeText={getBadgeText(accountData?.state)}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.BANK_ACCOUNT}
                                    badgeIcon={isAccountInSetupState || (isBusinessBankAccountLocked && isPolicyAdmin) ? expensifyIcons.DotIndicator : undefined}
                                    isBadgeSuccess={isAccountInSetupState}
                                    isBadgeError={isBusinessBankAccountLocked && isPolicyAdmin}
                                    shouldShowRightIcon={canWritePayments}
                                    interactive={canWritePayments}
                                    shouldGreyOutWhenDisabled={!policy?.pendingFields?.reimbursementChoice}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                    brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                />
                            </OfflineWithFeedback>
                        ) : (
                            canWritePayments && (
                                <MenuItem
                                    title={translate('bankAccount.addBankAccount')}
                                    titleStyle={styles.textStrong}
                                    onPress={() => {
                                        if (isAccountLocked) {
                                            showLockedAccountModal();
                                            return;
                                        }
                                        if (!isCurrencySupportedForGlobalReimbursement((policy?.outputCurrency ?? '') as CurrencyType)) {
                                            showConfirmModal({
                                                title: translate('workspace.bankAccount.workspaceCurrencyNotSupported'),
                                                prompt: updateWorkspaceCurrencyPrompt,
                                                confirmText: translate('workspace.bankAccount.updateWorkspaceCurrency'),
                                                cancelText: translate('common.cancel'),
                                            }).then((result) => {
                                                if (result.action !== ModalActions.CONFIRM) {
                                                    return;
                                                }
                                                confirmCurrencyChangeAndHideModal();
                                            });

                                            return;
                                        }
                                        if (!shouldShowBankAccount && hasValidExistingAccounts && !shouldShowContinueModal) {
                                            Navigation.navigate(
                                                ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(
                                                    route.params.policyID,
                                                    ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID),
                                                ),
                                            );
                                            return;
                                        }
                                        navigateToBankAccountRoute({policyID: route.params.policyID, backTo: ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID)});
                                    }}
                                    icon={expensifyIcons.Plus}
                                    iconHeight={20}
                                    iconWidth={20}
                                    shouldShowRightIcon
                                    disabled={isOffline || !isPolicyAdmin}
                                    shouldGreyOutWhenDisabled={!policy?.pendingFields?.reimbursementChoice}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.ADD_BANK_ACCOUNT}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                    brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                />
                            )
                        )}
                        {shouldShowBankAccount && policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL && (
                            <OfflineWithFeedback
                                pendingAction={policy?.pendingFields?.reimburser}
                                shouldDisableOpacity={isOffline && !!policy?.pendingFields?.reimbursementChoice && !!policy?.pendingFields?.reimburser}
                                errors={getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.REIMBURSER)}
                                onClose={() => clearPolicyErrorField(policy?.id, CONST.POLICY.COLLECTION_KEYS.REIMBURSER)}
                                errorRowStyles={[styles.ml7]}
                            >
                                <MenuItemWithTopDescription
                                    title={displayNameForAuthorizedPayer ?? ''}
                                    titleStyle={styles.textNormalThemeText}
                                    descriptionTextStyle={styles.textLabelSupportingNormal}
                                    description={translate('workflowsPayerPage.payer')}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_PAYER.getRoute(route.params.policyID))}
                                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.AUTHORIZED_PAYER}
                                    shouldShowRightIcon={canWritePayments}
                                    interactive={canWritePayments}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                    brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                />
                            </OfflineWithFeedback>
                        )}
                    </>
                ),
                isEndOptionRow: true,
                isActive: policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                pendingAction: policy?.pendingFields?.reimbursementChoice,
                errors: getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE),
                onCloseError: () => clearPolicyErrorField(route.params.policyID, CONST.POLICY.COLLECTION_KEYS.REIMBURSEMENT_CHOICE),
                disabled: !canWritePayments,
                disabledAction: withPaymentsReadOnlyFallback(),
                showLockIcon: !canWritePayments,
            },
        ];
    }, [
        policy,
        bankAccountList,
        styles,
        translate,
        onPressAutoReportingFrequency,
        isSmartLimitEnabled,
        isHRConnected,
        hrProviderName,
        isHRAdvancedModeEnabled,
        hrFinalApproverEmail,
        shouldBlockApprovalWorkflowEditing,
        approvalSubtitle,
        availableMembers,
        usedApproverEmails,
        navigateToSubmitWorkspaceApprovalsUpgrade,
        promptConfigureApprovalsInHR,
        isDEWEnabled,
        shouldUseNarrowLayout,
        expensifyIcons.Info,
        expensifyIcons.Plus,
        expensifyIcons.DotIndicator,
        theme.textSupporting,
        accountManagerReportID,
        filteredApprovalWorkflows.length,
        workflowSearchInput,
        setWorkflowSearchInput,
        searchFilteredWorkflows,
        addApprovalAction,
        isOffline,
        isPolicyAdmin,
        displayNameForAuthorizedPayer,
        route.params.policyID,
        updateApprovalMode,
        currentUserAccountID,
        currentUserEmail,
        allReportNextSteps,
        transactionViolations,
        betas,
        showConfirmModal,
        confirmDisableApprovals,
        isAccountLocked,
        isUserReimburser,
        showLockedAccountModal,
        conciergeReportID,
        introSelected,
        isSelfTourViewed,
        hasValidExistingAccounts,
        shouldShowContinueModal,
        confirmCurrencyChangeAndHideModal,
        delegateAccountID,
        canAccessSubmit2026Features,
        canWriteApprovals,
        canWritePayments,
        canWriteWorkflows,
        withApprovalsReadOnlyFallback,
        withPaymentsReadOnlyFallback,
        withWorkflowsReadOnlyFallback,
        showReadOnlyModal,
    ]);

    const renderOptionItem = (item: ToggleSettingOptionRowProps, index: number) => (
        <Section
            containerStyles={isSmallScreenWidth ? styles.p5 : styles.p8}
            key={`toggleSettingOptionItem-${index}`}
            renderTitle={() => <View />}
        >
            <ToggleSettingOptionRow
                title={item.title}
                titleStyle={[styles.textHeadline, styles.cardSectionTitle, styles.accountSettingsSectionTitle, styles.mb1]}
                titleAccessibilityRole={CONST.ROLE.HEADER}
                subtitle={item.subtitle}
                subtitleStyle={[styles.textLabelSupportingEmptyValue, styles.lh20]}
                switchAccessibilityLabel={item.switchAccessibilityLabel}
                onToggle={item.onToggle}
                subMenuItems={item.subMenuItems}
                isActive={item.isActive}
                pendingAction={item.pendingAction}
                errors={item.errors}
                onCloseError={item.onCloseError}
                disabled={item.disabled}
                disabledAction={item.disabledAction}
                showLockIcon={item.showLockIcon}
            />
        </Section>
    );

    const isGroupPolicy = isGroupPolicyUtil(policy);
    const isLoading = !!(policy?.isLoading && policy?.reimbursementChoice === undefined);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
            policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS}
        >
            <WorkspacePageWithSections
                headerText={translate('workspace.common.workflows')}
                icon={illustrations.Workflows}
                route={route}
                shouldShowOfflineIndicatorInWideScreen
                shouldShowNotFoundPage={!isGroupPolicy || !canReadWorkflows}
                policyFeature={CONST.POLICY.POLICY_FEATURE.WORKFLOWS}
                isLoading={isLoading}
                shouldShowLoading={isLoading}
                shouldUseScrollView
                addBottomSafeAreaPadding
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {optionItems.map(renderOptionItem)}
                    <ExpenseReportRulesSection
                        policyID={route.params.policyID}
                        canWriteApprovals={canWriteApprovals}
                        canWritePayments={canWritePayments}
                        withApprovalsReadOnlyFallback={withApprovalsReadOnlyFallback}
                        withPaymentsReadOnlyFallback={withPaymentsReadOnlyFallback}
                    />
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceWorkflowsPage);
