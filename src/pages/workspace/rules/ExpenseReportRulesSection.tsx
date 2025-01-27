import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import ConfirmModal from '@components/ConfirmModal';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import Section from '@components/Section';
import Text from '@components/Text';
import TextLink from '@components/TextLink';
import useLocalize from '@hooks/useLocalize';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import Navigation from '@libs/Navigation/Navigation';
import {canEnablePreventSelfApprovals, getAllSelfApprovers, getWorkflowApprovalsUnavailable} from '@libs/PolicyUtils';
import {convertPolicyEmployeesToApprovalWorkflows} from '@libs/WorkflowUtils';
import ToggleSettingOptionRow from '@pages/workspace/workflows/ToggleSettingsOptionRow';
import {
    enableAutoApprovalOptions,
    enablePolicyAutoReimbursementLimit,
    enablePolicyDefaultReportTitle,
    setPolicyPreventMemberCreatedTitle,
    setPolicyPreventSelfApproval,
} from '@userActions/Policy/Policy';
import {updateApprovalWorkflow} from '@userActions/Workflow';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {Approver, Member} from '@src/types/onyx/ApprovalWorkflow';

type ExpenseReportRulesSectionProps = {
    policyID: string;
};

function ExpenseReportRulesSection({policyID}: ExpenseReportRulesSectionProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const policy = usePolicy(policyID);
    const [personalDetails] = useOnyx(ONYXKEYS.PERSONAL_DETAILS_LIST);
    const customReportNamesUnavailable = !policy?.areReportFieldsEnabled;
    // Auto-approvals and self-approvals are unavailable due to the policy workflows settings
    const workflowApprovalsUnavailable = getWorkflowApprovalsUnavailable(policy);
    const autoPayApprovedReportsUnavailable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

    const [isPreventSelfApprovalsModalVisible, setIsPreventSelfApprovalsModalVisible] = useState(false);
    const isPreventSelfApprovalsDisabled = !canEnablePreventSelfApprovals(policy) && !policy?.preventSelfApproval;
    const selfApproversEmails = getAllSelfApprovers(policy);

    function handleTogglePreventSelfApprovals(isEnabled: boolean) {
        if (!isEnabled) {
            setPolicyPreventSelfApproval(policyID, false);
            return;
        }

        if (selfApproversEmails.length === 0) {
            setPolicyPreventSelfApproval(policyID, true);
        } else {
            setIsPreventSelfApprovalsModalVisible(true);
        }
    }

    const {currentApprovalWorkflows, defaultWorkflowMembers, usedApproverEmails} = useMemo(() => {
        if (!policy || !personalDetails) {
            return {};
        }

        const defaultApprover = policy?.approver ?? policy.owner;
        const result = convertPolicyEmployeesToApprovalWorkflows({
            employees: policy.employeeList ?? {},
            defaultApprover,
            personalDetails,
        });

        return {
            defaultWorkflowMembers: result.availableMembers,
            usedApproverEmails: result.usedApproverEmails,
            currentApprovalWorkflows: result.approvalWorkflows.filter((workflow) => !workflow.isDefault),
        };
    }, [personalDetails, policy]);

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
            onToggle: (isEnabled: boolean) => enablePolicyDefaultReportTitle(policyID, isEnabled),
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
                    onToggle={(isEnabled) => setPolicyPreventMemberCreatedTitle(policyID, isEnabled)}
                />,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            subtitle: (() => {
                if (workflowApprovalsUnavailable) {
                    return renderFallbackSubtitle({featureName: translate('common.approvals').toLowerCase()});
                }
                if (isPreventSelfApprovalsDisabled) {
                    return translate('workspace.rules.expenseReportRules.preventSelfApprovalsDisabledSubtitle');
                }
                return translate('workspace.rules.expenseReportRules.preventSelfApprovalsSubtitle');
            })(),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            isActive: policy?.preventSelfApproval && !workflowApprovalsUnavailable,
            disabled: workflowApprovalsUnavailable || isPreventSelfApprovalsDisabled,
            showLockIcon: workflowApprovalsUnavailable || isPreventSelfApprovalsDisabled,
            pendingAction: policy?.pendingFields?.preventSelfApproval,
            onToggle: (isEnabled: boolean) => handleTogglePreventSelfApprovals(isEnabled),
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
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            onToggle: (isEnabled: boolean) => {
                enablePolicyAutoReimbursementLimit(policyID, isEnabled);
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
                        title={convertToDisplayString(policy?.autoReimbursement?.limit ?? CONST.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS, policy?.outputCurrency ?? CONST.CURRENCY.USD)}
                        shouldShowRightIcon
                        style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]}
                        onPress={() => Navigation.navigate(ROUTES.RULES_AUTO_PAY_REPORTS_UNDER.getRoute(policyID))}
                    />
                </OfflineWithFeedback>,
            ],
        },
    ];

    return (
        <>
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
            <ConfirmModal
                isVisible={isPreventSelfApprovalsModalVisible}
                title={translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle')}
                prompt={translate('workspace.rules.expenseReportRules.preventSelfApprovalsModalText', {
                    managerEmail: policy?.approver ?? '',
                })}
                confirmText={translate('workspace.rules.expenseReportRules.preventSelfApprovalsConfirmButton')}
                cancelText={translate('common.cancel')}
                onConfirm={() => {
                    setPolicyPreventSelfApproval(policyID, true);

                    const defaultApprover = policy?.approver ?? policy?.owner;
                    if (!defaultApprover) {
                        setIsPreventSelfApprovalsModalVisible(false);
                        return;
                    }

                    currentApprovalWorkflows?.forEach((workflow: ApprovalWorkflow) => {
                        const oldApprovers = workflow.approvers ?? [];
                        const approversToRemove = oldApprovers.filter((approver: Approver) => selfApproversEmails.includes(approver?.email));
                        const newApprovers = oldApprovers.filter((approver: Approver) => !selfApproversEmails.includes(approver?.email));

                        if (!newApprovers.some((a) => a.email === defaultApprover)) {
                            newApprovers.unshift({
                                email: defaultApprover,
                                displayName: defaultApprover,
                            });
                        }

                        const oldMembers = workflow.members ?? [];
                        const newMembers = oldMembers.map((member: Member) => {
                            const isSelfApprover = selfApproversEmails.includes(member.email);
                            return isSelfApprover ? {...member, submitsTo: defaultApprover} : member;
                        });

                        const newWorkflow = {
                            ...workflow,
                            approvers: newApprovers,
                            availableMembers: [...workflow.members, ...defaultWorkflowMembers],
                            members: newMembers,
                            usedApproverEmails,
                            isDefault: workflow.isDefault ?? false,
                            action: CONST.APPROVAL_WORKFLOW.ACTION.EDIT,
                            errors: null,
                        };

                        const membersToRemove: Member[] = [];

                        updateApprovalWorkflow(policyID, newWorkflow, membersToRemove, approversToRemove);
                    });
                    setIsPreventSelfApprovalsModalVisible(false);
                }}
                onCancel={() => setIsPreventSelfApprovalsModalVisible(false)}
            />
        </>
    );
}

export default ExpenseReportRulesSection;
