import React, {useCallback} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import ROUTES from '@src/ROUTES';
import type {ApprovalWorkflowOnyx} from '@src/types/onyx';

type ApprovalWorkflowEditorProps = {
    approvalWorkflow: ApprovalWorkflowOnyx;
    policyID: string;
};

function ApprovalWorkflowEditor({approvalWorkflow, policyID}: ApprovalWorkflowEditorProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleOrdinal} = useLocalize();

    const approverDescription = useCallback(
        (index: number) =>
            approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`,
        [approvalWorkflow.approvers.length, toLocaleOrdinal, translate],
    );
    const members = approvalWorkflow.isDefault ? translate('workspace.common.everyone') : approvalWorkflow.members.map((m) => m.displayName).join(', ');

    return (
        <ScrollView style={[styles.flex1]}>
            <View style={[styles.mh5]}>
                <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsCreateApprovalsPage.header')}</Text>

                <MenuItemWithTopDescription
                    title={members}
                    titleStyle={styles.textNormalThemeText}
                    description={translate('workflowsExpensesFromPage.title')}
                    descriptionTextStyle={!!members && styles.textLabelSupportingNormal}
                    onPress={() => Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(policyID, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)))}
                    shouldShowRightIcon
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                />

                {approvalWorkflow.approvers.map((approver, approverIndex) => {
                    const previousApprover = approvalWorkflow.approvers[approverIndex - 1];
                    const showHintText = approver?.isInMultipleWorkflows && !!previousApprover;
                    const hintText = showHintText
                        ? translate('workflowsPage.approverInMultipleWorkflows', {
                              name1: approver?.displayName,
                              name2: previousApprover.displayName,
                          })
                        : undefined;

                    const showErrorText = approver?.isCircularReference && !!previousApprover;
                    const errorText = showErrorText
                        ? translate('workflowsPage.approverCircularReference', {
                              name1: approver?.displayName,
                              name2: previousApprover.displayName,
                          })
                        : undefined;

                    return (
                        <MenuItemWithTopDescription
                            // eslint-disable-next-line react/no-array-index-key
                            key={`approver-${approver?.email}-${approverIndex}`}
                            title={approver?.displayName}
                            titleStyle={styles.textNormalThemeText}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                            description={approverDescription(approverIndex)}
                            descriptionTextStyle={!!approver?.displayName && styles.textLabelSupportingNormal}
                            onPress={() =>
                                Navigation.navigate(
                                    ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)),
                                )
                            }
                            shouldShowRightIcon
                            hintText={hintText}
                            shouldParseHintText
                            brickRoadIndicator={errorText ? 'error' : undefined}
                            errorText={errorText}
                            shouldParseErrorText
                        />
                    );
                })}

                <MenuItemWithTopDescription
                    description={translate('workflowsCreateApprovalsPage.addApproverRow')}
                    onPress={() =>
                        Navigation.navigate(
                            ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approvalWorkflow.approvers.length, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)),
                        )
                    }
                    shouldShowRightIcon
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                />
            </View>
        </ScrollView>
    );
}

ApprovalWorkflowEditor.displayName = 'ApprovalWorkflowEditor';

export default ApprovalWorkflowEditor;
