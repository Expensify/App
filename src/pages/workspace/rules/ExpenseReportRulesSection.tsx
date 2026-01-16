import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {getWorkflowApprovalsUnavailable, isControlPolicy} from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {enableAutoApprovalOptions, enablePolicyAutoReimbursementLimit, setPolicyPreventSelfApproval} from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ExpenseReportRulesSectionProps = {
    policyID: string;
};

function ExpenseReportRulesSection({policyID}: ExpenseReportRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const {environmentURL} = useEnvironment();
    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const autoPayApprovedReportsUnavailable =
        !policy?.areWorkflowsEnabled || policy?.reimbursementChoice !== CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES || !policy?.achAccount?.bankAccountID;

    const renderFallbackSubtitle = ({featureName, variant = 'unlock'}: {featureName: string; variant?: 'unlock' | 'enable'}) => {
        const moreFeaturesLink = `${environmentURL}/${ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID)}`;
        if (variant === 'unlock') {
            return translate('workspace.rules.expenseReportRules.unlockFeatureEnableWorkflowsSubtitle', featureName);
        }
        return translate('workspace.rules.expenseReportRules.enableFeatureSubtitle', featureName, moreFeaturesLink);
    };

    const optionItems = [
        {
            title: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            subtitle: workflowApprovalsUnavailable
                ? renderFallbackSubtitle({featureName: translate('common.approvals').toLowerCase()})
                : translate('workspace.rules.expenseReportRules.preventSelfApprovalsSubtitle'),
            shouldParseSubtitle: workflowApprovalsUnavailable,
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            isActive: policy?.preventSelfApproval,
            disabled: workflowApprovalsUnavailable,
            showLockIcon: workflowApprovalsUnavailable,
            pendingAction: policy?.pendingFields?.preventSelfApproval ?? policy?.pendingAction,
            onToggle: (isEnabled: boolean) => {
                if (isEnabled && !isControlPolicy(policy)) {
                    Navigation.navigate(
                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.preventSelfApproval.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)),
                    );
                    return;
                }

                setPolicyPreventSelfApproval(policyID, isEnabled);
            },
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            subtitle: workflowApprovalsUnavailable
                ? renderFallbackSubtitle({featureName: translate('common.approvals').toLowerCase()})
                : translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsSubtitle'),
            shouldParseSubtitle: workflowApprovalsUnavailable,
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            isActive: policy?.shouldShowAutoApprovalOptions && !workflowApprovalsUnavailable,
            disabled: workflowApprovalsUnavailable,
            showLockIcon: workflowApprovalsUnavailable,
            pendingAction: policy?.pendingFields?.shouldShowAutoApprovalOptions ?? policy?.pendingAction,
            onToggle: (isEnabled: boolean) => {
                if (isEnabled && !isControlPolicy(policy)) {
                    Navigation.navigate(
                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoApproveCompliantReports.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)),
                    );
                    return;
                }

                enableAutoApprovalOptions(policyID, isEnabled);
            },
            subMenuItems: [
                <OfflineWithFeedback
                    pendingAction={!policy?.pendingFields?.shouldShowAutoApprovalOptions && policy?.autoApproval?.pendingFields?.limit ? policy?.autoApproval?.pendingFields?.limit : null}
                    key="autoApproveReportsUnder"
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.expenseReportRules.autoApproveReportsUnderTitle')}
                        title={convertToDisplayString(policy?.autoApproval?.limit ?? CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS, policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                        shouldShowRightIcon
                        style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                        onPress={() => Navigation.navigate(ROUTES.RULES_AUTO_APPROVE_REPORTS_UNDER.getRoute(policyID))}
                    />
                </OfflineWithFeedback>,
                <OfflineWithFeedback
                    pendingAction={
                        !policy?.pendingFields?.shouldShowAutoApprovalOptions && policy?.autoApproval?.pendingFields?.auditRate ? policy?.autoApproval?.pendingFields?.auditRate : null
                    }
                    key="randomReportAuditTitle"
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.expenseReportRules.randomReportAuditTitle')}
                        title={`${Math.round((policy?.autoApproval?.auditRate ?? CONST.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE) * 100)}%`}
                        shouldShowRightIcon
                        style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                        onPress={() => Navigation.navigate(ROUTES.RULES_RANDOM_REPORT_AUDIT.getRoute(policyID))}
                    />
                </OfflineWithFeedback>,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            subtitle: autoPayApprovedReportsUnavailable
                ? renderFallbackSubtitle({featureName: translate('common.payments').toLowerCase()})
                : translate('workspace.rules.expenseReportRules.autoPayApprovedReportsSubtitle'),
            shouldParseSubtitle: autoPayApprovedReportsUnavailable,
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            onToggle: (isEnabled: boolean) => {
                if (isEnabled && !isControlPolicy(policy)) {
                    Navigation.navigate(
                        ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.autoPayApprovedReports.alias, ROUTES.WORKSPACE_WORKFLOWS.getRoute(policyID)),
                    );
                    return;
                }

                enablePolicyAutoReimbursementLimit(policyID, isEnabled);
            },
            disabled: autoPayApprovedReportsUnavailable,
            showLockIcon: autoPayApprovedReportsUnavailable,
            isActive: policy?.shouldShowAutoReimbursementLimitOption && !autoPayApprovedReportsUnavailable,
            pendingAction: policy?.pendingFields?.shouldShowAutoReimbursementLimitOption ?? policy?.pendingAction,
            subMenuItems: [
                <OfflineWithFeedback
                    pendingAction={
                        !policy?.pendingFields?.shouldShowAutoReimbursementLimitOption && policy?.autoReimbursement?.pendingFields?.limit
                            ? policy?.autoReimbursement?.pendingFields?.limit
                            : null
                    }
                    key="autoPayReportsUnder"
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.expenseReportRules.autoPayReportsUnderTitle')}
                        title={convertToDisplayString(policy?.autoReimbursement?.limit ?? CONST.POLICY.AUTO_REIMBURSEMENT_LIMIT_DEFAULT_CENTS, policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                        shouldShowRightIcon
                        style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                        onPress={() => Navigation.navigate(ROUTES.RULES_AUTO_PAY_REPORTS_UNDER.getRoute(policyID))}
                    />
                </OfflineWithFeedback>,
            ],
        },
    ];

    return (
        <Section
            isCentralPane
            title={translate('workspace.rules.expenseReportRules.title')}
            subtitle={translate('workspace.rules.expenseReportRules.subtitle')}
            titleStyles={[styles.accountSettingsSectionTitle, policy?.pendingAction && styles.opacitySemiTransparent]}
            subtitleTextStyles={policy?.pendingAction ? styles.opacitySemiTransparent : undefined}
            subtitleMuted
        >
            {optionItems.map(({title, subtitle, shouldParseSubtitle, isActive, subMenuItems, showLockIcon, disabled, onToggle, pendingAction}, index) => {
                const showBorderBottom = index !== optionItems.length - 1;

                return (
                    <ToggleSettingOptionRow
                        key={title}
                        title={title}
                        subtitle={subtitle}
                        switchAccessibilityLabel={title}
                        wrapperStyle={[styles.pv6, showBorderBottom && styles.borderBottom]}
                        shouldPlaceSubtitleBelowSwitch
                        titleStyle={styles.pv2}
                        subtitleStyle={styles.pt1}
                        isActive={!!isActive}
                        showLockIcon={showLockIcon}
                        disabled={disabled}
                        subMenuItems={subMenuItems}
                        onToggle={onToggle}
                        pendingAction={pendingAction}
                        shouldParseSubtitle={shouldParseSubtitle}
                    />
                );
            })}
        </Section>
    );
}

export default ExpenseReportRulesSection;
