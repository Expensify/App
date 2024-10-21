import type {ForwardedRef} from 'react';
import React, {forwardRef, useCallback, useMemo} from 'react';
import {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import type {ScrollView as ScrollViewRN} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import * as Expensicons from '@components/Icon/Expensicons';
import MenuItem from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScrollView from '@components/ScrollView';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import * as OptionsListUtils from '@libs/OptionsListUtils';
import * as PolicyUtils from '@libs/PolicyUtils';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {ApprovalWorkflowOnyx, Policy} from '@src/types/onyx';
import type {Approver} from '@src/types/onyx/ApprovalWorkflow';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

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
    const {translate, toLocaleOrdinal} = useLocalize();
    const approverCount = approvalWorkflow.approvers.length;

    const approverDescription = useCallback(
        (index: number) => (approverCount > 1 ? `${toLocaleOrdinal(index + 1, true)} ${translate('workflowsPage.approver').toLowerCase()}` : `${translate('workflowsPage.approver')}`),
        [approverCount, toLocaleOrdinal, translate],
    );

    const getApprovalPendingAction = useCallback(
        (index: number) => {
            let pendingAction: PendingAction | undefined;
            if (index === 0) {
                approvalWorkflow?.members?.forEach((member) => {
                    pendingAction = pendingAction ?? member.pendingFields?.submitsTo;
                });
                return pendingAction;
            }
            const previousApprover = approvalWorkflow?.approvers.at(index - 1);
            const previousMember = approvalWorkflow?.members?.find((member) => member?.email === previousApprover?.email);
            return previousMember?.pendingFields?.forwardsTo;
        },
        [approvalWorkflow],
    );

    const members = useMemo(() => {
        if (approvalWorkflow.isDefault) {
            return translate('workspace.common.everyone');
        }

        return OptionsListUtils.sortAlphabetically(approvalWorkflow.members, 'displayName')
            .map((m) => m.displayName)
            .join(', ');
    }, [approvalWorkflow.isDefault, approvalWorkflow.members, translate]);

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

    const editMembers = useCallback(() => {
        const backTo = approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE ? ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID) : undefined;
        Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM.getRoute(policyID, backTo), CONST.NAVIGATION.ACTION_TYPE.PUSH);
    }, [approvalWorkflow.action, policyID]);

    const editApprover = useCallback(
        (approverIndex: number) => {
            const backTo = approvalWorkflow.action === CONST.APPROVAL_WORKFLOW.ACTION.CREATE ? ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID) : undefined;
            Navigation.navigate(ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverIndex, backTo), CONST.NAVIGATION.ACTION_TYPE.PUSH);
        },
        [approvalWorkflow.action, policyID],
    );

    // User should be allowed to add additional approver only if they upgraded to Control Plan, otherwise redirected to the Upgrade Page
    const addAdditionalApprover = useCallback(() => {
        if (!PolicyUtils.isControlPolicy(policy) && approverCount > 0) {
            Navigation.navigate(ROUTES.WORKSPACE_UPGRADE.getRoute(policyID, CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvals.alias, Navigation.getActiveRoute()));
            return;
        }
        Navigation.navigate(
            ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_APPROVER.getRoute(policyID, approverCount, ROUTES.WORKSPACE_WORKFLOWS_APPROVALS_NEW.getRoute(policyID)),
            CONST.NAVIGATION.ACTION_TYPE.PUSH,
        );
    }, [approverCount, policy, policyID]);

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
                    numberOfLinesTitle={4}
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
                    const hintText =
                        !errorText && approvalWorkflow.usedApproverEmails.some((approverEmail) => approverEmail === approver?.email)
                            ? translate('workflowsPage.approverInMultipleWorkflows')
                            : undefined;

                    return (
                        <OfflineWithFeedback pendingAction={getApprovalPendingAction(approverIndex)}>
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
                        </OfflineWithFeedback>
                    );
                })}

                <MenuItemWithTopDescription
                    description={approverCount > 0 ? translate('workflowsCreateApprovalsPage.additionalApprover') : translate('workflowsPage.approver')}
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
