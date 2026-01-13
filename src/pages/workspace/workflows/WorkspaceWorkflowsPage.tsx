import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {InteractionManager, View} from 'react-native';
import type {TupleToUnion} from 'type-fest';
import ActivityIndicator from '@components/ActivityIndicator';
import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import ConfirmModal from '@components/ConfirmModal';
import Icon from '@components/Icon';
import getBankIcon from '@components/Icon/BankIcons';
import type {BankName} from '@components/Icon/BankIconsUtils';
import {LockedAccountContext} from '@components/LockedAccountModalProvider';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import RenderHTML from '@components/RenderHTML';
import Section from '@components/Section';
import Text from '@components/Text';
import useCardFeeds from '@hooks/useCardFeeds';
import {useMemoizedLazyExpensifyIcons, useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    clearPolicyErrorField,
    isCurrencySupportedForDirectReimbursement,
    isCurrencySupportedForGlobalReimbursement,
    openPolicyWorkflowsPage,
    setWorkspaceApprovalMode,
    setWorkspaceAutoHarvesting,
    setWorkspaceReimbursement,
} from '@libs/actions/Policy/Policy';
import {setApprovalWorkflow} from '@libs/actions/Workflow';
import {isBankAccountPartiallySetup} from '@libs/BankAccountUtils';
import {getAllCardsForWorkspace, isSmartLimitEnabled as isSmartLimitEnabledUtil} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {
    getCorrectedAutoReportingFrequency,
    hasDynamicExternalWorkflow,
    isControlPolicy,
    isPaidGroupPolicy as isPaidGroupPolicyUtil,
    isPolicyAdmin as isPolicyAdminUtil,
} from '@libs/PolicyUtils';
import {hasInProgressVBBA} from '@libs/ReimbursementAccountUtils';
import {convertPolicyEmployeesToApprovalWorkflows, getEligibleExistingBusinessBankAccounts, INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import ExpenseReportRulesSection from '@pages/workspace/rules/ExpenseReportRulesSection';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {getPaymentMethods} from '@userActions/PaymentMethods';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import {getAutoReportingFrequencyDisplayNames} from './WorkspaceAutoReportingFrequencyPage';

type WorkspaceWorkflowsPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

function WorkspaceWorkflowsPage({policy, route}: WorkspaceWorkflowsPageProps) {
    const {translate, localeCompare} = useLocalize();
    const styles = useThemeStyles();
    const theme = useTheme();
    const illustrations = useMemoizedLazyIllustrations(['Workflows']);
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['DotIndicator', 'Info', 'Plus']);
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply a correct padding style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardFeeds] = useCardFeeds(policy?.id);
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const [bankAccountList] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST, {canBeMissing: true});
    const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID, {canBeMissing: true});
    const workspaceCards = getAllCardsForWorkspace(workspaceAccountID, cardList, cardFeeds);
    const isSmartLimitEnabled = isSmartLimitEnabledUtil(workspaceCards);
    const [isUpdateWorkspaceCurrencyModalOpen, setIsUpdateWorkspaceCurrencyModalOpen] = useState(false);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {canBeMissing: true});
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const [isDisableApprovalsConfirmModalOpen, setIsDisableApprovalsConfirmModalOpen] = useState(false);
    const {approvalWorkflows, availableMembers, usedApproverEmails} = useMemo(
        () =>
            convertPolicyEmployeesToApprovalWorkflows({
                policy,
                personalDetails: personalDetails ?? {},
                localeCompare,
            }),
        [personalDetails, policy, localeCompare],
    );

    const hasValidExistingAccounts = getEligibleExistingBusinessBankAccounts(bankAccountList, policy?.outputCurrency, true).length > 0;

    const isAdvanceApproval = (approvalWorkflows.length > 1 || (approvalWorkflows?.at(0)?.approvers ?? []).length > 1) && isControlPolicy(policy);
    const updateApprovalMode = isAdvanceApproval ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC;
    const displayNameForAuthorizedPayer = useMemo(
        () => getPersonalDetailByEmail(policy?.achAccount?.reimburser ?? '')?.displayName ?? policy?.achAccount?.reimburser,
        [policy?.achAccount?.reimburser],
    );

    const isNonUSDWorkspace = policy?.outputCurrency !== CONST.CURRENCY.USD;
    const achData = reimbursementAccount?.achData;
    const nonUSDCountryDraftValue = reimbursementAccountDraft?.country ?? '';

    const shouldShowContinueModal = useMemo(() => {
        return hasInProgressVBBA(achData, isNonUSDWorkspace, nonUSDCountryDraftValue);
    }, [achData, isNonUSDWorkspace, nonUSDCountryDraftValue]);

    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(route.params.policyID)), [route.params.policyID]);

    const fetchData = useCallback(() => {
        openPolicyWorkflowsPage(route.params.policyID);
        getPaymentMethods(true);
    }, [route.params.policyID]);

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }

        setIsUpdateWorkspaceCurrencyModalOpen(false);
        Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id, true));
    }, [policy]);

    const {isOffline} = useNetwork({onReconnect: fetchData});
    const isPolicyAdmin = isPolicyAdminUtil(policy);

    const {isAccountLocked, showLockedAccountModal} = useContext(LockedAccountContext);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            fetchData();
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const confirmDisableApprovals = useCallback(() => {
        setIsDisableApprovalsConfirmModalOpen(false);
        setWorkspaceApprovalMode(route.params.policyID, policy?.owner ?? '', CONST.POLICY.APPROVAL_MODE.OPTIONAL);
    }, [route.params.policyID, policy?.owner]);

    // User should be allowed to add new Approval Workflow only if he's upgraded to Control Plan, otherwise redirected to the Upgrade Page
    const addApprovalAction = useCallback(() => {
        setApprovalWorkflow({
            ...INITIAL_APPROVAL_WORKFLOW,
            availableMembers,
            usedApproverEmails,
        });

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
    }, [policy, route.params.policyID, availableMembers, usedApproverEmails]);

    const filteredApprovalWorkflows = useMemo(() => {
        if (policy?.approvalMode === CONST.POLICY.APPROVAL_MODE.ADVANCED) {
            return approvalWorkflows;
        }
        return approvalWorkflows.filter((workflow) => workflow.isDefault);
    }, [policy?.approvalMode, approvalWorkflows]);

    const isDEWEnabled = hasDynamicExternalWorkflow(policy);

    const optionItems: ToggleSettingOptionRowProps[] = useMemo(() => {
        const isBankAccountFullySetup = policy?.achAccount && policy?.achAccount.state === CONST.BANK_ACCOUNT.STATE.OPEN;
        const bankAccountConnectedToWorkspace = Object.values(bankAccountList ?? {}).find((account) => account?.accountData?.additionalData?.policyID === policy?.id);
        const bankName = isBankAccountFullySetup ? (policy?.achAccount?.bankName ?? '') : (bankAccountConnectedToWorkspace?.accountData?.additionalData?.bankName ?? '');
        const addressName = isBankAccountFullySetup ? (policy?.achAccount?.addressName ?? '') : (bankAccountConnectedToWorkspace?.accountData?.addressName ?? '');
        const accountData = isBankAccountFullySetup ? policy?.achAccount : bankAccountConnectedToWorkspace?.accountData;
        const bankTitle = addressName.includes(CONST.MASKED_PAN_PREFIX) ? bankName : addressName;
        const state = isBankAccountFullySetup ? (policy?.achAccount?.state ?? '') : (bankAccountConnectedToWorkspace?.accountData?.state ?? '');
        const isAccountInSetupState = isBankAccountPartiallySetup(state);

        const shouldShowBankAccount = (!!isBankAccountFullySetup || !!bankAccountConnectedToWorkspace) && policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

        const bankIcon = getBankIcon({bankName: bankName as BankName, isCard: false, styles});

        const hasReimburserError = !!policy?.errorFields?.reimburser;
        const hasApprovalError = !!policy?.errorFields?.approvalMode;
        const hasDelayedSubmissionError = !!(policy?.errorFields?.autoReporting ?? policy?.errorFields?.autoReportingFrequency);

        return [
            {
                title: translate('workflowsPage.submissionFrequency'),
                subtitle: translate('workflowsPage.submissionFrequencyDescription'),
                switchAccessibilityLabel: translate('workflowsPage.submissionFrequencyDescription'),
                onToggle: (isEnabled: boolean) => (policy ? setWorkspaceAutoHarvesting(policy, isEnabled) : undefined),
                subMenuItems: (
                    <MenuItemWithTopDescription
                        title={getAutoReportingFrequencyDisplayNames(translate)[getCorrectedAutoReportingFrequency(policy) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY]}
                        titleStyle={styles.textNormalThemeText}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        onPress={onPressAutoReportingFrequency}
                        // Instant submit is the equivalent of delayed submissions being turned off, so we show the feature as disabled if the frequency is instant
                        description={translate('common.frequency')}
                        shouldShowRightIcon
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                        brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                ),
                isActive: (policy?.autoReporting && !hasDelayedSubmissionError) ?? false,
                pendingAction: policy?.pendingFields?.autoReporting ?? policy?.pendingFields?.autoReportingFrequency,
                errors: getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
                onCloseError: () => clearPolicyErrorField(route.params.policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
            },
            {
                title: translate('workflowsPage.addApprovalsTitle'),
                subtitle: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                switchAccessibilityLabel: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                onToggle: (isEnabled: boolean) => {
                    if (!isEnabled) {
                        setIsDisableApprovalsConfirmModalOpen(true);
                        return;
                    }
                    setWorkspaceApprovalMode(route.params.policyID, policy?.owner ?? '', isEnabled ? updateApprovalMode : CONST.POLICY.APPROVAL_MODE.OPTIONAL);
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
                        {filteredApprovalWorkflows.map((workflow, index) => (
                            <OfflineWithFeedback
                                // eslint-disable-next-line react/no-array-index-key
                                key={`workflow-${index}`}
                                pendingAction={workflow.pendingAction}
                            >
                                <ApprovalWorkflowSection
                                    approvalWorkflow={workflow}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, workflow.approvers.at(0)?.email ?? ''))}
                                    currency={policy?.outputCurrency}
                                />
                            </OfflineWithFeedback>
                        ))}
                        <MenuItem
                            title={translate('workflowsPage.addApprovalButton')}
                            titleStyle={styles.textStrong}
                            icon={expensifyIcons.Plus}
                            iconHeight={20}
                            iconWidth={20}
                            style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                            onPress={addApprovalAction}
                        />
                    </>
                ),
                disabled: isSmartLimitEnabled || isDEWEnabled,
                isActive:
                    isDEWEnabled ||
                    (([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policy?.approvalMode) && !hasApprovalError) ?? false),
                pendingAction: policy?.pendingFields?.approvalMode,
                errors: getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
                onCloseError: () => clearPolicyErrorField(route.params.policyID, CONST.POLICY.COLLECTION_KEYS.APPROVAL_MODE),
            },
            {
                title: translate('workflowsPage.makeOrTrackPaymentsTitle'),
                subtitle: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                switchAccessibilityLabel: translate('workflowsPage.makeOrTrackPaymentsDescription'),
                onToggle: (isEnabled: boolean) => {
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
                        reimbursementChoice: newReimbursementChoice,
                        reimburserEmail: newReimburserEmail ?? '',
                    });
                },
                subMenuItems:
                    !isOffline && policy?.isLoadingWorkspaceReimbursement === true ? (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            style={styles.mt7}
                        />
                    ) : (
                        <>
                            {shouldShowBankAccount ? (
                                <>
                                    <View style={[styles.sectionMenuItemTopDescription, styles.mt5, styles.pb1, styles.pt1]}>
                                        <Text style={[styles.textLabelSupportingNormal, styles.colorMuted]}>{translate('workflowsPayerPage.paymentAccount')}</Text>
                                    </View>
                                    <MenuItem
                                        title={bankTitle}
                                        description={getPaymentMethodDescription(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, accountData, translate)}
                                        onPress={() => {
                                            if (isAccountLocked) {
                                                showLockedAccountModal();
                                                return;
                                            }
                                            navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
                                        }}
                                        displayInDefaultIconColor
                                        icon={bankIcon.icon}
                                        iconHeight={bankIcon.iconHeight ?? bankIcon.iconSize}
                                        iconWidth={bankIcon.iconWidth ?? bankIcon.iconSize}
                                        iconStyles={bankIcon.iconStyles}
                                        disabled={isOffline || !isPolicyAdmin}
                                        badgeText={isAccountInSetupState ? translate('common.actionRequired') : undefined}
                                        badgeIcon={isAccountInSetupState ? expensifyIcons.DotIndicator : undefined}
                                        badgeSuccess={isAccountInSetupState ? true : undefined}
                                        shouldShowRightIcon={isAccountInSetupState}
                                        shouldGreyOutWhenDisabled={!policy?.pendingFields?.reimbursementChoice}
                                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                        brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                    />
                                </>
                            ) : (
                                <MenuItem
                                    title={translate('bankAccount.addBankAccount')}
                                    titleStyle={styles.textStrong}
                                    onPress={() => {
                                        if (isAccountLocked) {
                                            showLockedAccountModal();
                                            return;
                                        }
                                        if (!isCurrencySupportedForGlobalReimbursement((policy?.outputCurrency ?? '') as CurrencyType)) {
                                            setIsUpdateWorkspaceCurrencyModalOpen(true);
                                            return;
                                        }
                                        if (!shouldShowBankAccount && hasValidExistingAccounts && !shouldShowContinueModal) {
                                            Navigation.navigate(ROUTES.BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT.getRoute(route.params.policyID));
                                            return;
                                        }
                                        navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
                                    }}
                                    icon={expensifyIcons.Plus}
                                    iconHeight={20}
                                    iconWidth={20}
                                    disabled={isOffline || !isPolicyAdmin}
                                    shouldGreyOutWhenDisabled={!policy?.pendingFields?.reimbursementChoice}
                                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                    brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                                />
                            )}
                            {shouldShowBankAccount && !isAccountInSetupState && (
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
                                        shouldShowRightIcon
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
            },
        ];
    }, [
        policy,
        bankAccountList,
        styles,
        theme,
        translate,
        onPressAutoReportingFrequency,
        isSmartLimitEnabled,
        filteredApprovalWorkflows,
        addApprovalAction,
        isOffline,
        isPolicyAdmin,
        displayNameForAuthorizedPayer,
        route.params.policyID,
        updateApprovalMode,
        isAccountLocked,
        hasValidExistingAccounts,
        shouldShowContinueModal,
        showLockedAccountModal,
        isDEWEnabled,
        shouldUseNarrowLayout,
        accountManagerReportID,
        expensifyIcons,
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
            />
        </Section>
    );

    const updateWorkspaceCurrencyPrompt = (
        <View style={[styles.renderHTML, styles.flexRow]}>
            <RenderHTML html={translate('workspace.bankAccount.yourWorkspace')} />
        </View>
    );

    const isPaidGroupPolicy = isPaidGroupPolicyUtil(policy);
    const isLoading = !!(policy?.isLoading && policy?.reimbursementChoice === undefined);

    return (
        <AccessOrNotFoundWrapper
            policyID={route.params.policyID}
            featureName={CONST.POLICY.MORE_FEATURES.ARE_WORKFLOWS_ENABLED}
        >
            <WorkspacePageWithSections
                headerText={translate('workspace.common.workflows')}
                icon={illustrations.Workflows}
                route={route}
                shouldShowOfflineIndicatorInWideScreen
                shouldShowNotFoundPage={!isPaidGroupPolicy || !isPolicyAdmin}
                isLoading={isLoading}
                shouldShowLoading={isLoading}
                shouldUseScrollView
                addBottomSafeAreaPadding
            >
                <View style={[styles.mt3, shouldUseNarrowLayout ? styles.workspaceSectionMobile : styles.workspaceSection]}>
                    {optionItems.map(renderOptionItem)}
                    <ExpenseReportRulesSection policyID={route.params.policyID} />
                    <ConfirmModal
                        title={translate('workspace.bankAccount.workspaceCurrencyNotSupported')}
                        isVisible={isUpdateWorkspaceCurrencyModalOpen}
                        onConfirm={confirmCurrencyChangeAndHideModal}
                        onCancel={() => setIsUpdateWorkspaceCurrencyModalOpen(false)}
                        prompt={updateWorkspaceCurrencyPrompt}
                        confirmText={translate('workspace.bankAccount.updateWorkspaceCurrency')}
                        cancelText={translate('common.cancel')}
                    />
                </View>
                <ConfirmModal
                    title={translate('workspace.bankAccount.areYouSure')}
                    isVisible={isDisableApprovalsConfirmModalOpen}
                    onConfirm={confirmDisableApprovals}
                    onCancel={() => setIsDisableApprovalsConfirmModalOpen(false)}
                    prompt={translate('workflowsPage.disableApprovalPromptDescription')}
                    confirmText={translate('common.disable')}
                    cancelText={translate('common.cancel')}
                    danger
                />
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

export default withPolicy(WorkspaceWorkflowsPage);
