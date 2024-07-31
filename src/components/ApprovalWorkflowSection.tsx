import React, {useCallback} from 'react';
import {View} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type ApprovalWorkflow from '@src/types/onyx/ApprovalWorkflow';
import Icon from './Icon';
import * as Expensicons from './Icon/Expensicons';
import MenuItem from './MenuItem';
import PressableWithFeedback from './Pressable/PressableWithFeedback';
import Text from './Text';

function ApprovalWorkflowSection({approvalWorkflow, policyId}: {approvalWorkflow: ApprovalWorkflow; policyId?: string}) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate} = useLocalize();
    const openApprovalsEdit = useCallback(
        () => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EDIT.getRoute(policyId ?? '', approvalWorkflow.approvers[0].email)),
        [approvalWorkflow.approvers, policyId],
    );

    return (
        <PressableWithFeedback
            accessibilityRole="button"
            style={[styles.border, styles.p4, styles.flexRow, styles.justifyContentBetween, styles.mt6, styles.mbn3]}
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
                    interactive={false}
                    onPress={openApprovalsEdit}
                />

                {approvalWorkflow.approvers.map((approver) => (
                    <View key={approver.email}>
                        <View style={{height: 16, width: 1, backgroundColor: theme.border, marginLeft: 19}} />
                        <MenuItem
                            title={translate('workflowsPage.approver')}
                            style={styles.p0}
                            titleStyle={styles.textLabelSupportingNormal}
                            descriptionTextStyle={styles.textNormalThemeText}
                            description={approver.displayName}
                            icon={Expensicons.UserCheck}
                            iconHeight={20}
                            iconWidth={20}
                            iconFill={theme.icon}
                            interactive={false}
                            onPress={openApprovalsEdit}
                        />
                    </View>
                ))}
            </View>
            <Icon
                src={Expensicons.ArrowRight}
                fill={theme.icon}
                additionalStyles={[styles.alignSelfCenter]}
            />
        </PressableWithFeedback>
    );
}

export default ApprovalWorkflowSection;
