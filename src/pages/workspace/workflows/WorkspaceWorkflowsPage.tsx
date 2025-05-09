import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {ActivityIndicator, InteractionManager, View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {TupleToUnion} from 'type-fest';
import ApprovalWorkflowSection from '@components/ApprovalWorkflowSection';
import ConfirmModal from '@components/ConfirmModal';
import getBankIcon from '@components/Icon/BankIcons';
import type {BankName} from '@components/Icon/BankIconsUtils';
import {Plus} from '@components/Icon/Expensicons';
import {Workflows} from '@components/Icon/Illustrations';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {
    clearPolicyErrorField,
    isCurrencySupportedForDirectReimbursement,
    isCurrencySupportedForGlobalReimbursement,
    openPolicyWorkflowsPage,
    setIsForcedToChangeCurrency,
    setWorkspaceApprovalMode,
    setWorkspaceAutoReportingFrequency,
    setWorkspaceReimbursement,
    updateGeneralSettings,
} from '@libs/actions/Policy/Policy';
import {setApprovalWorkflow} from '@libs/actions/Workflow';
import {getAllCardsForWorkspace, isSmartLimitEnabled as isSmartLimitEnabledUtil} from '@libs/CardUtils';
import {getLatestErrorField} from '@libs/ErrorUtils';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import {getPaymentMethodDescription} from '@libs/PaymentUtils';
import {getPersonalDetailByEmail} from '@libs/PersonalDetailsUtils';
import {getCorrectedAutoReportingFrequency, isControlPolicy, isPaidGroupPolicy as isPaidGroupPolicyUtil, isPolicyAdmin as isPolicyAdminUtil} from '@libs/PolicyUtils';
import {convertPolicyEmployeesToApprovalWorkflows, INITIAL_APPROVAL_WORKFLOW} from '@libs/WorkflowUtils';
import type {WorkspaceSplitNavigatorParamList} from '@navigation/types';
import AccessOrNotFoundWrapper from '@pages/workspace/AccessOrNotFoundWrapper';
import type {WithPolicyProps} from '@pages/workspace/withPolicy';
import withPolicy from '@pages/workspace/withPolicy';
import WorkspacePageWithSections from '@pages/workspace/WorkspacePageWithSections';
import {navigateToBankAccountRoute} from '@userActions/ReimbursementAccount';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import type {ToggleSettingOptionRowProps} from './ToggleSettingsOptionRow';
import ToggleSettingOptionRow from './ToggleSettingsOptionRow';
import type {AutoReportingFrequencyKey} from './WorkspaceAutoReportingFrequencyPage';
import {getAutoReportingFrequencyDisplayNames} from './WorkspaceAutoReportingFrequencyPage';

type WorkspaceWorkflowsPageProps = WithPolicyProps & PlatformStackScreenProps<WorkspaceSplitNavigatorParamList, typeof SCREENS.WORKSPACE.WORKFLOWS>;
type CurrencyType = TupleToUnion<typeof CONST.DIRECT_REIMBURSEMENT_CURRENCIES>;

function WorkspaceWorkflowsPage({policy, route}: WorkspaceWorkflowsPageProps) {
    const {translate, preferredLocale} = useLocalize();
    const theme = useTheme();
    const styles = useThemeStyles();

    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to apply a correct padding style
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {shouldUseNarrowLayout, isSmallScreenWidth} = useResponsiveLayout();
    const workspaceAccountID = policy?.workspaceAccountID ?? CONST.DEFAULT_NUMBER_ID;
    const [cardList] = useOnyx(`${ONYXKEYS.COLLECTION.WORKSPACE_CARDS_LIST}`, {canBeMissing: false});
    const workspaceCards = getAllCardsForWorkspace(workspaceAccountID, cardList);
    const isSmartLimitEnabled = isSmartLimitEnabledUtil(workspaceCards);
    const policyApproverEmail = policy?.approver;
    const [isUpdateWorkspaceCurrencyModalOpen, setIsUpdateWorkspaceCurrencyModalOpen] = useState(false);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST, {canBeMissing: false});
    const {approvalWorkflows, availableMembers, usedApproverEmails} = useMemo(
        () =>
            convertPolicyEmployeesToApprovalWorkflows({
                employees: policy?.employeeList ?? {},
                defaultApprover: policyApproverEmail ?? policy?.owner ?? '',
                personalDetails: personalDetails ?? {},
            }),
        [personalDetails, policy?.employeeList, policy?.owner, policyApproverEmail],
    );
    const {canUseGlobalReimbursementsOnND} = usePermissions();

    const isAdvanceApproval = approvalWorkflows.length > 1 || (approvalWorkflows?.at(0)?.approvers ?? []).length > 1;
    const updateApprovalMode = isAdvanceApproval ? CONST.POLICY.APPROVAL_MODE.ADVANCED : CONST.POLICY.APPROVAL_MODE.BASIC;
    const displayNameForAuthorizedPayer = useMemo(
        () => getPersonalDetailByEmail(policy?.achAccount?.reimburser ?? '')?.displayName ?? policy?.achAccount?.reimburser,
        [policy?.achAccount?.reimburser],
    );

    const onPressAutoReportingFrequency = useCallback(() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY.getRoute(route.params.policyID)), [route.params.policyID]);

    const fetchData = useCallback(() => {
        openPolicyWorkflowsPage(route.params.policyID);
    }, [route.params.policyID]);

    const confirmCurrencyChangeAndHideModal = useCallback(() => {
        if (!policy) {
            return;
        }

        setIsUpdateWorkspaceCurrencyModalOpen(false);

        if (canUseGlobalReimbursementsOnND) {
            setIsForcedToChangeCurrency(true);
            Navigation.navigate(ROUTES.WORKSPACE_OVERVIEW_CURRENCY.getRoute(policy.id));
        } else {
            updateGeneralSettings(policy.id, policy.name, CONST.CURRENCY.USD);
            navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
        }
    }, [canUseGlobalReimbursementsOnND, policy, route.params.policyID]);

    const {isOffline} = useNetwork({onReconnect: fetchData});
    const isPolicyAdmin = isPolicyAdminUtil(policy);

    useEffect(() => {
        InteractionManager.runAfterInteractions(() => {
            fetchData();
        });
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

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

    const optionItems: ToggleSettingOptionRowProps[] = useMemo(() => {
        const {addressName, bankName, bankAccountID} = policy?.achAccount ?? {};
        const shouldShowBankAccount = !!bankAccountID && policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;
        const bankIcon = getBankIcon({bankName: bankName as BankName, isCard: false, styles});

        const hasReimburserError = !!policy?.errorFields?.reimburser;
        const hasApprovalError = !!policy?.errorFields?.approvalMode;
        const hasDelayedSubmissionError = !!policy?.errorFields?.autoReporting ?? !!policy?.errorFields?.autoReportingFrequency;

        return [
            {
                title: translate('workflowsPage.delaySubmissionTitle'),
                subtitle: translate('workflowsPage.delaySubmissionDescription'),
                switchAccessibilityLabel: translate('workflowsPage.delaySubmissionDescription'),
                onToggle: (isEnabled: boolean) => {
                    setWorkspaceAutoReportingFrequency(route.params.policyID, isEnabled ? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY : CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT);
                },
                subMenuItems: (
                    <MenuItemWithTopDescription
                        title={
                            getAutoReportingFrequencyDisplayNames(preferredLocale)[
                                (getCorrectedAutoReportingFrequency(policy) as AutoReportingFrequencyKey) ?? CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY
                            ]
                        }
                        titleStyle={styles.textNormalThemeText}
                        descriptionTextStyle={styles.textLabelSupportingNormal}
                        onPress={onPressAutoReportingFrequency}
                        // Instant submit is the equivalent of delayed submissions being turned off, so we show the feature as disabled if the frequency is instant
                        description={translate('workflowsPage.submissionFrequency')}
                        shouldShowRightIcon
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                        brickRoadIndicator={hasDelayedSubmissionError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    />
                ),
                isActive: (policy?.autoReportingFrequency !== CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT && !hasDelayedSubmissionError) ?? false,
                pendingAction: policy?.pendingFields?.autoReporting ?? policy?.pendingFields?.autoReportingFrequency,
                errors: getLatestErrorField(policy ?? {}, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
                onCloseError: () => clearPolicyErrorField(route.params.policyID, CONST.POLICY.COLLECTION_KEYS.AUTOREPORTING),
            },
            {
                title: translate('workflowsPage.addApprovalsTitle'),
                subtitle: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                switchAccessibilityLabel: isSmartLimitEnabled ? translate('workspace.moreFeatures.workflows.disableApprovalPrompt') : translate('workflowsPage.addApprovalsDescription'),
                onToggle: (isEnabled: boolean) => {
                    setWorkspaceApprovalMode(route.params.policyID, policy?.owner ?? '', isEnabled ? updateApprovalMode : CONST.POLICY.APPROVAL_MODE.OPTIONAL);
                },
                subMenuItems: (
                    <>
                        {approvalWorkflows.map((workflow, index) => (
                            <OfflineWithFeedback
                                // eslint-disable-next-line react/no-array-index-key
                                key={`workflow-${index}`}
                                pendingAction={workflow.pendingAction}
                            >
                                <ApprovalWorkflowSection
                                    approvalWorkflow={workflow}
                                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(route.params.policyID, workflow.approvers.at(0)?.email ?? ''))}
                                />
                            </OfflineWithFeedback>
                        ))}
                        <MenuItem
                            title={translate('workflowsPage.addApprovalButton')}
                            titleStyle={styles.textStrong}
                            icon={Plus}
                            iconHeight={20}
                            iconWidth={20}
                            style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                            onPress={addApprovalAction}
                        />
                    </>
                ),
                disabled: isSmartLimitEnabled,
                isActive:
                    ([CONST.POLICY.APPROVAL_MODE.BASIC, CONST.POLICY.APPROVAL_MODE.ADVANCED].some((approvalMode) => approvalMode === policy?.approvalMode) && !hasApprovalError) ?? false,
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
                    setWorkspaceReimbursement(route.params.policyID, newReimbursementChoice, newReimburserEmail ?? '');
                },
                subMenuItems:
                    !isOffline && policy?.isLoadingWorkspaceReimbursement === true ? (
                        <ActivityIndicator
                            size={CONST.ACTIVITY_INDICATOR_SIZE.LARGE}
                            color={theme.spinner}
                            style={styles.mt7}
                        />
                    ) : (
                        <>
                            {shouldShowBankAccount && (
                                <View style={[styles.sectionMenuItemTopDescription, styles.mt5, styles.pb1, styles.pt1]}>
                                    <Text style={[styles.textLabelSupportingNormal, styles.colorMuted]}>{translate('workflowsPayerPage.paymentAccount')}</Text>
                                </View>
                            )}
                            <MenuItem
                                title={shouldShowBankAccount ? addressName : translate('workflowsPage.connectBankAccount')}
                                titleStyle={shouldShowBankAccount ? undefined : styles.textLabelSupportingEmptyValue}
                                description={getPaymentMethodDescription(CONST.PAYMENT_METHODS.BUSINESS_BANK_ACCOUNT, policy?.achAccount ?? {})}
                                onPress={() => {
                                    if (!isCurrencySupportedForGlobalReimbursement((policy?.outputCurrency ?? '') as CurrencyType, canUseGlobalReimbursementsOnND ?? false)) {
                                        setIsUpdateWorkspaceCurrencyModalOpen(true);
                                        return;
                                    }
                                    navigateToBankAccountRoute(route.params.policyID, ROUTES.WORKSPACE_WORKFLOWS.getRoute(route.params.policyID));
                                }}
                                icon={shouldShowBankAccount ? bankIcon.icon : undefined}
                                iconHeight={bankIcon.iconHeight ?? bankIcon.iconSize}
                                iconWidth={bankIcon.iconWidth ?? bankIcon.iconSize}
                                iconStyles={bankIcon.iconStyles}
                                disabled={isOffline || !isPolicyAdmin}
                                shouldGreyOutWhenDisabled={!policy?.pendingFields?.reimbursementChoice}
                                shouldShowRightIcon={!isOffline && isPolicyAdmin}
                                wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt3, styles.mbn3]}
                                displayInDefaultIconColor
                                brickRoadIndicator={hasReimburserError ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            />
                            {shouldShowBankAccount && (
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
        styles,
        translate,
        preferredLocale,
        onPressAutoReportingFrequency,
        isSmartLimitEnabled,
        approvalWorkflows,
        addApprovalAction,
        isOffline,
        theme.spinner,
        isPolicyAdmin,
        displayNameForAuthorizedPayer,
        route.params.policyID,
        updateApprovalMode,
        canUseGlobalReimbursementsOnND,
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
        <Text>
            {translate('workspace.bankAccount.yourWorkspace')}{' '}
            <TextLink href={CONST.CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL}>{translate('workspace.bankAccount.listOfSupportedCurrencies')}</TextLink>.
        </Text>
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
                icon={Workflows}
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
                    {canUseGlobalReimbursementsOnND ? (
                        <ConfirmModal
                            title={translate('workspace.bankAccount.workspaceCurrencyNotSupported')}
                            isVisible={isUpdateWorkspaceCurrencyModalOpen}
                            onConfirm={confirmCurrencyChangeAndHideModal}
                            onCancel={() => setIsUpdateWorkspaceCurrencyModalOpen(false)}
                            prompt={updateWorkspaceCurrencyPrompt}
                            confirmText={translate('workspace.bankAccount.updateWorkspaceCurrency')}
                            cancelText={translate('common.cancel')}
                        />
                    ) : (
                        <ConfirmModal
                            title={translate('workspace.bankAccount.workspaceCurrency')}
                            isVisible={isUpdateWorkspaceCurrencyModalOpen}
                            onConfirm={confirmCurrencyChangeAndHideModal}
                            onCancel={() => setIsUpdateWorkspaceCurrencyModalOpen(false)}
                            prompt={translate('workspace.bankAccount.updateCurrencyPrompt')}
                            confirmText={translate('workspace.bankAccount.updateToUSD')}
                            cancelText={translate('common.cancel')}
                            danger
                        />
                    )}
                </View>
            </WorkspacePageWithSections>
        </AccessOrNotFoundWrapper>
    );
}

WorkspaceWorkflowsPage.displayName = 'WorkspaceWorkflowsPage';

export default withPolicy(WorkspaceWorkflowsPage);
