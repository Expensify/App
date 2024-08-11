import React, {useCallback} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MenuItem from './MenuItem';
import PressableWithoutFeedback from './Pressable/PressableWithoutFeedback';
import Text from './Text';

type ApprovalWorkflowSectionProps = {
    /** Single workflow displayed in this component */
    approvalWorkflow: ApprovalWorkflow;

    /** ID of the policy */
    policyId?: string;
};

function ApprovalWorkflowSection({approvalWorkflow, policyId}: ApprovalWorkflowSectionProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleOrdinal} = useLocalize();
    const {isSmallScreenWidth} = useWindowDimensions();
    const openApprovalsEdit = useCallback(
        () => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyId ?? '', approvalWorkflow.approvers[0].email)),
        [approvalWorkflow.approvers, policyId],
    );
    const approverTitle = useCallback(
        (index: number) =>
            approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`,
        [approvalWorkflow.approvers.length, toLocaleOrdinal, translate],
    );

    return (
        <PressableWithoutFeedback
            accessibilityRole="button"
            style={[styles.border, isSmallScreenWidth ? styles.p3 : styles.p4, styles.flexRow, styles.justifyContentBetween, styles.mt6, styles.mbn3]}
            onPress={openApprovalsEdit}
            accessibilityLabel={translate('workflowsPage.addApprovalsTitle')}
        >
            <View style={[styles.flex1]}>
                {approvalWorkflow.isDefault && (
                    <View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                        <Icon
                            src={Expensicons.Lightbulb}
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
                    descriptionTextStyle={styles.textNormalThemeText}
                    description={approvalWorkflow.isDefault ? translate('workspace.common.everyone') : approvalWorkflow.members.map((m) => m.displayName).join(', ')}
                    icon={Expensicons.Users}
                    iconHeight={20}
                    iconWidth={20}
                    iconFill={theme.icon}
                    onPress={openApprovalsEdit}
                    shouldRemoveBackground
                />

                {approvalWorkflow.approvers.map((approver, index) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <View key={`approver-${approver.email}-${index}`}>
                        <View style={styles.workflowApprovalVerticalLine} />
                        <MenuItem
                            title={approverTitle(index)}
                            style={styles.p0}
                            titleStyle={styles.textLabelSupportingNormal}
                            descriptionTextStyle={styles.textNormalThemeText}
                            description={approver.displayName}
                            icon={Expensicons.UserCheck}
                            iconHeight={20}
                            iconWidth={20}
                            iconFill={theme.icon}
                            onPress={openApprovalsEdit}
                            shouldRemoveBackground
                        />
                    </View>
                ))}
            </View>
            <Icon
                src={Expensicons.ArrowRight}
                fill={theme.icon}
                additionalStyles={[styles.alignSelfCenter]}
            />
        </PressableWithoutFeedback>
    );
}

export default ApprovalWorkflowSection;
