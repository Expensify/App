import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getApprovalLimitDescription} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import Button from './Button';
import Icon from './Icon';
import MenuItem from './MenuItem';
import OfflineWithFeedback from './OfflineWithFeedback';
import Text from './Text';
import UserPill from './UserPill';
import UserPills from './UserPills';

type ApprovalWorkflowSectionProps = {
    /** Single workflow displayed in this component */
    approvalWorkflow: ApprovalWorkflow;

    /** A function that is called when the Edit pill is pressed */
    onPress?: () => void;

    /** Called when the "+X more" text inside the members row is pressed — deep-links to the members list (skips the Edit RHP). */
    onShowAllMembersPress?: () => void;

    /**
     * Called when the X is clicked on an approver row that carries `approver.errors`. The page
     * uses this to discard the failed optimistic agent (clears the deferred-save entry, the
     * optimistic personal detail / prompt, and the policy-level addAgent error).
     */
    onDismissApproverError?: (approver: Approver) => void;

    /** Currency used for formatting approval limits */
    currency?: string;

    /** Whether the workflow should be shown as read-only */
    isDisabled?: boolean;

    /** HR provider display name, used in advanced (manager) mode to show "Manager (from {provider})" */
    hrProviderName?: string;

    /** When true, uses HR advanced (manager) mode labels: "Manager (from {provider})" then "Final approver" */
    isHRAdvancedMode?: boolean;

    /** Email of the configured final approver in HR advanced (manager) mode, used to correctly label a sole approver who is the final approver */
    hrFinalApproverEmail?: string;
};

function ApprovalWorkflowSection({
    approvalWorkflow,
    onPress,
    onShowAllMembersPress,
    onDismissApproverError,
    currency = CONST.CURRENCY.USD,
    isDisabled = false,
    hrProviderName,
    isHRAdvancedMode = false,
    hrFinalApproverEmail,
}: ApprovalWorkflowSectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['ArrowRight', 'Lightbulb', 'Pencil', 'Users', 'UserCheck']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleOrdinal, localeCompare} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const approverTitle = (index: number) => {
        if (isHRAdvancedMode) {
            const isLast = index === approvalWorkflow.approvers.length - 1;
            const approver = approvalWorkflow.approvers.at(index);
            const isConfiguredFinalApprover = !!hrFinalApproverEmail && approver?.email === hrFinalApproverEmail;
            if (isLast && isConfiguredFinalApprover) {
                return translate('workflowsPage.finalApprover');
            }
            if (approvalWorkflow.approvers.length <= 1) {
                return translate('workflowsPage.approver');
            }
            const fromProviderSuffix = hrProviderName ? ` (${translate('workflowsPage.approverFromProvider', {provider: hrProviderName})})` : '';
            return `${translate('workflowsPage.manager')}${fromProviderSuffix}`;
        }
        return approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : translate('workflowsPage.approver');
    };

    const sortedMembers = approvalWorkflow.isDefault ? [] : sortAlphabetically(approvalWorkflow.members, 'displayName', localeCompare);

    const members = approvalWorkflow.isDefault ? translate('workspace.common.everyone') : sortedMembers.map((m) => Str.removeSMSDomain(m.displayName)).join(', ');

    const memberPills = sortedMembers.map((m) => ({
        avatar: m.avatar,
        displayName: m.displayName,
        email: m.email,
    }));
    const pressAction = isDisabled ? undefined : onPress;
    const accessibilityLabel = translate('workflowsPage.accessibilityLabel', {
        members,
        approvers: approvalWorkflow?.approvers.map((approver) => Str.removeSMSDomain(approver?.displayName ?? '')).join(', '),
    });

    return (
        <View
            accessibilityLabel={accessibilityLabel}
            style={[styles.border, shouldUseNarrowLayout ? styles.p3 : styles.p4, styles.mt6, styles.mbn3]}
        >
            <View style={[styles.flex1]}>
                {approvalWorkflow.isDefault && (
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                        <Icon
                            src={icons.Lightbulb}
                            fill={theme.icon}
                            additionalStyles={styles.mr2}
                            small
                        />
                        <Text
                            style={[styles.textLabelSupportingNormal]}
                            suppressHighlighting
                        >
                            {translate('workflowsPage.addApprovalTip')}
                        </Text>
                    </View>
                )}
                <MenuItem
                    title={translate('workflowsExpensesFromPage.title')}
                    style={styles.p0}
                    titleStyle={styles.textLabelSupportingNormal}
                    descriptionTextStyle={[styles.textNormalThemeText, styles.lineHeightXLarge]}
                    description={approvalWorkflow.isDefault ? members : undefined}
                    numberOfLinesDescription={4}
                    shouldBeAccessible={false}
                    tabIndex={-1}
                    icon={icons.Users}
                    iconHeight={20}
                    iconWidth={20}
                    iconFill={theme.icon}
                    onPress={pressAction}
                    shouldRemoveBackground
                    titleComponent={
                        !approvalWorkflow.isDefault ? (
                            <View style={styles.ml3}>
                                {!isDisabled && onShowAllMembersPress ? (
                                    <UserPills
                                        users={memberPills}
                                        onShowAllPress={onShowAllMembersPress}
                                        showAllSentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_SECTION_SHOW_ALL_MEMBERS}
                                    />
                                ) : (
                                    <UserPills users={memberPills} />
                                )}
                            </View>
                        ) : undefined
                    }
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_SECTION_EXPENSES_FROM}
                />

                {approvalWorkflow.approvers.map((approver, index) => (
                    <OfflineWithFeedback
                        // eslint-disable-next-line react/no-array-index-key
                        key={`approver-${approver.email || approver.accountID}-${index}`}
                        pendingAction={approver.pendingAction}
                        errors={approver.errors}
                        onClose={approver.errors && onDismissApproverError ? () => onDismissApproverError(approver) : undefined}
                    >
                        <View>
                            <View style={styles.workflowApprovalVerticalLine} />
                            <MenuItem
                                title={approverTitle(index)}
                                style={styles.p0}
                                titleStyle={styles.textLabelSupportingNormal}
                                descriptionTextStyle={[styles.textNormalThemeText, styles.lineHeightXLarge]}
                                icon={icons.UserCheck}
                                shouldBeAccessible={false}
                                tabIndex={-1}
                                iconHeight={20}
                                iconWidth={20}
                                numberOfLinesDescription={1}
                                iconFill={theme.icon}
                                onPress={pressAction}
                                shouldRemoveBackground
                                titleComponent={
                                    <View style={[styles.ml3, styles.pr3]}>
                                        <UserPill
                                            avatar={approver.avatar}
                                            displayName={approver.displayName}
                                            email={approver.email}
                                            style={styles.userPillStandalone}
                                        />
                                    </View>
                                }
                                helperText={getApprovalLimitDescription({approver, currency, translate, convertToDisplayString})}
                                helperTextStyle={styles.workflowApprovalLimitText}
                                sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_SECTION_APPROVER}
                            />
                        </View>
                    </OfflineWithFeedback>
                ))}
            </View>
            {!isDisabled && (
                <View style={[styles.flexRow, styles.alignItemsCenter, styles.mt4, styles.gap2]}>
                    <Button
                        small
                        icon={icons.Pencil}
                        text={translate('workflowsPage.editWorkflowAction')}
                        onPress={onPress}
                        accessibilityLabel={translate('workflowsPage.editWorkflowAction')}
                        sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.APPROVAL_WORKFLOW_SECTION}
                    />
                </View>
            )}
        </View>
    );
}

export default ApprovalWorkflowSection;
