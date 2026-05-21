import {Str} from 'expensify-common';
import React from 'react';
import {View} from 'react-native';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import usePermissions from '@hooks/usePermissions';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {sortAlphabetically} from '@libs/OptionsListUtils';
import {getApprovalLimitDescription} from '@libs/WorkflowUtils';
import CONST from '@src/CONST';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import Button from './Button';
import Icon from './Icon';
import MenuItem from './MenuItem';
import Text from './Text';
import UserPill from './UserPill';
import UserPills from './UserPills';

type ApprovalWorkflowSectionProps = {
    /** Single workflow displayed in this component */
    approvalWorkflow: ApprovalWorkflow;

    /** A function that is called when the Edit pill is pressed */
    onPress?: () => void;

    /** A function that is called when the Add agent pill is pressed */
    onAddAgentPress?: () => void;

    /**
     * Whether the Add agent pill is allowed on this card. It is still gated by the
     * customAgent beta on top of this flag.
     */
    canAddAgent?: boolean;

    /** Currency used for formatting approval limits */
    currency?: string;

    /** Whether the workflow should be shown as read-only */
    isDisabled?: boolean;
};

function ApprovalWorkflowSection({approvalWorkflow, onPress, onAddAgentPress, canAddAgent = false, currency = CONST.CURRENCY.USD, isDisabled = false}: ApprovalWorkflowSectionProps) {
    const icons = useMemoizedLazyExpensifyIcons(['Lightbulb', 'Users', 'UserCheck', 'Pencil', 'Bot']);
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleOrdinal, localeCompare} = useLocalize();
    const {convertToDisplayString} = useCurrencyListActions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isBetaEnabled} = usePermissions();
    const isCustomAgentEnabled = isBetaEnabled(CONST.BETAS.CUSTOM_AGENT);
    const shouldShowAddAgentButton = canAddAgent && isCustomAgentEnabled && !isDisabled && !!onAddAgentPress;

    const approverTitle = (index: number) =>
        approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`;

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
                                <UserPills users={memberPills} />
                            </View>
                        ) : undefined
                    }
                    sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.WORKFLOWS.APPROVAL_SECTION_EXPENSES_FROM}
                />

                {approvalWorkflow.approvers.map((approver, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <View key={`approver-${approver.email}-${index}`}>
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
                    {shouldShowAddAgentButton && (
                        <Button
                            small
                            icon={icons.Bot}
                            text={translate('workflowsPage.addAgentAction')}
                            onPress={onAddAgentPress}
                            accessibilityLabel={translate('workflowsPage.addAgentAction')}
                            sentryLabel={CONST.SENTRY_LABEL.WORKSPACE.APPROVAL_WORKFLOW_SECTION}
                        />
                    )}
                </View>
            )}
        </View>
    );
}

export default ApprovalWorkflowSection;
