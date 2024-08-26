import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as ScrollViewRN} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ApprovalWorkflowOnyx, Policy} from '@src/types/onyx';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';

type ApprovalWorkflowEditorProps = {
    /** The approval workflow to display */
    approvalWorkflow: ApprovalWorkflowOnyx;

    /** Function to remove the approval workflow */
    removeApprovalWorkflow?: () => void;

    /** The policy for the current route */
    policy: OnyxEntry<Policy>;

    /** The policy ID */
    policyID: string;
};

function ApprovalWorkflowEditor({approvalWorkflow, removeApprovalWorkflow, policy, policyID}: ApprovalWorkflowEditorProps, ref: ForwardedRef<ScrollViewRN>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {translate, toLocaleOrdinal} = useLocalize();

    const approverDescription = useCallback(
        (index: number) =>
            approvalWorkflow.approvers.length > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`,
        [approvalWorkflow.approvers.length, toLocaleOrdinal, translate],
    );
    const members = approvalWorkflow.isDefault ? translate('workspace.common.everyone') : approvalWorkflow.members.map((m) => m.displayName).join(', ');

    const approverErrorMessage = useCallback(
        (approver: Approver | undefined, approverIndex: number) => {
            const previousApprover = approvalWorkflow.approvers.slice(0, approverIndex).filter(Boolean).at(-1);
            const error = approvalWorkflow?.errors?.[`approver-${approverIndex}`];

            if (!error) {
                return;
            }

            if (error === 'workflowsPage.approverCircularReference') {
                if (!previousApprover || !approver) {
                    return;
                }
                return translate('workflowsPage.approverCircularReference', {
                    name1: approver.displayName,
                    name2: previousApprover.displayName,
                });
            }

            return translate(error);
        },
        [approvalWorkflow.approvers, approvalWorkflow.errors, translate],
    );

    const approverHintMessage = useCallback(
        (approver: Approver | undefined, approverIndex: number) => {
            const previousApprover = approvalWorkflow.approvers.slice(0, approverIndex).filter(Boolean).at(-1);
            if (approver?.isInMultipleWorkflows && approver.email === previousApprover?.forwardsTo) {
                return translate('workflowsPage.approverInMultipleWorkflows', {
                    name1: approver.displayName,
                    name2: previousApprover.displayName,
                });
            }
        },
        [approvalWorkflow.approvers, translate],
    );

    const editMembers = useCallback(() => {
        const backTo = approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE ? ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID) : undefined;
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(policyID, backTo));
    }, [approvalWorkflow.action, policyID]);

    const editApprover = useCallback(
        (approverIndex: number) => {
            const backTo = approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE ? ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID) : undefined;
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex, backTo));
        },
        [approvalWorkflow.action, policyID],
    );

    // User should be allowed to add additional approver only if they upgraded to Control Plan, otherwise redirected to the Upgrade Page
    const addAdditionalApprover = useCallback(() => {
        if (!PolicyUtils.isControlPolicy(policy)) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, Navigation.getActiveRoute()));
            return;
        }
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approvalWorkflow.approvers.length, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)));
    }, [approvalWorkflow.approvers.length, policy, policyID]);

    return (
        <ScrollView
            style={[styles.flex1]}
            ref={ref}
        >
            <View style={[styles.mh5]}>
                {approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE && (
                    <Text style={[styles.textHeadlineH1, styles.mv3]}>{translate('workflowsCreateApprovalsPage.header')}</Text>
                )}

                <MenuItemWithTopDescription
                    title={members}
                    titleStyle={styles.textNormalThemeText}
                    description={translate('workflowsExpensesFromPage.title')}
                    descriptionTextStyle={!!members && styles.textLabelSupportingNormal}
                    onPress={editMembers}
                    wrapperStyle={[styles.sectionMenuItemTopDescription]}
                    errorText={approvalWorkflow?.errors?.members ? translate(approvalWorkflow.errors.members) : undefined}
                    brickRoadIndicator={approvalWorkflow?.errors?.members ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                    shouldShowRightIcon={!approvalWorkflow.isDefault}
                    interactive={!approvalWorkflow.isDefault}
                />

                {approvalWorkflow.approvers.map((approver, approverIndex) => {
                    const errorText = approverErrorMessage(approver, approverIndex);
                    const hintText = !errorText && approverHintMessage(approver, approverIndex);
                    return (
                        <MenuItemWithTopDescription
                            // eslint-disable-next-line react/no-array-index-key
                            key={`approver-${approver?.email}-${approverIndex}`}
                            title={approver?.displayName}
                            titleStyle={styles.textNormalThemeText}
                            wrapperStyle={styles.sectionMenuItemTopDescription}
                            description={approverDescription(approverIndex)}
                            descriptionTextStyle={!!approver?.displayName && styles.textLabelSupportingNormal}
                            onPress={() => editApprover(approverIndex)}
                            shouldShowRightIcon
                            hintText={hintText}
                            shouldRenderHintAsHTML
                            brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                            errorText={errorText}
                            shouldRenderErrorAsHTML
                        />
                    );
                })}

                <MenuItemWithTopDescription
                    description={translate('workflowsCreateApprovalsPage.additionalApprover')}
                    onPress={addAdditionalApprover}
                    shouldShowRightIcon
                    wrapperStyle={styles.sectionMenuItemTopDescription}
                    errorText={approvalWorkflow?.errors?.additionalApprover ? translate(approvalWorkflow.errors.additionalApprover) : undefined}
                    brickRoadIndicator={approvalWorkflow?.errors?.additionalApprover ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                />

                {removeApprovalWorkflow && !approvalWorkflow.isDefault && (
                    <MenuItem
                        wrapperStyle={[styles.sectionMenuItemTopDescription, styles.mt6]}
                        icon={Expensicons.Trashcan}
                        iconFill={theme.icon}
                        title={translate('common.delete')}
                        onPress={removeApprovalWorkflow}
                    />
                )}
            </View>
        </ScrollView>
    );
}

ApprovalWorkflowEditor.displayName = 'ApprovalWorkflowEditor';

export default forwardRef(ApprovalWorkflowEditor);
