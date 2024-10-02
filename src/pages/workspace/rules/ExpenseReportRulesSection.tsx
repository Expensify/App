import React from 'react';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import * as PolicyActions from '@userActions/Policy/Policy';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

type ExpenseReportRulesSectionProps = {
    policyID: string;
};

function ExpenseReportRulesSection({policyID}: ExpenseReportRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);

    const customReportNamesUnavailable = !policy?.areReportFieldsEnabled;
    // Auto-approvals and self-approvals are unavailable due to the policy workflows settings
    const workflowApprovalsUnavailable = PolicyUtils.getWorkflowApprovalsUnavailable(policy);
    const autoPayApprovedReportsUnavailable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

    const renderFallbackSubtitle = ({featureName, variant = 'unlock'}: {featureName: string; variant?: 'unlock' | 'enable'}) => {
        return (
            <Text style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.expenseReportRules.unlockFeatureGoToSubtitle')}</Text>{' '}
                <TextLink
                    style={styles.link}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_MORE_FEATURES.getRoute(policyID))}
                >
                    {translate('workspace.common.moreFeatures').toLowerCase()}
                </TextLink>{' '}
                {variant === 'unlock' ? (
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.expenseReportRules.unlockFeatureEnableWorkflowsSubtitle', {featureName})}</Text>
                ) : (
                    <Text style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.rules.expenseReportRules.enableFeatureSubtitle', {featureName})}</Text>
                )}
            </Text>
        );
    };

    const reportTitlePendingFields = policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.pendingFields ?? {};
    const optionItems = [
        {
            title: translate('workspace.rules.expenseReportRules.customReportNamesTitle'),
            subtitle: customReportNamesUnavailable
                ? renderFallbackSubtitle({featureName: translate('workspace.common.reportFields').toLowerCase(), variant: 'enable'})
                : translate('workspace.rules.expenseReportRules.customReportNamesSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.customReportNamesTitle'),
            isActive: policy?.shouldShowCustomReportTitleOption,
            disabled: customReportNamesUnavailable,
            showLockIcon: customReportNamesUnavailable,
            pendingAction: policy?.pendingFields?.shouldShowCustomReportTitleOption,
            onToggle: (isEnabled: boolean) => PolicyActions.enablePolicyDefaultReportTitle(policyID, isEnabled),
            subMenuItems: [
                <OfflineWithFeedback
                    pendingAction={!policy?.pendingFields?.shouldShowCustomReportTitleOption && reportTitlePendingFields.defaultValue ? reportTitlePendingFields.defaultValue : null}
                    key="customName"
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.expenseReportRules.customNameTitle')}
                        title={policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE].defaultValue}
                        shouldShowRightIcon
                        style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                        onPress={() => Navigation.navigate(ROUTES.RULES_CUSTOM_NAME.getRoute(policyID))}
                    />
                </OfflineWithFeedback>,
                <ToggleSettingOptionRow
                    pendingAction={!policy?.pendingFields?.shouldShowCustomReportTitleOption && reportTitlePendingFields.deletable ? reportTitlePendingFields.deletable : null}
                    key="preventMembersFromChangingCustomNames"
                    title={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')}
                    switchAccessibilityLabel={translate('workspace.rules.expenseReportRules.preventMembersFromChangingCustomNamesTitle')}
                    wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt6]}
                    titleStyle={styles.pv2}
                    isActive={!policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE].deletable}
                    onToggle={(isEnabled) => PolicyActions.setPolicyPreventMemberCreatedTitle(policyID, isEnabled)}
                />,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            subtitle: workflowApprovalsUnavailable
                ? renderFallbackSubtitle({featureName: translate('common.approvals').toLowerCase()})
                : translate('workspace.rules.expenseReportRules.preventSelfApprovalsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            isActive: policy?.preventSelfApproval && !workflowApprovalsUnavailable,
            disabled: workflowApprovalsUnavailable,
            showLockIcon: workflowApprovalsUnavailable,
            pendingAction: policy?.pendingFields?.preventSelfApproval,
            onToggle: (isEnabled: boolean) => PolicyActions.setPolicyPreventSelfApproval(policyID, isEnabled),
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            subtitle: workflowApprovalsUnavailable
                ? renderFallbackSubtitle({featureName: translate('common.approvals').toLowerCase()})
                : translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            isActive: policy?.shouldShowAutoApprovalOptions && !workflowApprovalsUnavailable,
            disabled: workflowApprovalsUnavailable,
            showLockIcon: workflowApprovalsUnavailable,
            pendingAction: policy?.pendingFields?.shouldShowAutoApprovalOptions,
            onToggle: (isEnabled: boolean) => {
                PolicyActions.enableAutoApprovalOptions(policyID, isEnabled);
            },
            subMenuItems: [
                <OfflineWithFeedback
                    pendingAction={!policy?.pendingFields?.shouldShowAutoApprovalOptions && policy?.autoApproval?.pendingFields?.limit ? policy?.autoApproval?.pendingFields?.limit : null}
                    key="autoApproveReportsUnder"
                >
                    <MenuItemWithTopDescription
                        description={translate('workspace.rules.expenseReportRules.autoApproveReportsUnderTitle')}
                        title={CurrencyUtils.convertToDisplayString(
                            policy?.autoApproval?.limit ?? CONST.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS,
                            policy?.outputCurrency ?? CONST.CURRENCY.USD,
                        )}
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
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            onToggle: (isEnabled: boolean) => {
                PolicyActions.enablePolicyAutoReimbursementLimit(policyID, isEnabled);
            },
            disabled: autoPayApprovedReportsUnavailable,
            showLockIcon: autoPayApprovedReportsUnavailable,
            isActive: policy?.shouldShowAutoReimbursementLimitOption && !autoPayApprovedReportsUnavailable,
            pendingAction: policy?.pendingFields?.shouldShowAutoReimbursementLimitOption,
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
                        title={CurrencyUtils.convertToDisplayString(
                            policy?.autoReimbursement?.limit ?? CONST.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS,
                            policy?.outputCurrency ?? CONST.CURRENCY.USD,
                        )}
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
            titleStyles={styles.accountSettingsSectionTitle}
            subtitleMuted
        >
            {optionItems.map(({title, subtitle, isActive, subMenuItems, showLockIcon, disabled, onToggle, pendingAction}, index) => {
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
                    />
                );
            })}
        </Section>
    );
}

export default ExpenseReportRulesSection;
